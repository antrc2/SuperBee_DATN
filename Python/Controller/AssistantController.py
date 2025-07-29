from openai import OpenAI
import os
import requests
import json
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
chat_model = os.getenv("CHAT_MODEL")
client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=api_key
)
def now():
    now = datetime.now()
    return now
def list_tools(router):
    if (router == "product"):
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_product_detail_by_sku",
                    "description": "Tìm kiếm sản phẩm theo mã sku",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sku": {
                                "type": "string",
                                "description": "Mã sku của sản phẩm"
                            },
                        },
                        "required": ["sku"]
                    }
                }
            }
        ]
    else:
        tools = []
    return tools
def query_router(router,content):
    return list_tools(router)

def router(messages,type_):
    tools = [
        {
            "type": "function",
            "function": {
                "name": "query_router",
                "description": "Phân loại câu hỏi theo danh mục và tóm tắt câu hỏi",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "router": {
                            "type": "string",
                            "enum": type_,
                            "description": "Phân loại câu hỏi theo danh mục"
                        },
                        "content": {
                            "type": "string",
                            "description": "Tóm tắt lại câu hỏi"
                        },
                        
                    },
                    "required": ['router',"content"]
                }
            }
        }
    ]
    response = client.chat.completions.create(
        model=chat_model,
        messages=messages,
        tools=tools,
        tool_choice="required",
        max_tokens=1024
    )

    return response.choices[0].message.tool_calls[0].function.arguments


def chat(messages):
    categories = requests.get("http://localhost:8000/api/assistant/categories").text
    products = requests.get("http://localhost:8000/api/assistant/products").text
    system_content = {
            "role": "system",
            "content": f"""Bạn tên là 13Bee. Bạn là trợ lí ảo của SuperBee.
            Thời gian hiện tại là {now()}
            Dưới đây là danh sách các danh mục của sản phẩm:
            {categories}.
            Dưới đây là danh sách sku của danh sách sản phẩm:
            {products}
            Những câu trả lời mà bạn đưa ra, nếu được thì hãy đưa ra thêm link của nguồn nữa.
            """
        }
    
    messages = [system_content] + messages
    print(messages)
    router_output = json.loads(router(messages,['category_product','product','news']))
    router_ , content= router_output['router'], router_output['content']
    

    print(router_output)
    list_tools = query_router(router=router_,content=content)
    print(list_tools)
    response = client.chat.completions.create(
        messages=messages,
        tools=list_tools,
        model=chat_model,
        tool_choice='auto',
        max_tokens=1024,
        temperature=0.2
    )

    print(response.choices[0])

    # return 
          
        



    return ""