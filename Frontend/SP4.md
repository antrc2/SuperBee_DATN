# ✅ Những Việc Cần Làm Ở SP4 FE

## 1. Hoàn Thiện Giao Diện

### 1.1 Hiển Thị Đầy Đủ Thông Tin Cơ Bản

#### 🏠 Trang Home (`/`)

##### 🔸 Khi **Chưa Đăng Nhập**:

- **API cần gọi**:

  1. `/banner`

     ```json
     {
       "message": "value",
       "data": [
         {
           "image_url": "...",
           "alt": "...",
           "link": "..."
         }
       ]
     }
     ```

  2. `/top`

     ```json
     {
       "message": "value",
       "data": [
         {
           "username": "...",
           "money": ...
         }
       ]
     }
     ```

  3. `/category`

     ```json
     {
       "message": "value",
       "data": [
         {
           "name": "...",
           "slug": "...",
           "parent_id": "...",
           "image": "..."
         }
       ]
     }
     ```

##### 🔸 Khi **Đã Đăng Nhập**:

- **API cần gọi**:

  1. `/cart`

     ```json
     {
       "message": "value",
       "data": [
         {
           "category": {
             "name": "..."
           },
           "product": {
             "sku": "...",
             "price": ...,
             "sale": ...
           },
           "images": [
             {
               "image_url": "...",
               "alt": "..."
             }
           ]
         }
       ]
     }
     ```

  2. `/notifications`

     ```json
     {
       "message": "value",
       "data": [
         /* ... */
       ]
     }
     ```

  3. `/account/me`

     ```json
     {
       "message": "value",
       "data": {
         /* ... */
       }
     }
     ```

#### 🛒 Trang Mua Acc (`/mua-acc`)

- Gọi API: `/categories`

> 📌 _Client không trả về thông tin người tạo/người cập nhật → Chỉ lấy các trường cần thiết._

---

### 1.2 Có Trạng Thái Loading và Error

- Khi gọi API phải có trạng thái `loading` và `error`
- Dùng component: `<LoadingDomain />`
- Dùng component: `<NoProduct />` khi không có dữ liệu trả về

---

### 1.3 Tổ Chức Dữ Liệu Toàn Cục

- Quản lý chung các dữ liệu:
  - `categories`, `cart`, `info`, `notifications`
  - Trạng thái toàn cục: `login`, `validate`, `lỗi`, ...

---

### 1.4 Tách Nhỏ Logic

- Component xử lý nhiều logic thì **tách riêng từng phần**
- Càng chia nhỏ logic càng dễ quản lý và tái sử dụng

---

### 1.5 Tối Ưu useEffect - Giảm Gọi API Không Cần Thiết

- Đọc lại cách dùng `useEffect` đúng cách
- Tránh gọi API lại nhiều lần không cần thiết

---

## 2. Tích Hợp Chat 💬

- Thêm hệ thống chat vào giao diện

---

## 3. Đa Ngôn Ngữ 🌐

- Hỗ trợ nhiều ngôn ngữ trong hệ thống

---

## 4. Dark Mode ở client và admin

# ⚙️ Một Số Lưu Ý Kỹ Thuật

## 🔁 Gọi API

- Dùng `@utils/http`

## 🔔 Thông Báo

- Sử dụng từ `import { useNotification } from "@contexts";`:
  `const { pop, conFim } = useNotification();`

  - Thành công:

    ```js
    pop("message", "s");
    ```

  - Thông tin:

    ```js
    pop("message", "i");
    ```

  - Thất bại:
    ```js
    pop("message", "e");
    ```

## ❗ Xác Nhận

- Gọi hàm:
  ```js
  conFim("message"); // return true hoặc false
  ```

### xem ở file Home để biết cách dùng thong báo hơn. click vào banner là biết
