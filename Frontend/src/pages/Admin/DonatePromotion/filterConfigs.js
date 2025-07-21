export const DONATE_PROMOTION_FILTERS_CONFIG = [
  {
    type: "select",
    name: "status",
    label: "Trạng thái",
    options: [
      { label: "Tất cả", value: "" },
      { label: "Hoạt động", value: "1" },
      { label: "Ngưng", value: "0" },
    ],
  },
  {
    type: "number_range",
    name: "amount",
    label: "Phần trăm khuyến mãi",
    minName: "amount_min",
    maxName: "amount_max",
    placeholderMin: "Từ %",
    placeholderMax: "Đến %",
  }
];
