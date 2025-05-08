# Luồng Chạy Trang Web - Website Bán Tài Khoản Game

## Tổng Quan Về Tính Năng Của Trang Web

Trang web của bạn là một nền tảng **bán tài khoản game online**, hỗ trợ nhiều vai trò người dùng như: **Người mua (User)**, **Công tác viên**, **Đại lý** và **Quản trị viên (Admin)**. Mỗi vai trò đều có các chức năng riêng biệt nhằm phục vụ cho hoạt động kinh doanh tài khoản game hiệu quả.

---

## 1. Người Mua (User)

### Mô tả:
Là khách hàng cá nhân, chưa đăng nhập hoặc chỉ có quyền thành viên cơ bản. Có thể xem tài khoản game, tìm kiếm, lọc, đặt mua, theo dõi đơn hàng,...

### Các Luồng Chạy:

#### ✅ Đăng ký tài khoản
- Truy cập trang `Đăng ký`.
- Nhập thông tin: họ tên, tài khoản, mật khẩu, email, sđt.
- Xác nhận thông tin → Hoàn tất đăng ký.
- Hệ thống gửi email xác thực (nếu có).

#### ✅ Đăng nhập
- Truy cập trang `Đăng nhập`.
- Nhập tài khoản và mật khẩu.
- Hệ thống xác minh thông tin → Cho phép đăng nhập nếu đúng.

#### ✅ Tìm kiếm và lọc tài khoản
- Truy cập trang `Tài khoản game`.
- Sử dụng thanh tìm kiếm để tra cứu theo tên game, loại tài khoản,...
- Lọc theo giá, tình trạng (có/ không có nạp), rank, sever,...
- Xem chi tiết tài khoản khi click vào từng item.

#### ✅ Đặt mua tài khoản
- Chọn tài khoản → Thêm vào giỏ hàng.
- Truy cập trang `Giỏ hàng` để kiểm tra lại tài khoản đã chọn.
- Tiến hành thanh toán → Nhập thông tin liên hệ.
- Chọn phương thức thanh toán (COD, ví điện tử, chuyển khoản,...).
- Hoàn tất đơn hàng → Nhận mã đơn hàng và hướng dẫn nhận tài khoản.

#### ✅ Theo dõi đơn hàng
- Truy cập trang `Tài khoản` → `Lịch sử đơn hàng`.
- Xem trạng thái đơn hàng (đang xử lý, đã giao, hủy,...).
- Có thể yêu cầu hỗ trợ nếu cần thiết.

---

## 2. Công Tác Viên

### Mô tả:
Là người hỗ trợ quảng bá sản phẩm, giới thiệu tài khoản game đến khách hàng. Có thể viết bài review, xem báo cáo hoa hồng,...

### Các Luồng Chạy:

#### ✅ Đăng nhập
- Truy cập trang `Đăng nhập` dành cho công tác viên.
- Nhập email và mật khẩu.
- Đăng nhập thành công → Vào trang dashboard công tác viên.

#### ✅ Quản lý bài viết
- Thêm mới bài viết đánh giá tài khoản, hướng dẫn chơi game,...
- Sửa/xóa bài viết (có thể cần duyệt từ admin).

#### ✅ Xem báo cáo hoa hồng
- Truy cập trang `Báo cáo` → Xem số tiền hoa hồng nhận được từ các đơn hàng giới thiệu.

#### ✅ Quản lý khách hàng giới thiệu
- Xem danh sách khách hàng đã giới thiệu.
- Kiểm tra lịch sử mua hàng của khách đó.

#### ✅ Liên hệ hỗ trợ
- Gửi yêu cầu hỗ trợ đến Admin qua form liên hệ hoặc chat nội bộ.

---

## 3. Đại Lý

### Mô tả:
Là đối tác phân phối tài khoản game với mức giá sỉ. Có thể mua số lượng lớn, tạo đơn lẻ cho khách, theo dõi tồn kho,...

### Các Luồng Chạy:

#### ✅ Đăng nhập
- Truy cập trang `Đăng nhập` dành cho đại lý.
- Nhập email và mật khẩu.
- Đăng nhập thành công → Vào trang dashboard đại lý.

#### ✅ Xem bảng giá sỉ
- Truy cập trang `Bảng giá sỉ`.
- Lọc theo game, loại tài khoản, thời gian,...
- So sánh giá sỉ và giá lẻ.

#### ✅ Tạo đơn hàng cho khách
- Chọn tài khoản → Thêm vào giỏ hàng sỉ.
- Nhập thông tin khách hàng.
- Hoàn tất đơn hàng → Hệ thống xuất hóa đơn và xác nhận đơn.

#### ✅ Theo dõi tồn kho
- Truy cập trang `Kho tài khoản` → Xem số lượng tài khoản còn lại, lịch sử nhập/xuất.

#### ✅ Yêu cầu hỗ trợ từ Admin
- Gửi yêu cầu đổi trả, kiểm tra đơn hàng, hỗ trợ kỹ thuật qua form hoặc chat.

---

## 4. Quản Trị Viên (Admin)

### Mô tả:
Là người quản lý toàn bộ hệ thống, có quyền thêm/sửa/xóa tài khoản, quản lý đơn hàng, xử lý yêu cầu từ đối tác, xem báo cáo tổng quan,...

### Các Luồng Chạy:

#### ✅ Đăng nhập
- Truy cập trang `Đăng nhập admin`.
- Nhập email và mật khẩu.
- Đăng nhập thành công → Vào trang quản trị.

#### ✅ Quản lý tài khoản game
- Thêm mới tài khoản: nhập thông tin chi tiết (game, tài khoản, mật khẩu, phụ kiện,...).
- Sửa/xóa tài khoản trong kho.
- Phân loại theo game, server, rank, giá,...

#### ✅ Quản lý đơn hàng
- Xem danh sách đơn hàng đang chờ xử lý.
- Cập nhật trạng thái đơn hàng (đang xử lý, đã giao, hủy,...).
- Hỗ trợ khách hàng khi có vấn đề phát sinh.

#### ✅ Quản lý người dùng
- Xem danh sách User, Công tác viên, Đại lý.
- Chỉnh sửa thông tin, khóa/mở khóa tài khoản nếu cần.

#### ✅ Quản lý bài viết, nội dung website
- Thêm/sửa/xóa bài viết, blog, hướng dẫn,...
- Cập nhật banner, slide trang chủ.

#### ✅ Quản lý báo cáo
- Xem báo cáo doanh thu theo ngày/tháng/quý.
- Báo cáo tồn kho tài khoản.
- Báo cáo hoa hồng của công tác viên, đại lý.

#### ✅ Xử lý yêu cầu hỗ trợ
- Nhận và phản hồi các yêu cầu từ người dùng, công tác viên, đại lý.
- Giải quyết tranh chấp, hỗ trợ kỹ thuật,...

# Website Document được tạo bởi Qwen3