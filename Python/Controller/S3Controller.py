from dotenv import load_dotenv
import boto3
import os
from threading import Thread
load_dotenv()
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
    def add(self,file_content,file_name):
        def upload(file_content,file_name):
            self.s3_client.upload_fileobj(file_content, self.aws_bucket, file_name)
        Thread(target=upload,args=(file_content,file_name)).start()
        file_url = f"{self.aws_url.rstrip('/')}/{file_name}"
        return file_url
    def delete(self,path):
        def delete(path):
            self.s3_client.delete_object(Bucket=self.aws_bucket, Key=path)
        Thread(target=delete,args=(path,)).start()
        return True