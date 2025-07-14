import requests
import time
import os
from threading import Event
from dotenv import load_dotenv
load_dotenv()
backend_url = os.getenv("BACKEND_URL")
api_key = os.getenv("BACKEND_API_KEY")
event = Event()
sleep = 3
def queue_money():
    while not  event.is_set():
        try:
            response = requests.get(f"{backend_url}/partner/money/queue",headers={
                "Authorization": f"Bearer {api_key}"
            })
            if (response.status_code):
                data = response.json()
                print(data)
                print("\n\n")
                if data['status'] and len(data['data']) > 0:
                    for item in data['data']:
                        # print(f"Item: {item}")
                        if time.strftime('%Y-%m-%d %H:%M:%S') >= item['recieved_at']:
                            count = 0
                            while count < 3:

                                res = requests.post(f"{backend_url}/callback/partner/money", json={
                                    "data": item
                                },headers={
                                    "Content-Type": "application/json",
                                    "Authorization": f"Bearer {api_key}"
                                })
                                if res.status_code == 200:
                                    break
                                else:
                                    count += 1

                            print(res.json())
                            

                        # else:
                        #     print(0)
                else:
                    print("No data or status is False")
                # pass
            else:
                pass
            # pass
        except:
            pass
        time.sleep(sleep)