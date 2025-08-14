from fastapi import FastAPI, UploadFile, File, Form, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
from threading import Thread
from controller.S3Controller import S3Controller
from cronjob import queue_money, event
from controller.TransactionController import getListBank
from controller.AssistantController import chat
from cronjob.withdraw import withdraw
import os
# from controller.NewsAgent import generate_and_post_article

 
from dotenv import load_dotenv
load_dotenv()

username = os.getenv("MBBANK_USERNAME")
password = os.getenv("MBBANK_PASSWORD")
app = FastAPI()
s3_client = S3Controller()




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc ["*"] nếu muốn cho mọi nguồn truy cập
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/assistant/chat")
async def doibuonjqk(request: Request):
    auth_headers = request.headers.get("Authorization")
    data = await request.json()
    return StreamingResponse(
        chat(data['messages'],auth_headers),
        media_type="text/event-stream",
        headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'X-Accel-Buffering': 'no'
            }
    )



@app.get('/transaction/bank_list')
async def getBankList():
    return {
        "status": True,
        "message": "Lấy danh sách ngân hàng thành công",
        "data": getListBank()
    }


# @app.get('/transaction/bulk_payment')
# async def get_bulk_payment():
#     transaction = Transaction(username=username,password=password)
#     bulks = transaction.getBulkPaymentStatus()
#     return {
#         "status": True,
#         'message': "Lấy danh sách chuyển tiền theo lô thành công",
#         'data': bulks
#     }

# @app.get('/transaction/bulk_payment_detail/{id}')
# async def get_bulk_payment_detail(id: str):
#     transaction = Transaction(username=username,password=password)
#     bulk_detail = transaction.getBulkPaymentDetail(id) 
#     return {
#         'status': True,
#         'message': "Xem chi tiết chuyển tiền theo lô thành công",
#         "data": bulk_detail
#     }


@app.post("/upload_file")
async def upload(file: UploadFile = File(...), folder: str = Form(...),thread: bool = Form(...)):
    object_name = f"uploads/{folder}/"

    # # Đọc nội dung file vào bộ nhớ
    # file_content = BytesIO(await file.read())

    response = await s3_client.add(file,object_name,thread)

    return response 

@app.post("/upload_files")
async def uploads(files: List[UploadFile] = File(...),folder: str = Form(...), thread: bool = Form(...)):
    object_name = f"uploads/{folder}/"
    # print(files)
    # for file in files:
    #     print(f"Name: {file.filename}, Type: {file.content_type}")
    
    # file_contents = []
    # for file in files:
        # print(file.)
    #     byte_file = BytesIO(await file.read())
    #     if (file.content_type == "image/jpeg" or file.content_type == "image/png" or file.content_type == "image/webp"):
    #         print(f"{file.filename}: {nsfw.detect(byte_file)}")
    #     file_contents.append({
    #         "file": byte_file,
    #         "filename": file.filename
    #     })
        # print(file_contents)
        # print(type(BytesIO(await file.read())))
    response = await s3_client.uploads(files,object_name,thread)
    return response
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
    Thread(target=withdraw,args=(),daemon=True).start()
    Thread(target=queue_money, args=(), daemon=True).start()
    

@app.on_event("shutdown")
def stop_background_thread():
    print("Shutting down, stopping background thread...")
    event.set()

# @app.post("/agent/create-post", tags=["News Agent"])
# def create_facebook_post(background_tasks: BackgroundTasks):
#     background_tasks.add_task(generate_and_post_article)
    
#     return {
#         "status": True,
#         "message": "Đã nhận yêu cầu. Agent đang bắt đầu quá trình tạo và đăng bài trong nền."
#     }



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
