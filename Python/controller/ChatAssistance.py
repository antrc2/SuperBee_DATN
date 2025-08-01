# from fastapi import APIRouter, Request
# import os, json, traceback
# import jwt as pyjwt
# from jwt.exceptions import InvalidTokenError
# from openai import OpenAI

# from utils.function_tools import function_tools
# from service.product_service import search_product_by_keyword, add_to_cart

# router = APIRouter()
# client = OpenAI(
#     api_key=os.getenv("OPENAI_API_KEY"),
#     base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
# )

# # Lưu session tạm thời trong RAM
# session_history = {}

# def extract_user_id(token: str, fallback_id: str) -> str:
#     if not token:
#         return fallback_id
#     try:
#         decoded = pyjwt.decode(token, options={"verify_signature": False})
#         return str(decoded.get("user_id", fallback_id))
#     except InvalidTokenError as e:
#         print("[WARN] Token không hợp lệ:", e)
#         return fallback_id

# @router.post("/")
# async def chat_handler(request: Request):
#     try:
#         data = await request.json()
#         message = data.get("message", "")
#         token = request.headers.get("authorization", "").replace("Bearer ", "")
#         api_key = request.headers.get("X-API-KEY", "")
#         fallback_guest_id = "guest_" + os.urandom(4).hex()

#         # Ưu tiên xác định user_id từ token, nếu không thì dùng guest_id hoặc user_id từ body
#         user_id = extract_user_id(token, data.get("user_id", fallback_guest_id))
#         print(f"[LOG] Chat request from user_id: {user_id}")

#         # Nếu user mới, khởi tạo session chat
#         if user_id not in session_history:
#             session_history[user_id] = [
#                 {
#                     "role": "system",
#                     "content": (
#                         "Bạn là chatbot tư vấn acc game cho SuperBee. "
#                         "Hỗ trợ khách hàng tìm acc, xem giá, thêm vào giỏ hàng (nếu đã đăng nhập). "
#                         "Hãy phản hồi thân thiện, tự nhiên, không quá máy móc."
#                     )
#                 }
#             ]

#         # Ghi nhận message người dùng
#         session_history[user_id].append({"role": "user", "content": message})

#         # Gọi Gemini
#         response = client.chat.completions.create(
#             model="gemini-2.0-flash",
#             messages=session_history[user_id],
#             tools=function_tools,
#             tool_choice="auto"
#         )

#         choice = response.choices[0]
#         tool_calls = getattr(choice.message, "tool_calls", [])

#         # Nếu có function call
#         if tool_calls:
#             tool_call = tool_calls[0]
#             func_name = tool_call.function.name
#             args = json.loads(tool_call.function.arguments)

#             if func_name == "search_product":
#                 keyword = args.get("keyword")
#                 max_price = args.get("max_price", 100000)
#                 result = search_product_by_keyword(
#                     keyword,
#                     max_price=max_price,
#                     token_or_key=(token or api_key)
#                 )
                
#                 # Nếu result là dict (structured data), trả về nguyên vẹn
#                 if isinstance(result, dict):
#                     return result
#                 else:
#                     # Nếu result là string (fallback), wrap trong message
#                     return {"message": result, "type": "text"}
#             elif func_name == "add_to_cart":
#                 product_name = args.get("product_name")
#                 if not token:
#                     result = "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng nha!"
#                 else:
#                     result = add_to_cart(user_id, product_name, token)
#             else:
#                 result = "Xin lỗi, mình chưa hỗ trợ chức năng này."

#             session_history[user_id].append({"role": "assistant", "content": result})
#             return {"message": result}

#         # Nếu chỉ là reply văn bản
#         reply = choice.message.content or "Xin lỗi, mình chưa hiểu yêu cầu của bạn."
#         session_history[user_id].append({"role": "assistant", "content": reply})
#         return {"message": reply}

#     except Exception as e:
#         traceback.print_exc()
#         return {"error": str(e)}
