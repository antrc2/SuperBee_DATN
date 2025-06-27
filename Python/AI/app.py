from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import aiohttp
from io import BytesIO
from PIL import Image

# Load mô hình
model = load_model("best_nsfw_model.keras")

# Cấu hình FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hàm tải ảnh từ URL
async def load_image_from_url(url: str) -> np.ndarray:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise ValueError(f"Không thể tải ảnh từ URL: {url}")
            content = await response.read()
            img = Image.open(BytesIO(content)).convert("RGB")
            img = img.resize((224, 224))
            return np.array(img)

# Hàm dự đoán từ một ảnh numpy array
def predict_image_array(img_array: np.ndarray) -> bool:
    img_array = tf.cast(img_array, tf.float32) / 255.0
    img_array = tf.expand_dims(img_array, axis=0)
    prediction = model.predict(img_array)[0][0]
    return prediction < 0.5  # True nếu là NSFW
@app.post("/nsfw_detect")
async def predict_from_multiple_urls(request: Request):
    data = await request.json()
    urls = data.get("images", [])

    if not isinstance(urls, list) or not urls:
        return {"error": "Vui lòng cung cấp danh sách ảnh trong trường 'images'."}

    img_arrays = []
    valid_urls = []
    results = []

    # Tải và xử lý từng ảnh
    for url in urls:
        try:
            img = await load_image_from_url(url)
            img = tf.cast(img, tf.float32) / 255.0
            img_arrays.append(img)
            valid_urls.append(url)
        except Exception as e:
            results.append({
                "url": url,
                "error": str(e)
            })

    if not img_arrays:
        return {"error": "Không ảnh nào hợp lệ để dự đoán."}

    # Tạo batch (N, 224, 224, 3)
    batch_array = tf.stack(img_arrays, axis=0)

    # Dự đoán toàn bộ batch
    predictions = model.predict(batch_array)

    # Ghép kết quả với danh sách URL tương ứng
    for url, pred in zip(valid_urls, predictions):
        is_nsfw = bool(pred[0] < 0.5)  # Convert to Python boolean
        results.append({
            "url": url,
            "nsfw": is_nsfw,
            "score": float(pred[0])  # Already converting to float
        })

    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)