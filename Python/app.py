from fastapi import FastAPI, UploadFile, File, Form, Request
from typing import List
import uvicorn
from io import BytesIO
from threading import Thread
from controller import S3Controller,NSFWController
from cronjob import queue_money, event
app = FastAPI()
s3_client = S3Controller()
nsfw = NSFWController()
@app.post("/upload_file")
async def upload(file: UploadFile = File(...), folder: str = Form(...)):
    object_name = f"uploads/{folder}/{file.filename}"

    # Đọc nội dung file vào bộ nhớ
    file_content = BytesIO(await file.read())

    file_url = s3_client.add(file_content,object_name)

    return {"url": file_url}

@app.post("/upload_files")
async def uploads(files: List[UploadFile] = File(...),folder: str = Form(...)):
    print(files)
    for file in files:
        print(f"Name: {file.filename}, Type: {file.content_type}")
    object_name = f"uploads/{folder}/"
    file_contents = []
    for file in files:
        byte_file = BytesIO(await file.read())
        if (file.content_type == "image/jpeg" or file.content_type == "image/png" or file.content_type == "image/webp"):
            print(f"{file.filename}: {nsfw.detect(byte_file)}")
        file_contents.append({
            "file": byte_file,
            "filename": file.filename
        })
        # print(file_contents)
        # print(type(BytesIO(await file.read())))
    files = s3_client.uploads(file_contents,object_name)
    return files
    # return "Xong"


@app.post("/delete_file")
async def delete(request: Request):
    data = await request.json()

    s3_client.delete(data['path'])

    return {"status": True}

@app.post("/delete_files")
async def deletes(request: Request):
    data = await request.json()
    # print(data)
    s3_client.deletes(data['paths'])
    return {'status': True}

@app.on_event("startup")
def start_background_thread():
    Thread(target=queue_money, args=(), daemon=True).start()

@app.on_event("shutdown")
def stop_background_thread():
    print("Shutting down, stopping background thread...")
    event.set()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)