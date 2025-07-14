function_tools = [
    {
        "type": "function",
        "function": {
            "name": "search_product",
            "description": "Tìm kiếm sản phẩm acc game theo từ khoá",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "Từ khoá tên acc hoặc game"
                    },
                    "max_price": {
                        "type": "number",
                        "description": "Giá tối đa (VND)"
                    },
                    "min_price": {
                        "type": "number",
                        "description": "Giá tối thiểu (VND)"
                    }
                },
                "required": ["keyword"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_to_cart",
            "description": "Thêm một sản phẩm vào giỏ hàng dựa trên mã sản phẩm hoặc sản phẩm gần đây nhất.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Mã sản phẩm hoặc để trống để dùng sản phẩm gần đây nhất.",
                    }
                },
                "required": []
            }
        }
    },
]
