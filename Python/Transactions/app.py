import json
import mbbank
import datetime
import time
import requests
import json
from dotenv import load_dotenv
import os
import threading
# Load biến môi trường từ file .env
load_dotenv()

# Truy cập biến môi trường
accountNo = os.getenv("ACCOUNT_NO")
password = os.getenv("PASSWORD")
url = os.getenv("CALLBACK_URL")
token = os.getenv("TOKEN")
headers = {
    "Content-Type": "application/json"
}

def readFile():
    with open("data.txt","r") as f:
        text = f.read().split("\n")
        return text
def writeFile(data):
    with open("data.txt","w") as f:
        for i in range(0,len(data["transactionHistoryList"])):
            # if (data["transactionHistoryList"][i]["debitAmount"] == "0"):
            f.write(data["transactionHistoryList"][i]["refNo"])
            if i != len(data["transactionHistoryList"]) -1:
                f.write("\n")
def callback(data, url):
    try:
        # Gửi yêu cầu POST với dữ liệu JSON
        response = requests.post(url, json=data,headers=headers)
        # Kiểm tra nếu yêu cầu thành công (mã trạng thái 200)
        # print(response.text)
        if response.status_code == 200:
            return response.json()
        else:
            return False
    except requests.exceptions.RequestException as e:
        print(f"Yêu cầu không thành công: {e}")
        return False
def run(mb):
   
    daynow = datetime.datetime.now()
    lasttime = daynow - datetime.timedelta(days=2) # maximum
    data = mb.getTransactionAccountHistory(from_date=lasttime, to_date=daynow)
    # print(data)
    # Lấy lsgd
    lastestData = []
    # Viết lsgd vào file 
    with open("a.json", "w") as json_file:
        json.dump(data, json_file,indent=4)
    # Đưa ID lịch sử giao dịch vào biến
        for i in range(0,len(data["transactionHistoryList"])):
            # if (data["transactionHistoryList"][i]["debitAmount"] == "0"):
            lastestData.append(data["transactionHistoryList"][i]["refNo"])

    currentData = readFile()
    writeFile(data)
    differentData = list(set(lastestData) - set(currentData))
    if (len(differentData)>0):

        def worker(payload, url):
            result = callback(payload, url)
            print(result)

        # Tạo và khởi động thread
        threads = []
        for i in range(0,len(data["transactionHistoryList"])):
            for j in differentData:
                if (j==data["transactionHistoryList"][i]["refNo"]):
                    payload = data['transactionHistoryList'][i]
                    payload['token'] = token

                    t = threading.Thread(target=worker, args=(payload, url))
                    threads.append(t)
                    t.start()
                    # result = callback(payload, url=url)
        for t in threads:
            t.join()            
        differentData = []
def test(mb):
    while True:
        try:
            run(mb)
        except Exception as e:
            # Thiết lập lại kết nối
            mb = mbbank.MBBank(username=accountNo, password=password)
if __name__ == "__main__":
    mb = mbbank.MBBank(username=accountNo, password=password)
    test(mb)
