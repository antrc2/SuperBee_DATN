// customNotifications.js
// Cung cấp 2 kiểu thông báo: SweetAlert2 và Vanilla JS toast và confirm

import Swal from "sweetalert2";

export function showAlert(
  message,
  title = "Thông báo",
  icon = "info",
  background = "#f4f7fa",
  color = "#000",
  confirmButtonColor = "#3085d6",
  width = "400px",
  padding = "2em",
  backdrop = true
) {
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    confirmButtonText: "OK",
    background: background, // Tùy chỉnh nền
    color: color, // Tùy chỉnh màu chữ
    confirmButtonColor: confirmButtonColor, // Màu nút xác nhận
    width: width, // Độ rộng
    padding: padding, // Khoảng cách xung quanh nội dung
    backdrop: backdrop, // Màu nền mờ phía sau
    timer: 2000
  });
}

// Hàm xác nhận với các tham số mặc định
export function showConfirm(
  message,
  title = "Xác nhận",
  icon = "warning",
  confirmButtonText = "OK",
  cancelButtonText = "Hủy",
  confirmButtonColor = "#3085d6",
  cancelButtonColor = "#d33",
  background = "#f4f7fa",
  width = "500px",
  padding = "2em",
  backdrop = "rgba(0, 0, 0, 0.5)",
  customClass = {}
) {
  return Swal.fire({
    title: title,
    text: message,
    icon: icon,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    confirmButtonColor: confirmButtonColor,
    cancelButtonColor: cancelButtonColor,
    background: background, // Tùy chỉnh nền
    width: width, // Độ rộng
    padding: padding,
    backdrop: backdrop, // Màu nền mờ
    customClass: {
      container: "custom-container", // Tùy chỉnh container của modal
      popup: "custom-popup", // Tùy chỉnh pop-up
      title: "custom-title", // Tùy chỉnh tiêu đề
      confirmButton: "custom-confirm", // Tùy chỉnh nút xác nhận
      ...customClass // Tùy chỉnh thêm nếu cần
    }
  }).then((result) => {
    return result.isConfirmed;
  });
}

// Hàm lỗi tự động đóng sau 3 giây
export function showError(message) {
  Swal.fire({
    title: "Lỗi!",
    text: message,
    icon: "error",
    timer: 3000, // Tự động đóng sau 3 giây
    willClose: () => {
      console.log("Thông báo đã đóng");
    }
  });
}

// Hàm thông báo thành công với hình ảnh
export function showSuccessWithImage(
  message,
  imageUrl = "https://example.com/your-image.png",
  imageWidth = 100,
  imageHeight = 100,
  imageAlt = "Custom image"
) {
  Swal.fire({
    title: "Thông báo",
    text: message,
    icon: "success",
    imageUrl: imageUrl, // Thêm hình ảnh
    imageWidth: imageWidth, // Kích thước hình ảnh
    imageHeight: imageHeight,
    imageAlt: imageAlt // Thêm mô tả cho hình ảnh
  });
}
// notification.js

// 1. Tạo hoặc lấy container chung
let container = document.getElementById("notification-container");

if (!container) {
  container = document.createElement("div");
  container.id = "notification-container";
  Object.assign(container.style, {
    position: "fixed",
    top: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  });
  document.body.appendChild(container);
}

// 2. Định nghĩa SVG icon cho từng type
const icons = {
  info: `
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <circle cx="12" cy="12" r="10" />
      <rect x="11" y="10" width="2" height="6" />
      <rect x="11" y="7" width="2" height="2" />
    </svg>`,
  warning: `
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <polygon points="12,2 2,22 22,22" />
      <rect x="11" y="10" width="2" height="6" />
      <rect x="11" y="17" width="2" height="2" />
    </svg>`,
  error: `
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" stroke-linecap="round" stroke="white"/>
      <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" stroke-linecap="round" stroke="white"/>
    </svg>`
};

// 3. Màu nền cho từng type
const bgColors = {
  info: "#3b82f6", // blue-500
  warning: "#f59e0b", // yellow-500
  error: "#ef4444" // red-500
};

/**
 * Hiển thị thông báo
 * @param {'info'|'warning'|'error'} type   Kiểu thông báo
 * @param {string} message                  Nội dung thông báo
 * @param {number} [duration=3000]          Thời gian (ms) tồn tại
 */
export function showNotification(type, message, duration = 3000) {
  const iconSVG = icons[type] || icons.info;
  const bg = bgColors[type] || bgColors.info;

  // Tạo element thông báo
  const notif = document.createElement("div");
  Object.assign(notif.style, {
    backgroundColor: bg,
    color: "white",
    width: "250px",
    height: "70px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    opacity: "0",
    transform: "translateY(-20px)",
    transition: "opacity 0.3s ease, transform 0.3s ease"
  });

  // Nội dung
  notif.innerHTML =
    iconSVG + `<span style="font-size:14px; flex:1;">${message}</span>`;

  // Thêm vào container
  container.appendChild(notif);

  // Kick off animation
  requestAnimationFrame(() => {
    notif.style.opacity = "1";
    notif.style.transform = "translateY(0)";
  });

  // Tự ẩn sau duration
  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateY(-20px)";
    notif.addEventListener(
      "transitionend",
      () => {
        notif.remove();
      },
      { once: true }
    );
  }, duration);
}
