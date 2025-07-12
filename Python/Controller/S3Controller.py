from dotenv import load_dotenv
import boto3
import os
from threading import Thread
load_dotenv()
import time
import hashlib
import string
import random
from botocore.config import Config

class S3Controller:
    def __init__(self):
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_default_region = os.getenv("AWS_DEFAULT_REGION", "ap-southeast-2")
        self.aws_bucket = os.getenv("AWS_BUCKET")
        self.aws_url = os.getenv("AWS_URL")
        s3_config = Config(
            region_name=self.aws_default_region,
            max_pool_connections=50  # default là 10
        )
        self.s3_client = boto3.session.Session(
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.aws_default_region,
            
        ).client('s3', config=s3_config)
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
    def add(self,file_content,file_name):
        Thread(target=self.upload,args=(file_content,file_name)).start()
        file_url = f"{self.aws_url.rstrip('/')}/{file_name}"
        return file_url
    def uploads(self,files,folder):
        response = []
        for file in files:
            path = folder+self.random_str()
            filename = file['filename']
            file_extention = filename.split(".")[-1]
            Thread(target=self.upload,args=(file['file'],f"{path}.{file_extention}")).start()
            response.append(
                {
                    "url": f"{self.aws_url.rstrip('/')}/{path}.{file_extention}",
                    "filename": filename
                }
            )
        print(response)
        return response
    def delete(self,path):
        self.s3_client.delete_object(Bucket=self.aws_bucket, Key=path)
    def delete(self,path):
        
        Thread(target=self.delete,args=(path,)).start()
        return True
    def deletes(self,paths):
        for path in paths:
            Thread(target=self.delete,args=(path,)).start()
        return True