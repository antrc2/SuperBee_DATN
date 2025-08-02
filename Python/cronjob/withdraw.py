import requests
from dotenv import load_dotenv
load_dotenv()
import os
import json
from threading import Event
from controller.TransactionController import Transaction
import time
sleep = 1
backend_url = os.getenv("BACKEND_URL")
backend_api_key = os.getenv("BACKEND_API_KEY")
# MBBANK_USERNAME="0838411897"
# MBBANK_PASSWORD=Sqrtfl0@t011
username = os.getenv('MBBANK_USERNAME')
password=os.getenv("MBBANK_PASSWORD")
event = Event()
def withdraw():
    while not event.is_set():
        try:
            mb = Transaction(username=username, password=password)
            response = mb.getBankList()
            # print(response)
            output = []
            banks = response['listBank']
            for bank in banks:
                output.append(
                    {
                        "id": bank['bankId'],
                        "name": bank['bankName'],
                        'code': bank['bankCode']
                    }
                )
            with open("storage/bank_list.json","w",encoding='utf-8') as f:
                json.dump({"banks": output}, f,indent=4)

            bulk_payments = []
            ids = []
            for data in mb.getBulkPaymentStatus():
                # bulk_payments.append(data['bulkId'])
                id = data['bulkId']
                bulk_detail = mb.getBulkPaymentDetail(id)
                # print(f"Bulk detail: {bulk_detail}")
                ids.append(id)
                bulk_payments.append(
                    {
                        "id": id,
                        "detail": bulk_detail
                    }
                )
            

            with open("storage/data.json", "w",encoding='utf-8') as json_file:
                json.dump(bulk_payments, json_file,indent=4)
            data_txt_path = "storage/data.txt"

            try:
                # Thử mở để đọc
                with open(data_txt_path, 'r', encoding='utf-8') as f:
                    data = f.read().split("\n")
            except FileNotFoundError:
                # Nếu chưa có, tạo folder (nếu cần) và file rỗng
                os.makedirs(os.path.dirname(data_txt_path), exist_ok=True)
                open(data_txt_path, 'w', encoding='utf-8').close()
                # Khởi tạo data rỗng
                data = []

            with open("storage/data.txt","w",encoding='utf-8') as f:
                for i in range(0,len(ids)):
                    f.write(ids[i])
                    if ( i != (len(ids) -1)):
                        f.write("\n")



            difference_ids = list(set(ids) - set(data))
            for id in difference_ids:
                for bulk_payment in bulk_payments:
                    if (id == bulk_payment['id']):
                        for data in bulk_payment['detail']:

                            if (data['status'] == "DONE"):
                                json_data = {
                                    "amount": data['detailAmount'],
                                    'status': True,
                                    "withdraw_code": data['detailDescription'],
                                    "message": "RUT TIEN THANH CONG"
                                }
                                # amount = data['detailAmont']
                                # pass
                            else:
                                json_data = {
                                    "status": False,
                                    "amount": None,
                                    "withdraw_code": data['detailDescription'],
                                    'message': data['errorMessage']
                                }
                            for i in range(0,5):
                                response = requests.post(f"{backend_url}/callback/bank/withdraw",json=json_data,headers={"Authorization": f"Apikey {backend_api_key}"})
                                # print(f"Response2: {response.text}")
                                if (response.status_code == 200):
                                    print(f"Response: {response.json()}")
                                    break
                                else:
                                    print(f"Lỗi: {response.json()}")
                                time.sleep(sleep)
            
        except Exception as e:
            print(f"Lỗi: {e}")
            pass
        time.sleep(sleep)