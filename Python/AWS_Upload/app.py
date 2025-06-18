import os
import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Nếu dùng python-dotenv để load file .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Đọc biến môi trường
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-southeast-2")
AWS_BUCKET = os.getenv("AWS_BUCKET")
AWS_URL = os.getenv("AWS_URL")  # ví dụ: https://bucket.s3.region.amazonaws.com

# Thiết lập logging
logging.basicConfig(level=logging.INFO)

def create_s3_client():
    region = AWS_DEFAULT_REGION
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        session = boto3.session.Session(
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=region
        )
        return session.client('s3')
    else:
        return boto3.client('s3', region_name=region)

def upload_file_to_s3(file_path, object_name=None):
    if object_name is None:
        object_name = os.path.basename(file_path)

    # Kiểm tra file tồn tại
    if not os.path.isfile(file_path):
        logging.error(f"File không tồn tại: {file_path}")
        return None

    s3_client = create_s3_client()
    extra_args = {}
    import mimetypes
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type:
        extra_args['ContentType'] = content_type
    yield "Sắp upload rồi này"
    try:
        logging.info(f"Đang upload {file_path} → s3://{AWS_BUCKET}/{object_name}")
        if extra_args:
            s3_client.upload_file(Filename=file_path, Bucket=AWS_BUCKET, Key=object_name, ExtraArgs=extra_args)
        else:
            s3_client.upload_file(Filename=file_path, Bucket=AWS_BUCKET, Key=object_name)

        # Build URL trả về nếu cần
        if AWS_URL:
            file_url = f"{AWS_URL.rstrip('/')}/{object_name}"
        else:
            file_url = f"https://{AWS_BUCKET}.s3.{AWS_DEFAULT_REGION}.amazonaws.com/{object_name}"

        logging.info(f"Upload thành công: {file_url}")
        return {"bucket": AWS_BUCKET, "key": object_name, "url": file_url}

    except ClientError as e:
        err = e.response.get("Error", {})
        logging.error(f"S3 ClientError khi upload: {err.get('Code')} - {err.get('Message')}")
    except NoCredentialsError:
        logging.error("Chưa có AWS credentials hợp lệ.")
    except Exception as e:
        logging.error(f"Exception khi upload: {e}")
    return None
if __name__ == "__main__":
    # In ra để debug env
    print("AWS_BUCKET:", AWS_BUCKET)
    print("AWS_DEFAULT_REGION:", AWS_DEFAULT_REGION)
    print("AWS_ACCESS_KEY_ID:", AWS_ACCESS_KEY_ID and "***")

    # Test head_bucket trước khi upload
    try:
        s3 = create_s3_client()
        s3.head_bucket(Bucket=AWS_BUCKET)
        print("head_bucket OK")
    except Exception as e:
        print("Lỗi head_bucket:", e)

    # Ví dụ upload file local:
    file_path = "Aleotron.png"      # hoặc đường dẫn đầy đủ tới file
    object_key = "uploads/doibuonjqk.png"
    result = upload_file_to_s3(file_path, object_key)
    if result:
        print("Upload thành công. URL:", result["url"])
    else:
        print("Upload thất bại.")
