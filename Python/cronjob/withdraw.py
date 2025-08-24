import requests
from dotenv import load_dotenv
load_dotenv()
import os
import json
from threading import Event
from controller.TransactionController import Transaction
import time
sleep = 5
backend_url = os.getenv("BACKEND_URL")
backend_api_key = os.getenv("BACKEND_API_KEY")
username = os.getenv('MBBANK_USERNAME')
password=os.getenv("MBBANK_PASSWORD")
event = Event()

def execute_withdraw():
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
        while True:
            pending_bulk = []
            bulk_payments = []
            ids = []
            for data in mb.getBulkPaymentStatus():
                id = data['bulkId']
                bulk_detail = mb.getBulkPaymentDetail(id)

                ids.append(id)
                bulk_payments.append(
                    {
                        "id": id,
                        "detail": bulk_detail
                    }
                )
            with open("storage/new_data.json", "w",encoding='utf-8') as json_file:
                json.dump(bulk_payments, json_file,indent=4)
            
            # data_txt_path = "storage/data.txt"
            old_data = 'storage/old_data.json'
            try:
                # Thử mở để đọc
                with open(old_data, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except FileNotFoundError:
                os.makedirs(os.path.dirname(old_data), exist_ok=True)
                open(old_data, 'w', encoding='utf-8').close()
                data = []
            old_ids = []
            for item in data:
                # Kiểm tra xem có key id ở trong item hay không
                if 'id' in item and 'detail' in item:
                    pending = True
                    for detail in item['detail']:
                        if detail['status'] == "NEW":
                            pending = False
                            break
                    if pending:
                        old_ids.append(item['id'])
                    # old_ids.append(item['id'])


            differences = list(set(ids) - set(old_ids)) 
            # print(f"Differences: {differences}")
            pending_ids = []
            for difference in differences:
                for item in bulk_payments:
                    if item['id'] == difference:
                        count = 0
                        append_ = False
                        for detail in item['detail']:
                            if detail['status'] != "NEW": # nghĩa là đã thực hiện xong
                                
                                if detail['errorCode'] == "00": # nghĩa là rút tiền thành công
                                    json_data = {
                                        "amount": detail['detailAmount'],
                                        'status': True,
                                        "withdraw_code": detail['detailDescription'],
                                        "message": "RUT TIEN THANH CONG"
                                    }
                                else:
                                    message = detail['errorDetail'] if detail['errorDetail'] is not None else detail['errorMessage']
                                    json_data = {
                                        "status": False,
                                        "amount": None,
                                        "withdraw_code": detail['detailDescription'],
                                        'message': message
                                    }
                                print(f"Json data: {json_data}")
                                for i in range(0,5):
                                    response = requests.post(f"{backend_url}/callback/bank/withdraw",json=json_data,headers={"Authorization": f"Apikey {backend_api_key}"})
                                    # print(f"Response2: {response.text}")
                                    if (response.status_code == 200):
                                        print(f"Response: {response.json()}")
                                        break
                                    else:
                                        print(f"Lỗi: {response.json()}")
                                    time.sleep(sleep)

                            else: # chưa thực hiện xong, tiếp tục vòng lặp
                                count += 1
                                if (append_ == False):
                                    pending_ids.append(item['id'])
                                    append_ = True
                                print(f"Pending_id: {pending_ids}")
                        if (count == 0):
                            data.append(item)

            with open("storage/old_data.json", "w",encoding='utf-8') as f:
                json.dump(data, f,indent=4)

        #     pending_bulk.extend(pending_ids)
        #     if not pending_ids:
        #         break
        # # Xử lý dữ liệu đã hoàn thành
        # if pending_bulk:
        #     with open("storage/pending_bulk.json", "w", encoding='utf-8') as f:
        #         json.dump({"pending": pending_bulk}, f, indent=4)
        # time.sleep(sleep)
            # print(f"Data: {data_}")
            # print(f"IDS: {ids}")
            # difference_ids = list(set(ids) - set(data_))
            # print(f"Difference: {difference_ids}")
            

            # for bulk_payment in bulk_payments:

            #     id = bulk_payment['id']
            #     for difference_id in difference_ids:
            #         if (difference_id == id):
            #             details = bulk_payment['detail']
            #             for detail in details:
            #                 if (detail['status' == "NEW"]):
            #                     pass
            #                 else:
            #                     if (detail['errorCode'] == '00'):
            #                         json_data = {
            #                             "amount": data['detailAmount'],
            #                             'status': True,
            #                             "withdraw_code": data['detailDescription'],
            #                             "message": "RUT TIEN THANH CONG"
            #                         }
            #                     else:
            #                         message = detail['errorDetail'] if detail['errorDetail'] is not None else detail['errorMessage']
            #                         json_data = {
            #                             "status": False,
            #                             "amount": None,
            #                             "withdraw_code": detail['detailDescription'],
            #                             'message': message
            #                         }

            #                     for i in range(0,5):
            #                         response = requests.post(f"{backend_url}/callback/bank/withdraw",json=json_data,headers={"Authorization": f"Apikey {backend_api_key}"})
            #                         # print(f"Response2: {response.text}")
            #                         if (response.status_code == 200):
            #                             print(f"Response: {response.json()}")
            #                             data_.append(id)
            #                             break
            #                         else:
            #                             print(f"Lỗi: {response.json()}")
            #                         time.sleep(sleep)
            #                     print(f"Data: {data_}")

                                
            # #     for id_ in data_:
            # #         if (id_ != id):
            # #             for data in bulk_payment['detail']:
            # #                 if (data['status'] != "NEW"):
            # #                     write_file = True
            # #                     if (data['errorCode'] == "00"):

            # #                         json_data = {
            # #                             "amount": data['detailAmount'],
            # #                             'status': True,
            # #                             "withdraw_code": data['detailDescription'],
            # #                             "message": "RUT TIEN THANH CONG"
            # #                         }
            # #                     else:
            # #                         message = data['errorDetail'] if data['errorDetail'] is not None else data['errorMessage']
            # #                         json_data = {
            # #                             "status": False,
            # #                             "amount": None,
            # #                             "withdraw_code": data['detailDescription'],
            # #                             'message': message
            # #                         }

            # #                     for i in range(0,5):
            # #                         response = requests.post(f"{backend_url}/callback/bank/withdraw",json=json_data,headers={"Authorization": f"Apikey {backend_api_key}"})
            # #                         # print(f"Response2: {response.text}")
            # #                         if (response.status_code == 200):
            # #                             print(f"Response: {response.json()}")
            # #                             break
            # #                         else:
            # #                             print(f"Lỗi: {response.json()}")
            # #                         time.sleep(sleep)
            # #                 else:
            # #                     write_file = False
            # #                     pending_bulk.append(data)
            # #                     print(f"Pending bulk: {pending_bulk}")

            # #             if (write_file):
            # #                 data_.append(id_)
            # #                 # print(f"ID: {id}")
            # #                 # f.write(f"{id}\n")
            # # # with open("storage/data.txt","w",encoding='utf-8') as f:
            # # #     for i in range(0,len(ids)):
            # # #         f.write(ids[i])
            # # #         if ( i != (len(ids) -1)):
            # # #             f.write("\n")
            # # id___ = ""
            # # for id__ in data_:
            # #     id___ += id__
            # # with open("storage/data.txt",'w',encoding='utf-8') as f:
            # #     f.write(id___)
            if (len(pending_bulk) == 0):
                print("Break")
                break

        # pending_bulk = []
        # bulk_payments = []
        # ids = []
        # for data in mb.getBulkPaymentStatus():
        #     # bulk_payments.append(data['bulkId'])
        #     id = data['bulkId']
        #     bulk_detail = mb.getBulkPaymentDetail(id)

        #     ids.append(id)
        #     bulk_payments.append(
        #         {
        #             "id": id,
        #             "detail": bulk_detail
        #         }
        #     )
        #     for e in bulk_detail:
        #         if (e['status'] == "NEW"):
        #             pending_bulk.append(e)
        # print(f"\n\nPending Bulk: {pending_bulk}\n\n")
        # # print(f"Bulk Detail: {bulk_detail}")
        # with open("storage/data.json", "w",encoding='utf-8') as json_file:
        #     json.dump(bulk_payments, json_file,indent=4)
        # data_txt_path = "storage/data.txt"

        # try:
        #     # Thử mở để đọc
        #     with open(data_txt_path, 'r', encoding='utf-8') as f:
        #         data = f.read().split("\n")
        # except FileNotFoundError:
        #     # Nếu chưa có, tạo folder (nếu cần) và file rỗng
        #     os.makedirs(os.path.dirname(data_txt_path), exist_ok=True)
        #     open(data_txt_path, 'w', encoding='utf-8').close()
        #     # Khởi tạo data rỗng
        #     data = []

        # with open("storage/data.txt","w",encoding='utf-8') as f:
        #     for i in range(0,len(ids)):
        #         f.write(ids[i])
        #         if ( i != (len(ids) -1)):
        #             f.write("\n")


        # for bulk in pending_bulk:
        #     while True:
        #         if (bulk['errorCode'] == "00"):
        #             json_data = {
        #                 "amount": data['detailAmount'],
        #                 'status': True,
        #                 "withdraw_code": data['detailDescription'],
        #                 "message": "RUT TIEN THANH CONG"
        #             }
        #         else:
        #             message = bulk['errorDetail'] if bulk['errorDetail'] is not None else bulk['errorMessage']
        #             json_data = {
        #                 "status": False,
        #                 "amount": None,
        #                 "withdraw_code": bulk['detailDescription'],
        #                 'message': message
        #             }
        #         for i in range(0,5):
        #             response = requests.post(f"{backend_url}/callback/bank/withdraw",json=json_data,headers={"Authorization": f"Apikey {backend_api_key}"})
        #             if (response.status_code == 200):
        #                 print(f"Response: {response.json()}")
        #                 break
        #             else:
        #                 print(f"Lỗi: {response.json()}")
        #             time.sleep(sleep)    
        #         if (bulk['status'] != "NEW"):
        #             break
            # print(bulk)
        # difference_ids = list(set(ids) - set(data))
    
    
        
            # for id in difference_ids:
            #     for bulk_payment in bulk_payments:
            #         if (id == bulk_payment['id']):
            #             for data in bulk_payment['detail']:
            #                 print(f"status: {data['status']}")
            #                 if (data['status'] != 'NEW'):
            #                     if (data['errorCode'] == "00"):

            # json_data = {
            #             "amount": data['detailAmount'],
            #             'status': True,
            #             "withdraw_code": data['detailDescription'],
            #             "message": "RUT TIEN THANH CONG"
            #         }
            #                     else:
            #                         message = data['errorDetail'] if data['errorDetail'] is not None else data['errorMessage']
            #                         json_data = {
            #                             "status": False,
            #                             "amount": None,
            #                             "withdraw_code": data['detailDescription'],
            #                             'message': message
            #                         }
            #                     for i in range(0,5):
            #                         response = requests.post(f"{backend_url}/callback/bank/withdraw",json=json_data,headers={"Authorization": f"Apikey {backend_api_key}"})
            #                         # print(f"Response2: {response.text}")
            #                         if (response.status_code == 200):
            #                             print(f"Response: {response.json()}")
            #                             break
            #                         else:
            #                             print(f"Lỗi: {response.json()}")
            #                         time.sleep(sleep)
            #                 else:
            #                     pending_ids.append(id)
                                
                            
                                
                            
            #                     print(f"Pending_id: {pending_ids}")
            #                     print(f"Len: {len(pending_ids)}")
            
            # if (len(pending_ids) == 0):
            #     print(f"Len: {len(pending_ids)}")
            #     break
    except Exception as e:
        print(f"Lỗi: {e}")
        pass
    # time.sleep(sleep)

def withdraw():
    while not event.is_set():
        response = requests.get(f"{backend_url}/auto/transaction")
        data = response.json()
        status_transaction = data['data']
        # status_transaction = 1
        if (status_transaction == 0):
            print("Auto transaction đang tắt")
            pass
        else:
            print("Auto transaction đang bật")
            execute_withdraw()
        # print(data['data'])
        time.sleep(sleep)
        pass
        