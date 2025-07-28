from mbbank import MBBank

class Transaction(MBBank):
    def getBulkPaymentStatus(self):
        rid = f"{self._userid}-{self._get_now_time()}"
        json_data = {
            'sessionId': self.sessionId if self.sessionId is not None else "",
            'refNo': rid,
            'deviceIdCommon': self.deviceIdCommon,
        }
        print(json_data)
        response = self._req("https://online.mbbank.com.vn/api/retail-web-bulkpaymentms/getBulkPaymentStatus")
        print(response)
        return response['bulkPaymentList']
    def getBulkPaymentDetail(self,bulkId):
        # rid = f"{self._userid}-{self._get_now_time()}"
        # json_data = {
        #     'sessionId': self.sessionId if self.sessionId is not None else "",
        #     'refNo': rid,
        #     'deviceIdCommon': self.deviceIdCommon,
        # }
        # json_data['bulkId'] = bulkId
        # print(json_data)
        data = {
            'bulkId': bulkId
        }
        response = self._req("https://online.mbbank.com.vn/api/retail-web-bulkpaymentms/getBulkPaymentDetail",json=data)
        print(response)
        return response['bulkPaymentDataDetail']
    def getListBank(self):
        response = self.getBankList()
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
        return output
    