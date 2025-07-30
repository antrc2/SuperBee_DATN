from openai import OpenAI
import os
import requests
import json
from dotenv import load_dotenv
from datetime import datetime
import asyncio
from playwright.async_api import async_playwright
import copy
from threading import Thread
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
chat_model = os.getenv("CHAT_MODEL")
python_url = os.getenv("PYTHON_URL")
client = OpenAI(

    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    # base_url="https://api.together.xyz/v1",
    # base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)
def now():
    now = datetime.now()
    return now

def search_product_detail_by_sku(id):
    response = requests.get(f"http://localhost:8000/api/assistant/products/{id}").text
    return response
def get_list_product_by_category(id):
    response = requests.get(f"http://localhost:8000/api/assistant/categories/{id}").text
    return response
def sitemap_crawl(url):
    response = requests.get(url).text
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
def execute_agent(agent_name,messages):
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
                }
            ],
            tool_choice='required',
            model=chat_model
        )

        print(response)
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
            return response
                # argument = response.choices[0].message.tool_calls[0].function.arguments
                # data = json.loads(argument)
                # print(f"Product data: {data}")
                # result = search_product_detail_by_sku(data['sku'])
                # print(f"Product result: {result}")
                # return result
            # messages.append({
            #     "role": "assistant",
            #     "tool_calls": [{
            #         "id": response.choices[0].message.tool_calls[0].id,
            #         "type": "function",
            #         "function": {
            #             "name": response.choices[0].message.tool_calls[0].function.name,
            #             "arguments": response.choices[0].message.tool_calls[0].function.arguments
            #         }
            #     }]
            # })
            
            # messages.append({
            #     "role": "tool",
            #     "tool_call_id": response.choices[0].message.tool_calls[0].id,
            #     "content": result
            # })
            # response_ = client.chat.completions.create(
            #     messages=messages,
            #     model=chat_model
                
            # )
            # return response_.choices[0].message

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
            # if (response.choices[0].message.tool_calls[0].function.name == "get_list_product_by_category"):
            #     argument = response.choices[0].message.tool_calls[0].function.arguments
            #     data = json.loads(argument)
            #     print(f"Category data: {data}")
            #     result = get_list_product_by_category(data['category_id'])
            #     print(f"Category result: {result}")
            #     return result
            # messages.append({
            #     "role": "assistant",
            #     "tool_calls": [{
            #         "id": response.choices[0].message.tool_calls[0].id,
            #         "type": "function",
            #         "function": {
            #             "name": response.choices[0].message.tool_calls[0].function.name,
            #             "arguments": response.choices[0].message.tool_calls[0].function.arguments
            #         }
            #     }]
            # })
            
            # messages.append({
            #     "role": "tool",
            #     "tool_call_id": response.choices[0].message.tool_calls[0].id,
            #     "content": result
            # })
            # response_ = client.chat.completions.create(
            #     messages=messages,
            #     model=chat_model
                
            # )
            # return response_.choices[0].message






        # print(f"Agent name: {agent_name},Response: {response}")
# def list_tools(router):
#     if (router == "product"):
#         tools = [
#             {
#                 "type": "function",
#                 "function": {
#                     "name": "search_product_detail_by_sku",
#                     "description": "Tìm kiếm sản phẩm theo mã sku",
#                     "parameters": {
#                         "type": "object",
#                         "properties": {
#                             "sku": {
#                                 "type": "string",
#                                 "description": "Mã sku của sản phẩm"
#                             },
#                         },
#                         "required": ["sku"]
#                     }
#                 }
#             }
#         ]
#     else:
#         tools = []
#     return tools

def chat(messages):
    categories = requests.get("http://localhost:8000/api/assistant/categories").text
    products = requests.get("http://localhost:8000/api/assistant/products").text
    post_sitemaps = requests.get("http://localhost:8000/api/tin-tuc.xml").text
    system_content = {
            "role": "system",
            "content": f"""Bạn tên là 13Bee. Trong đó, số '13' là con số tâm linh của FPT, 'Bee' là linh vật của trường Cao đẳng FPT Polytechnic. Bạn là một nhân viên tư vấn và bán hàng của Website bán tài khoản game SuperBee.
            Thời gian hiện tại là {now()}.
            Dưới đây là danh sách các danh mục của sản phẩm:
            {categories}.
            Dưới đây là danh sách sku của danh sách sản phẩm:
            {products}
            Dưới đây là danh sách tin tức của trang web:
            {post_sitemaps}
            Đưa ra link và ảnh ở dạng markdown cho tôi
            """
        }
    
    messages = [system_content] + messages

    prepare_end = False
    type_ = ['category','product','news']
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
                    yield {
                        "id": chunk.id,
                        "messages": messages
                    }
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
                        yield {
                            "id": chunk.id,
                            "messages": messages
                        }
                        print(f"ID Chat: {chunk.id}")
                        # print(f"Message: {messages}")
                        print(f"\n[TOOL CALL]: {tool_call.function.name} - {tool_call.function.arguments}")
                        data = json.loads(tool_call.function.arguments)
                        # messages_clone = user_content.copy()
                        messages_clone = copy.deepcopy(user_content)
                        messages_clone[-1]['content'] = data['content']
                        print(f"Message clone: {messages_clone}")
                        result = execute_agent(agent_name=data['router'],messages=messages_clone)
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result

                        })
                        yield {
                            "id": chunk.id,
                            "messages": messages
                        }
                    messages.append(
                        {
                            "role": "assistant",
                            'content': generated_text
                        }
                    )
                        # print(f"Message: {messages}")
        # print(f"Message: {messages}")
        tool_choice = 'auto'
        # break
        if (tool_call):
            pass
        else:
            print(f"Response: {response_clone}")
            print("Không dùng tool call nữa")
            print(f"Generated_text: {generated_text}")
            break
    # return {
    #     "messages": messages[1:]
    # }
        # break
        # for res in response:
        #     response_clone.append(res)
        #     if res.choices[0].delta.tool_calls is None:
        #         if res.choices[0].delta.content is not None:
        #             # if (prepare_end):
        #             #     pass
        #             # else:
        #             #     messages.append(
        #             #         {
        #             #             "role": "assistant",
        #             #             "content": generated_text
        #             #         }
        #             #     )
        #             # messages[-1]['content'] = generated_text
        #             # print(messages)
        #             # return messages
        #             print(f"Content: {res.choices[0].delta.content}\n")
        #     else:
        #         print(f"Tool calls: {res.choices[0].delta.tool_calls}")
        #         tool_call = True
        #         tools_call_stream.append(res.choices[0].delta.tool_calls)

        # if not tool_call:
        #     break

        # print(f"Response: {response_clone}")
        # break
    #     # Bước 2: Gom và hợp nhất tool_calls theo index
    #     tool_data = defaultdict(dict)
    #     len_ = 0
    #     for tool_part in tools_call_stream:

    #         # function_name = tools_call_stream[len_].
    #         print(f"Tool part: {tool_part}")
    #         function_name = tool_part[0].function.name if tool_part and tool_part[0].function.name else ""
    #         print(f"Function name: {function_name}")
    #         for call in tool_part:
    #             print(f"Call: {call}")



    #             idx = call.index
    #             if 'function' not in tool_data[idx]:
    #                 tool_data[idx]['function'] = {}

    #             # Gán function name chỉ khi chưa có
    #             if 'name' not in tool_data[idx]['function'] or not tool_data[idx]['function']['name']:
    #                 tool_data[idx]['function']['name'] = call.function.name or function_name  # fallback nếu bị None

    #             if hasattr(call.function, 'arguments') and call.function.arguments is not None:
    #                 tool_data[idx]['function'].setdefault('arguments', '')
    #                 tool_data[idx]['function']['arguments'] += call.function.arguments

    #             tool_data[idx]['id'] = call.id
    #             tool_data[idx]['type'] = call.type
        
    #     print(f"Tool data: {tool_data.values()}")
    #     for tool_ in tool_data.values():
    #         print(f"Tool_: {tool_}")
    #         print(type(tool_))
    #         arguments = json.loads(tool_['function']['arguments'])
    #         content = arguments['content']
    #         agent_name = arguments['router']
    #         messages_clone = [system_content] + [
    #             {
    #                 "role": "user",
    #                 'content': content
    #             }
    #         ]
    #         print(f"\nAgent name: {agent_name}, Response: {execute_agent(agent_name=agent_name,messages=messages_clone)}\n")
    #         messages.append({
    #             "role": "assistant",
    #             "tool_calls": [{
    #                 "id": tool_['id'],
    #                 "type": "function",
    #                 "function": {
    #                     "name": tool_['function']['name'],
    #                     "arguments": tool_['function']['arguments']
    #                 }
    #             }]
    #         })
    #         messages.append({
    #             "role": "tool",
    #             "tool_call_id": tool_['id'],
    #             "content": execute_agent(agent_name=agent_name,messages=messages_clone)
    #         })

    #         print(messages)

    #     break

    # response_ = client.chat.completions.create(
    #     messages=messages,
    #     model=chat_model,
    #     temperature=0.2,
    #     max_tokens=2048,
    #     stream=True
    # )
    # for res in response_:
    #     print(res)


        # break
            # messages.append(
            #     {
            #         "role": "assistant",
            #         "tool_calls": [{
            #             "id": tool_['id'],
            #             "type": "function",
            #             "function": {
            #                 "name": tool_['function']['name'],
            #                 "arguments": tool_['function']['arguments']
            #             }
            #         }]
            #     }
            # )



        # print(f"Tool data: {tool_data}")
        # break
        

                # args += res.choices[0].delta.tool_calls[0].function.arguments
        # print(f"Response Clone: {response_clone}")
        # if (response_clone[0].choices[0].delta.tool_calls == None):
        #     print("Không dùng tool")
        #     # break
        # else:
        #     function_name = res.choices[0].delta.tool_calls[0].function.name
        #     print(f"Function name: {function_name}")
            # print(f"Arguments: {args}")
        
        
        # print(response)
        # break


    # print(messages)
    # router_output = json.loads(router(messages,['category_product','product','news','other']))
    # router_ , content= router_output['router'], router_output['content']
    

    # print(router_output)
    # list_tools = query_router(router=router_,content=content)
    # print(list_tools)

    

    # response = client.chat.completions.create(
    #     messages=messages,
    #     tools=list_tools,
    #     model=chat_model,
    #     tool_choice='auto',
    #     max_tokens=1024,
    #     temperature=0.2,
    #     stream=True
    # )

    # args = ""
    # function_name = ""
    # response_clone = []
    # for res in response:
    #     response_clone.append(res)
    #     if (res.choices[0].delta.tool_calls == None):
    #         # Không dùng tools
    #         # pass
    #         print(res.choices[0].delta.content)
    #     else:
    #         args += res.choices[0].delta.tool_calls[0].function.arguments

    # # print(response_clone)
    # if (response_clone[0].choices[0].delta.tool_calls == None):
    #     print("Không dùng tool")
    # else:
    #     function_name = res.choices[0].delta.tool_calls[0].function.name
    #     print(f"Function name: {function_name}")
    #     print(f"Arguments: {args}")
        

    # print(response_clone)


    