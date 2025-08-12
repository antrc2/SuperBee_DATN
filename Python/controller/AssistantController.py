from openai import OpenAI
import os
import requests
import json
from dotenv import load_dotenv
from datetime import datetime
import asyncio
from playwright.async_api import async_playwright
from threading import Thread
import copy
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
chat_model = os.getenv("CHAT_MODEL")
python_url = os.getenv("PYTHON_URL")
# frontend_url = os.getenv("FRONTEND_URL",'')
backend_api = os.getenv("BACKEND_API")
client = OpenAI(

    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=api_key
)
def now():
    now = datetime.now()
    return now

def search_product_detail_by_sku(id):
    response = requests.get(f"{backend_api}/assistant/products/{id}").text
    return response
def get_list_product_by_category(id):
    response = requests.get(f"{backend_api}/assistant/categories/{id}").text
    return response
def sitemap_crawl(url):
    response = requests.get(url).text
    return response
def add_product_to_cart(id,access_token):
    response = requests.post(f"{backend_api}/assistant/carts/",json={"product_id": id},headers={"Authorization": f"Bearer {access_token}","Content-Type": "application/json"}).text
    return response
async def fetch_body_html(url: str) -> str:
    print(f"Đang crawl {url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, timeout=30000, wait_until="networkidle")
            return await page.inner_html("main")
        except asyncio.TimeoutError:
            return ""
        finally:
            await browser.close()
def url_crawl_sync(url: str) -> str:
    result = {}

    def _runner():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result["body"] = loop.run_until_complete(fetch_body_html(url))
        loop.close()

    t = Thread(target=_runner)
    t.start()
    t.join()
    return result["body"]
def execute_agent(agent_name,messages,access_token):
    if (agent_name == 'product'):
        # print(f"Product message: {messages[1:]}")

        response = client.chat.completions.create(
            messages=messages,
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
                },
                {
                    "type": "function",
                    'function': {
                        'name': "add_product_to_cart",
                        "description": "Thêm sản phẩm vào giỏ hàng",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "id": {
                                    "type": "integer",
                                    "description": "ID của sản phẩm"
                                }
                            },
                            "required": ['id']
                        }
                    }
                }
            ],
            tool_choice='required',
            model=chat_model
        )

        if (response.choices[0].message.tool_calls == None):
            # return response.choices[0].message
            return ""
        else :
            tool_calls = response.choices[0].message.tool_calls
            response = ""
            # if (response.choices[0].message.tool_calls[0].function.name == "search_product_detail_by_sku"):
            print(f"Product Tool calls: {tool_calls}")
            
            for tool_call in tool_calls:
                argument = json.loads(tool_call.function.arguments)
                function_name = tool_call.function.name
                if (function_name == "search_product_detail_by_sku"):
                    result = search_product_detail_by_sku(argument['sku'])
                    response += result
                if (function_name == "add_product_to_cart"):
                    result = add_product_to_cart(argument['id'],access_token)
                    response += result
            return response
    elif (agent_name == 'category'):
        response = client.chat.completions.create(
            messages=messages,
            tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "get_list_product_by_category",

                        "description": "Tìm kiếm sản phẩm theo id danh mục",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "category_id": {
                                    "type": "string",
                                    "description": "Dựa vào tên danh mục để đưa ra chính xác id danh mục"
                                },
                            },
                            "required": ["category_id"]
                        }
                    }
                }
            ],
            tool_choice='required',
            model=chat_model
        )
        print(f"Category Response: {response}")
        if (response.choices[0].message.tool_calls == None):

            # return response.choices[0].message
            return ""
        else :
            tool_calls = response.choices[0].message.tool_calls
            response = ""
            # if (response.choices[0].message.tool_calls[0].function.name == "get_list_product_by_category"):
            print(f"Category Tool calls: {tool_calls}")
            
            for tool_call in tool_calls:
                argument = json.loads(tool_call.function.arguments)
                function_name = tool_call.function.name
                if (function_name == "get_list_product_by_category"):
                    result = get_list_product_by_category(argument['category_id'])
                    response += result
            return response
    elif (agent_name == 'news'):
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "sitemap_crawl",

                    "description": "Lấy link sitemap con theo link sitemap tổng",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "Link sitemap có đuôi .xml"
                            },
                        },
                        "required": ["url"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "url_crawl",

                    "description": "Crawl dữ liệu của 1 đường link",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "Link dùng để crawl"
                            },
                        },
                        "required": ["url"]
                    }
                }
            }
        ]

        response = client.chat.completions.create(
            messages=messages,
            tools=tools,
            tool_choice='required',
            temperature=0.2,
            max_tokens=1024,
            model=chat_model
        )
        print(f"News Response: {response}")
        if (response.choices[0].message.tool_calls == None):

            # return response.choices[0].message
            return ""
        else :
            tool_calls = response.choices[0].message.tool_calls
            response = ""
            # if (response.choices[0].message.tool_calls[0].function.name == "get_list_product_by_category"):
            print(f"News Tool calls: {tool_calls}")
            
            for tool_call in tool_calls:
                argument = json.loads(tool_call.function.arguments)
                function_name = tool_call.function.name
                if (function_name == "sitemap_crawl"):
                    result =  sitemap_crawl(argument['url'])
                    # result = Thread
                    response += result
                elif (function_name == 'url_crawl'):
                    result = url_crawl_sync(argument['url'])
                    response += result
            return response
            
def chat(messages,access_token):
    results = {}

    def fetch_categories():
        results['categories'] = requests.get(
            f'{backend_api}/assistant/categories'
        ).text

    def fetch_products():
        results['products'] = requests.get(
            f'{backend_api}/assistant/products'
        ).text

    def fetch_sitemaps():
        results['post_sitemaps'] = requests.get(
            f'{backend_api}/assistant/tin-tuc.xml'
        ).text
    def get_sitemap():
        results['sitemap'] = requests.get(
            f'{backend_api}/assistant/sitemap.xml'
        ).text

    # Tạo các Thread
    threads = [
        Thread(target=fetch_categories),
        Thread(target=fetch_products),
        Thread(target=fetch_sitemaps),
        Thread(target=get_sitemap),
    ]

    # Bắt đầu tất cả
    for t in threads:
        t.start()

    # Chờ đến khi tất cả hoàn thành
    for t in threads:
        t.join()

    # Lúc này results đã có
    categories    = results['categories']
    products      = results['products']
    # post_sitemaps = results['post_sitemaps']
    sitemap       = results['sitemap']
                # Dưới đây là danh sách tin tức của trang web:
            # {post_sitemaps}
    system_content = {
            "role": "system",
            "content": f"""Bạn tên là 13Bee. Trong đó, số '13' là con số tâm linh của FPT, 'Bee' là linh vật của trường Cao đẳng FPT Polytechnic. Bạn là một nhân viên tư vấn và bán hàng của Website bán tài khoản game SuperBee.
            Thời gian hiện tại là {now()}.
            Dưới đây là danh sách các danh mục của sản phẩm:
            {categories}.
            Dưới đây là danh sách sku của danh sách sản phẩm:
            {products}

            Dưới đây là sitemap của cả trang web:
            {sitemap}
            Đưa ra link và ảnh ở dạng markdown cho tôi
            """
        }
    
    messages = [system_content] + messages
    print(f"Messages: {messages}")
    prepare_end = False
    router = ['category','product','news','other']
    tool_choice = 'required'
    user_content = copy.deepcopy(messages)
    while True:
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
                                "enum": router,
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

            tool_choice=tool_choice,
            max_tokens=1024,
            stream=True,
            temperature=0.3
        )
        tool_call = True
        generated_text = ""
        response_clone = []
        

        for chunk in response:
            response_clone.append(chunk)
            print(f"Chunk: {chunk}")
            if chunk.choices:
                delta = chunk.choices[0].delta
                if delta.content:
                    tool_call = False
                    generated_text += delta.content
                    messages[-1]['content'] = generated_text
                    yield json.dumps({
                        "messages": messages
                    })
                    print(f"Final Message: {messages}")
                    # print(delta.content, end="", flush=True)
                    # print(f"generated_text: {generated_text}")
                elif delta.tool_calls:
                    tool_call = True
                    for tool_call in delta.tool_calls:
                        messages.append({
                            "role": "assistant",
                            "tool_calls": [{
                                "id": tool_call.id,
                                "type": "function",
                                "function": {
                                    "name": tool_call.function.name,
                                    "arguments": tool_call.function.arguments
                                }
                            }]
                        })
                        yield json.dumps({
                            "messages": messages
                        })
                        print(f"ID Chat: {chunk.id}")
                        # print(f"Message: {messages}")
                        print(f"\n[TOOL CALL]: {tool_call.function.name} - {tool_call.function.arguments}")
                        data = json.loads(tool_call.function.arguments)
                        # messages_clone = user_content.copy()
                        messages_clone = copy.deepcopy(user_content)
                        messages_clone[-1]['content'] = data['content']
                        print(f"Message clone: {messages_clone}")
                        result = execute_agent(agent_name=data['router'],messages=messages_clone,access_token=access_token)
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result

                        })
                        yield json.dumps({
                            "messages": messages
                        })
                    messages.append(
                        {
                            "role": "assistant",
                            'content': generated_text
                        }
                    )

        tool_choice = 'auto'
        # break
        if (tool_call):
            pass
        else:
            print(f"Response: {response_clone}")
            print("Không dùng tool call nữa")
            print(f"Generated_text: {generated_text}")
            break
    print(f"Final Message: {messages}")
    