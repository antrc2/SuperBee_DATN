from dotenv import load_dotenv
import boto3
import os
from threading import Thread
from controller.NSFWController import NSFWController
from io import BytesIO
load_dotenv()
import time
import hashlib
import string
import random


class S3Controller:
    def __init__(self):
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_default_region = os.getenv("AWS_DEFAULT_REGION", "ap-southeast-2")
        self.aws_bucket = os.getenv("AWS_BUCKET")
        self.aws_url = os.getenv("AWS_URL")

        self.s3_client = boto3.session.Session(
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.aws_default_region
        ).client('s3')
        self.nsfw = NSFWController()
    async def detect_file(self,byte_file):
        return self.nsfw.detect(byte_file)
    def upload(self,file_content,file_name):
        self.s3_client.upload_fileobj(file_content, self.aws_bucket, file_name)
    def random_str(self,rand_len=8):
        alphabet = string.ascii_letters + string.digits
        rand_str = ''.join(random.choice(alphabet) for _ in range(rand_len))
        current_ms = int(time.time() * 1000)

        ms_bytes = str(f"{current_ms}{rand_str}").encode('utf-8')

        # Tính MD5
        md5_hash = hashlib.md5(ms_bytes).hexdigest()
        return md5_hash
    async def add(self, file, folder):
        # lấy phần mở rộng và random tên như cũ
        file_extension = file.filename.split(".")[-1]
        random_str = self.random_str()
        filename = f"{folder}{random_str}"
        path = f"{filename}.{file_extension}"

        # Đọc nội dung file **một lần duy nhất**
        data = await file.read()
        byte_buf = BytesIO(data)

        # Kiểm tra NSFW trên bản sao byte_buf (nếu là ảnh)
        if file.content_type in ("image/jpeg", "image/png", "image/webp"):
            # cần reset con trỏ về đầu nếu NSFWController dùng trực tiếp byte_buf
            byte_buf.seek(0)
            if self.nsfw.detect(byte_buf):
                return {
                    "status": False,
                    "message": f"File {file.filename} chứa nội dung không hợp lệ",
                    "url": None
                }

        # Upload lên S3 (dùng lại data)
        Thread(target=self.upload,args=(BytesIO(data),path)).start()
        # def _upload():
        #     # mỗi lần upload, tạo BytesIO mới vì upload_fileobj có thể đọc đến EOF
        #     self.s3_client.upload_fileobj(BytesIO(data), self.aws_bucket, path)

        # Thread(target=_upload, daemon=True).start()

        file_url = f"{self.aws_url.rstrip('/')}/{path}"
        return {
            "status": True,
            "url": file_url,
            "filename": f"{random_str}.{file_extension}"
        }

    # async def add(self,file,folder):
    #     # filename = folder+self.random_str()
    #     file_extension = file.filename.split(".")[-1]
    #     random_str = self.random_str()
    #     filename = folder + random_str
    #     path = f"{filename}.{file_extension}"
    #     data = await file.read()
    #     byte_buf = BytesIO(data)
    #     # byte_file = BytesIO(await file.read())
    #     if (file.content_type == "image/jpeg" or file.content_type == "image/png" or file.content_type == "image/webp"):
    #         if (await self.detect_file(byte_buf)):
    #             return {
    #                 "status": False,
    #                 "message": f"File {file.filename} chứa nội dung không hợp lệ",
    #                 "url": None
    #             }
    #         else:

    #     # pass
    #             Thread(target=self.upload,args=(byte_buf,path)).start()
    #             file_url = f"{self.aws_url.rstrip('/')}/{path}"
    #             return {
    #                 "status": True,
    #                 "url": file_url,
    #                 "filename": random_str + file_extension
    #             }
    async def uploads(self,files,folder):
        responses = []
        for file in files:
            responses.append( await self.add(file, folder))
        print(responses)
        return responses
            # await self.detect_file(file)
        # return "Xong"
        # pass
        # response = []
        # for file in files:
        #     path = folder+self.random_str()
        #     filename = file['filename']
        #     file_extention = filename.split(".")[-1]
        #     Thread(target=self.upload,args=(file['file'],f"{path}.{file_extention}")).start()
        #     response.append(
        #         {
        #             "url": f"{self.aws_url.rstrip('/')}/{path}.{file_extention}",
        #             "filename": filename
        #         }
        #     )
        # print(response)
        # return response
    def delete(self,path):
        self.s3_client.delete_object(Bucket=self.aws_bucket, Key=path)
    def delete(self,path):
        
        Thread(target=self.delete,args=(path,)).start()
        return True
    def deletes(self,paths):
        for path in paths:
            Thread(target=self.delete,args=(path,)).start()
        return True