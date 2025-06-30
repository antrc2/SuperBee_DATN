from fastapi import FastAPI, UploadFile, File, Form, Request
from typing import List
import uvicorn
from io import BytesIO
from controller.S3Controller import S3Controller
app = FastAPI()
s3_client = S3Controller()


@app.post("/upload_file")
async def upload(image: UploadFile = File(...), folder: str = Form(...)):
    
    object_name = f"uploads/{folder}/{image.filename}"

    # Đọc nội dung file vào bộ nhớ
    file_content = BytesIO(await image.read())

    file_url = s3_client.add(file_content,object_name)

    return {"url": file_url}

# @app.post("/upload_files")
# async def uploads(images: List[UploadFile] = File(...)):


@app.post("/delete_file")
async def delete(request: Request):
    data = await request.json()

    s3_client.delete(data['path'])

    return {"status": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
