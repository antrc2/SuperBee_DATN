// src/pages/accounts/helpers.js

// Helper để format số tiền
export const formatCurrency = (amount, currency = "VND") => {
  return Number(amount || 0).toLocaleString("vi-VN") + ` ${currency}`;
};

// Helper để format ngày giờ
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN");
};

// Helper để map trạng thái giao dịch
export const getTransactionStatus = (status) => {
  switch (status) {
    case 0:
      return <span className="text-yellow-500 font-medium">Đang chờ</span>;
    case 1:
      return <span className="text-green-500 font-medium">Hoàn thành</span>;
    case 2:
      return <span className="text-red-500 font-medium">Thất bại</span>;
    default:
      return <span className="text-gray-400">Không rõ</span>;
  }
};
// Helper để map trạng thái thẻ cào
export const getRechargeCardStatus = (status) => {
  switch (status) {
    case 1:
      return <span className="text-green-600 font-medium">Thẻ đúng</span>;
    case 2:
      return <span className="text-red-600 font-medium">Sai mệnh giá</span>;
    case 3:
      return <span className="text-red-600 font-medium">Thẻ lỗi</span>;
    case 99:
      return <span className="text-yellow-600 font-medium">Đang xử lý</span>;
    default:
      return <span className="text-gray-500">Không rõ</span>;
  }
};

// Helper để map loại giao dịch ví
export const getTransactionTypeLabel = (type) => {
  switch (type) {
    case "recharge_card":
      return "Nạp thẻ cào";
    case "recharge_bank":
      return "Nạp ngân hàng";
    case "purchase":
      return "Mua hàng";
    case "withdraw":
      return "Rút tiền";
    case "commission":
      return "Hoa hồng";
    case "refund":
      return "Hoàn tiền";
    default:
      return type;
  }
};

// Helper để map tên quyền
export const getRoleDisplayName = (roleName) => {
  switch (roleName) {
    case "admin":
      return "Admin";
    case "user":
      return "Người dùng";
    case "partner":
      return "Đối tác";
    case "reseller":
      return "Đại lý";
    default:
      return roleName;
  }
};
