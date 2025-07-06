from fastapi import FastAPI, UploadFile, File, Form, Request
from typing import List
import uvicorn
from io import BytesIO
from threading import Thread
from controller import S3Controller
from cronjob import queue_money, event
app = FastAPI()
s3_client = S3Controller()

@app.post("/upload_file")
async def upload(image: UploadFile = File(...), folder: str = Form(...)):
    
    object_name = f"uploads/{folder}/{image.filename}"

    # Đọc nội dung file vào bộ nhớ
    file_content = BytesIO(await image.read())

    file_url = s3_client.add(file_content,object_name)

    return {"url": file_url}

@app.post("/upload_files")
async def uploads(images: List[UploadFile] = File(...),folder: str = Form(...)):
    object_name = f"uploads/{folder}/"
    image_contents = []
    for image in images:
        image_contents.append({
            "image": BytesIO(await image.read()),
            "filename": image.filename
        })
    files = s3_client.uploads(image_contents,object_name)
    return files


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
