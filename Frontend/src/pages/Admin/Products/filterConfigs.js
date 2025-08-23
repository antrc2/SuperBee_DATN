export const STATIC_PRODUCT_FILTERS = [
  {
    type: "select",
    name: "category_id",
    label: "Danh mục",
    options: [
      { label: "Tất cả", value: "" }, // Option "Tất cả"
      { label: "LQ", value: "18" },
      { label: "FF", value: "17" },
      { label: "Game RPG", value: "3" },
      // ... Thêm các danh mục khác (có thể lấy từ API)
    ],
  },
  {
    type: "select",
    name: "status",
    label: "Trạng thái",
    options: [
      { label: "Tất cả", value: "" },
      { label: "Đang bán", value: "1" },
      { label: "Đã khóa", value: "0" },
    ],
  },
  {
    type: "number_range", // Một loại tùy chỉnh cho khoảng số
    name: "price", // Tên chung cho khoảng giá
    label: "Khoảng giá",
    minName: "price_min", // Tên key cho giá trị tối thiểu gửi lên BE
    maxName: "price_max", // Tên key cho giá trị tối đa gửi lên BE
    placeholderMin: "Giá từ",
    placeholderMax: "Giá đến",
  },
];
