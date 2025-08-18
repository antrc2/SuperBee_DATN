# Ghi chú
1. **18/08/2025**
## Mã giảm giá
```json
"promotion_codes": [
    {
        "id": 14,
        "promotion_user_id": -1,
        "code": "DEMO8",
        "description": null,
        "discount_value": "15",
        "min_discount_amount": null,
        "max_discount_amount": null,
        "start_date": "2025-08-17 11:32:00",
        "end_date": "2025-08-21 11:32:00",
        "usage_limit": -1,
        "per_user_limit": -1,
        "total_used": 0,
        "status": 1,
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2025-08-18T07:57:13.000000Z",
        "updated_at": "2025-08-18T07:57:13.000000Z",
        "orders_count": 0,
        "promotion_user": []
    },
    {
        "id": 13,
        "promotion_user_id": null,
        "code": "DEMO7",
        "description": null,
        "discount_value": "15",
        "min_discount_amount": null,
        "max_discount_amount": null,
        "start_date": "2025-08-17 11:32:00",
        "end_date": "2025-08-21 11:32:00",
        "usage_limit": -1,
        "per_user_limit": -1,
        "total_used": 0,
        "status": 1,
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2025-08-18T07:56:32.000000Z",
        "updated_at": "2025-08-18T07:56:32.000000Z",
        "orders_count": 0,
        "promotion_user": [
            {
                "id": 11,
                "user_id": 2,
                "promotion_id": 13,
                "user": {
                    "id": 2,
                    "username": "adminsuper",
                    "email": "support@superbee.site",
                    "email_verified_at": null,
                    "phone": "0900000001",
                    "avatar_url": "https:\/\/cdn2.fptshop.com.vn\/unsafe\/800x0\/avatar_anime_nam_cute_18_a74be9502d.jpg",
                    "donate_code": "JRNMSCK500XVE3J8",
                    "web_id": 1,
                    "status": 1,
                    "created_at": "2025-08-18T04:29:55.000000Z",
                    "updated_at": "2025-08-18T04:29:55.000000Z"
                }
            },
            {
                "id": 12,
                "user_id": 3,
                "promotion_id": 13,
                "user": {
                    "id": 3,
                    "username": "reseller",
                    "email": "support@superbee.site",
                    "email_verified_at": null,
                    "phone": "0900000002",
                    "avatar_url": "https:\/\/cdn2.fptshop.com.vn\/unsafe\/800x0\/avatar_anime_nam_cute_18_a74be9502d.jpg",
                    "donate_code": "RS7WR1RADZBDNQHA",
                    "web_id": 1,
                    "status": 1,
                    "created_at": "2025-08-18T04:29:56.000000Z",
                    "updated_at": "2025-08-18T04:29:56.000000Z"
                }
            },
            {
                "id": 13,
                "user_id": 4,
                "promotion_id": 13,
                "user": {
                    "id": 4,
                    "username": "partner",
                    "email": "support@superbee.site",
                    "email_verified_at": null,
                    "phone": "0900000003",
                    "avatar_url": "https:\/\/cdn2.fptshop.com.vn\/unsafe\/800x0\/avatar_anime_nam_cute_18_a74be9502d.jpg",
                    "donate_code": "IK899J5TS3BYAILS",
                    "web_id": 1,
                    "status": 1,
                    "created_at": "2025-08-18T04:29:56.000000Z",
                    "updated_at": "2025-08-18T04:29:56.000000Z"
                }
            },
            {
                "id": 14,
                "user_id": 5,
                "promotion_id": 13,
                "user": {
                    "id": 5,
                    "username": "user",
                    "email": "support@superbee.site",
                    "email_verified_at": null,
                    "phone": "0900000004",
                    "avatar_url": "https:\/\/cdn2.fptshop.com.vn\/unsafe\/800x0\/avatar_anime_nam_cute_18_a74be9502d.jpg",
                    "donate_code": "KYMK20QK1JG0224Q",
                    "web_id": 1,
                    "status": 1,
                    "created_at": "2025-08-18T04:29:56.000000Z",
                    "updated_at": "2025-08-18T04:29:56.000000Z"
                }
            },
            {
                "id": 15,
                "user_id": 1,
                "promotion_id": 13,
                "user": {
                    "id": 1,
                    "username": "admin",
                    "email": "support@superbee.site",
                    "email_verified_at": null,
                    "phone": "0900000000",
                    "avatar_url": "https:\/\/cdn2.fptshop.com.vn\/unsafe\/800x0\/avatar_anime_nam_cute_18_a74be9502d.jpg",
                    "donate_code": "RZCK4QL3BDBTT3SX",
                    "web_id": 1,
                    "status": 1,
                    "created_at": "2025-08-18T04:29:55.000000Z",
                    "updated_at": "2025-08-18T04:29:55.000000Z"
                }
            }
        ]
    }]
```
* Ở đây, nếu `promotion_user_id = -1` nghĩa là dành cho tất cả mọi người đều có thể sử dụng. `promotion_user_id = null` nghĩa là dành cho 1 số người cụ thể, có thể xem ở `promotion_user` nếu `promotion_user_id == null`
# Bug: 
1. Gửi email kích hoạt tài khoản:
* CHưa thấy validate email, và không được sử dụng required
2. QUản lí mã giảm giá
* Thêm phần  thêm mã giảm giá cho nhiều người
3. CTV:
* CTV không còn trang quản trị riêng, không còn được thêm sản phẩm nữa. Chỉ có quyền hơn user ở chỗ là mua hàng thì được giảm giá 20%, vì CTV chỉ là người bán hàng hộ mình
4. Nhân viên:
* Nhân viên nào đăng acc lên để bán, thì nhân viên đó phải bảo hành acc cho khách, nếu có gắn thông tin của nhân viên đó, khi nhân viên đó nghỉ việc thì phải bàn giao thông tin đó sang cho nhân viên khác hoặc admin
5. Bảo hành:
* Thêm cột ở bảng product_credentials:
    * Email: Thông tin email của tài khoản (nullable)
    * Phone: Thông tin sđt của tài khoản (nullable)
    * CCCD: Thông tin cccd của tài khoản (nullable) (nếu đc thì để ảnh)
# Deploy:
```bash
redis-server --port 1234 --unixsocket /home/mptvweo/.application/redis.sock --unixsocketperm 777
```
# Ghi chú nội dung cuộc họp
5. **21:00:00 01/08/2025**
* Quản lí mã giảm giá
    * 1. Thiếu validate khi thêm % giảm giá (nhập quá 100% thì vẫn được ở BE). Bên FE không được sử dụng min= và max= hoặc required để validate
    * 2. Khi thêm số lần có thể sử dụng, thì chỉ có -1, hoặc số dương, nhưng lúc test, thì nhập - 52 vào thì nó vẫn nhận, mặc dù sau đó không dùng được
* Quản lí khuyến mãi nạp thẻ
    * 1. Thiếu message khi khôi phục khuyến mãi đã hết hạn, không có message trả về
    * 2. Khi đã xóa, nhưng lại không thấy bên FE gọi API lại để lấy danh sách lại
* Quản lí sản phẩm của admin:
    * 1. Khi không sửa giá sale, thì nó đưa về null, mặc dù có sửa giá sale
* Rút tiền tự động
    * 1. Khi rút tiền theo lô, thì nó trừ tiền ở 1 requests, chứ không phải ở số lần giao dịch
* Nạp thẻ:
    * 1. Thêm phần lịch sử rút tiền
    * 2. Thêm phần khuyến mãi nạp thẻ nếu có

4. **21:00:00 26/05/2025**
* API quản lí sản phẩm
    * 1. Khi User chưa đăng nhập, và khi admin muốn xem danh sách sản phẩm của web đó, thì Endpoint là `GET /products/`
    * 2. Khi Cộng tác viên ở trang quản lí sản phẩm, thì Endpoint là `GET /products/partner`
    * 3. Khi admin ở trang quản lí sản phẩm, thì Endpoint là `GET /products/admin`
* Push code:
    * Khi push code thì không nên `git add .`, mà hãy add từng file vào, để tránh bị mất code của người khác
3. **22:15:00 24/05/2025**
* Tiến độ hơi chậm, vì mới chỉ có API của Backend, chưa có giao diện
2. **21:30:00 19/05/2025**
* Đăng nhập: 
    * Khi muốn test đăng nhập, thì phải gửi API Key ở header Authorization. Và sẽ nhận về `access_token`. Và sẽ có thêm `web_id` tương ứng với API Key gửi vào ở trong `$request`
    * Khi muốn test đăng kí, thì vẫn phải gửi API Key ở Header Authorization, và sẽ chỉ nhận về `messages`. Và vẫn sẽ có thêm `web_id` tương ứng với API Key gửi vào ở trong `$request`
    * Khi muốn test đăng xuất, thì phải gửi `access_token` đã nhận từ lúc đăng nhập, thì mới được. Khi gửi `access_token` vào, thì sẽ nhận được `web_id` và `user_id` tương ứng với `access_token` đã gửi ở trong `$request`

1. **21:30:00 18/05/2025**
* Cấu trúc thư mục: 
    * Các Controller hông cần thiết phải cho vào Controllers/Api/, mà chỉ cần cho vào Controllers/ thôi
* API:
    * Method Update dùng để sửa sản phẩm
    * Method Delete dùng để xóa cứng (hoặc xóa mềm nếu có)
    * Method Patch dùng để khôi phục xóa mềm (nếu có)
* Tài khoản:
    * Các web có thể có tài khoản, email giống nhau, nhưng trong 1 web chỉ có duy nhất 1 và chỉ 1 tài khoản thôi
    * Nếu xóa thì sẽ là xóa mềm (bị cấm)
* Danh mục:
    * Nếu danh mục đó đã có sản phẩm, thì chỉ xóa mềm, nếu không thì xóa cứng.
    * Khi thêm, sửa danh mục, thì có check danh mục đó đã tồn tại hay chưa
* Mã giảm giá:
    * Nếu đã quá thời hạn sử dụng rồi thì không cho sửa nữa.
    * Nếu đã có người sử dụng mã giảm giá rồi, thì không cho xóa mềm, sửa

# Luồng chạy của trang web:
1. **Xác thực JWT**
2. **Quản lí tài khoản**
* Endpoint:
    ```
    GET /accounts/?field=&offset=&limit=
    POST /accounts/
    GET /accounts/{id}
    PUT /accounts/{id}
    PATCH /accounts/{id}
    DELETE /accounts/{id}
    ```
* Mô tả:
    * Cái phần POST, thì làm thêm cả /register nữa, vì nó giống nhau
    * Phần đăng kí tài khoản, thì thông tin tài khoản có thể trúng giữa các web, ví dụ như cùng 1 tk mk email phone, tôi có thể đăng kí ở nhiều trang web, nhưng không thể đăng kí thông tin đó ở
3. **Quản lí danh mục**
* Endpoint:
    ```
    GET /categories/?field=&offset=&limit=
    POST /categories/
    GET /categories/{id}
    PUT /categories/{id}
    PATCH /categories/{id}
    DELETE /categories/{id}
    ```
* Mô tả:
    * Nếu danh mục đó đã có sản phẩm, thì chỉ xóa mềm, nếu không thì xóa cứng.
    * Khi thêm, sửa danh mục, thì có check danh mục đó đã tồn tại hay chưa
4. **Quản lí mã giảm giá**
* Endpoint:
    ```
    GET /discount_codes/?field=&offset=&limit=
    POST /discount_codes/
    GET /discount_codes/{id}
    PUT /discount_codes/{id}
    PATCH /discount_codes/{id}
    DELETE /discount_codes/{id}
    ```
* Mô tả:
    * Khi mã giảm giá đã được sử dụng, thì không được sửa, chỉ được xóa mềm
    * Khi mã giảm giá đã quá hạn sử dụng, thì không được sửa nữa
5. **Quản lí khuyến mãi nạp thẻ**
* Endpoint:
    ```
    GET /discount_codes/?field=&offset=&limit=
    POST /discount_codes/
    GET /discount_codes/{id}
    PUT /discount_codes/{id}
    PATCH /discount_codes/{id}
    DELETE /discount_codes/{id}
    ```
* Mô tả:
    * Cái này sẽ tự động sử dụng, tính theo thời gian nạp thẻ, không phải thời gian callback về
    * Khi khuyến mãi nạp thẻ được sửa, nếu đã có người sử dụng rồi thì không được sửa nữa, chỉ có thể xóa mềm thôi
    * Mỗi trang web chỉ tồn tại 1 và chỉ 1 sự kiện khuyến mãi nạp thẻ thôi
    * Khi mã giảm giá đã quá hạn sử dụng, thì không được sửa nữa

