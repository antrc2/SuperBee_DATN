from openai import OpenAI
import os
import requests
import json
from dotenv import load_dotenv
from datetime import datetime
from collections import defaultdict
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
chat_model = os.getenv("CHAT_MODEL")
client = OpenAI(
    # base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)
def now():
    now = datetime.now()
    return now
def search_product_detail_by_sku(sku):
    response = requests.get(f"http://localhost:8000/api/assistant/products/{sku}").text
    return response
def get_list_product_by_category(category):
    response = requests.get(f"http://localhost:8000/api/assistant/categories/{category}").text
    return response
def execute_agent(agent_name,messages):
    if (agent_name == 'product'):
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
        if (response.choices[0].message.tool_calls == None):
            return response.choices[0].message
        else :
            if (response.choices[0].message.tool_calls[0].function.name == "search_product_detail_by_sku"):
                argument = response.choices[0].message.tool_calls[0].function.arguments
                data = json.loads(argument)
                result = search_product_detail_by_sku(data['sku'])
            messages.append({
                "role": "assistant",
                "tool_calls": [{
                    "id": response.choices[0].message.tool_calls[0].id,
                    "type": "function",
                    "function": {
                        "name": response.choices[0].message.tool_calls[0].function.name,
                        "arguments": response.choices[0].message.tool_calls[0].function.arguments
                    }
                }]
            })
            
            messages.append({
                "role": "tool",
                "tool_call_id": response.choices[0].message.tool_calls[0].id,
                "content": result
            })
            response_ = client.chat.completions.create(
                messages=messages,
                model=chat_model
                
            )
            return response_.choices[0].message
    elif (agent_name == 'category'):
        response = client.chat.completions.create(
            messages=messages,
            tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "get_list_product_by_category",
                        "description": "Tìm kiếm sản phẩm theo tên danh mục",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "category_name": {
                                    "type": "string",
                                    "description": "Dựa vào danh sách danh mục ở trên để đưa ra tên chính xác của danh mục"
                                },
                            },
                            "required": ["category_name"]
                        }
                    }
                }
            ],
            tool_choice='required',
            model=chat_model
        )
        print(f"Category Response: {response}")
        if (response.choices[0].message.tool_calls == None):
            return response.choices[0].message
        else :
            if (response.choices[0].message.tool_calls[0].function.name == "get_list_product_by_category"):
                argument = response.choices[0].message.tool_calls[0].function.arguments
                data = json.loads(argument)
                print(f"Category data: {data}")
                result = get_list_product_by_category(data['category_name'])
            messages.append({
                "role": "assistant",
                "tool_calls": [{
                    "id": response.choices[0].message.tool_calls[0].id,
                    "type": "function",
                    "function": {
                        "name": response.choices[0].message.tool_calls[0].function.name,
                        "arguments": response.choices[0].message.tool_calls[0].function.arguments
                    }
                }]
            })
            
            messages.append({
                "role": "tool",
                "tool_call_id": response.choices[0].message.tool_calls[0].id,
                "content": result
            })
            response_ = client.chat.completions.create(
                messages=messages,
                model=chat_model
                
            )
            return response_.choices[0].message





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
    type_ = ['category','product','news','other']
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
            tool_choice="required",
            max_tokens=1024,
            stream=True
        )
        tool_call = False
        tools_call_stream = []
        response_clone = []
        for res in response:
            response_clone.append(res)
            if res.choices[0].delta.tool_calls is None:
                if res.choices[0].delta.content is not None:
                    print(f"Content: {res.choices[0].delta.content}\n")
            else:
                print(f"Tool calls: {res.choices[0].delta.tool_calls}")
                tool_call = True
                tools_call_stream.append(res.choices[0].delta.tool_calls)

        if not tool_call:
            break

        # Bước 2: Gom và hợp nhất tool_calls theo index
        tool_data = defaultdict(dict)

        for tool_part in tools_call_stream:
            print(f"Tool part: {tool_part}")
            for call in tool_part:
                print(f"Call: {call}")



                idx = call.index
                if 'function' not in tool_data[idx]:
                    tool_data[idx]['function'] = {}
                if hasattr(call.function, 'name'):
                    tool_data[idx]['function']['name'] = call.function.name
                if hasattr(call.function, 'arguments') and call.function.arguments is not None:
                    tool_data[idx]['function'].setdefault('arguments', '')
                    tool_data[idx]['function']['arguments'] += call.function.arguments

                tool_data[idx]['id'] = call.id
                tool_data[idx]['type'] = call.type
        
        print(f"Tool data: {tool_data.values()}")
        for tool_ in tool_data.values():
            arguments = json.loads(tool_['function']['arguments'])
            content = arguments['content']
            agent_name = arguments['router']
            messages_clone = [system_content] + [
                {
                    "role": "user",
                    'content': content
                }
            ]
            print(f"\nAgent name: {agent_name}, Response: {execute_agent(agent_name=agent_name,messages=messages_clone)}\n")
        
        break
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


    return ""