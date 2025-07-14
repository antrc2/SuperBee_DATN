import requests
import os
laravel_api = os.getenv("BACKEND_URL")
web_api_key = os.getenv("WEB_API_KEY")

def search_product_by_keyword(keyword, max_price=5000000, token_or_key=""):
    try:
        headers = {"Accept": "application/json"}
        if token_or_key.startswith("ey"):
            headers["Authorization"] = f"Bearer {token_or_key}"
        else:
            headers["X-API-KEY"] = token_or_key or web_api_key

        res = requests.get(
            f"{laravel_api}/products/search",
            params={"keyword": keyword},
            headers=headers
        )
        res.raise_for_status()
        data = res.json().get("data", [])
        filtered = [p for p in data if p.get("price", 1e9) <= max_price]

        if not filtered:
            return {
                "message": "Không tìm thấy acc phù hợp với từ khoá hoặc mức giá bạn đưa ra.",
                "type": "text"
            }

        products_data = []
        for product in filtered[:5]:
            id = product.get("id", "Id")
            sku = product.get("sku", "Không rõ mã SP")
            price = product.get("price", 0)
            category = product.get("category", {}).get("name", "Không rõ game")
            image = product.get("images", [{}])[0].get("image_url", "")
            attrs = {a["attribute_key"]: a["attribute_value"] for a in product.get("game_attributes", [])}
            
            products_data.append({
                "id": id,
                "sku": sku,
                "price": price,
                "category": category,
                "image": image,
                "attributes": attrs
            })

        return {
            "message": "Một số acc nổi bật bạn nên xem:",
            "type": "product_list",
            "products": products_data
        }

    except Exception as e:
        return {
            "message": f"❌ Lỗi khi tìm sản phẩm: {str(e)}",
            "type": "text"
        }
def add_to_cart(user_id, product_name, token=""):
    try:
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {token}"
        }

        res = requests.get(f"{laravel_api}/products/search", params={"keyword": product_name}, headers=headers)
        res.raise_for_status()
        products = res.json().get("data", [])
        if not products:
            return "Không tìm thấy sản phẩm để thêm vào giỏ."

        product_id = products[0]["id"]
        payload = {"product_id": product_id}

        cart_res = requests.post(f"{laravel_api}/carts", json=payload, headers=headers)
        cart_res.raise_for_status()
        return cart_res.json().get("message", "Đã thêm sản phẩm vào giỏ.")

    except Exception as e:
        return f"Lỗi khi thêm vào giỏ: {str(e)}"
