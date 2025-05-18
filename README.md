# Ghi chú nội dung cuộc họp
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