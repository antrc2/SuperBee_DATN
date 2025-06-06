# Ghi chú nội dung cuộc họp
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

