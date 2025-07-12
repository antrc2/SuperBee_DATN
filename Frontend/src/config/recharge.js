// src/config/recharge.js

// Dữ liệu các loại thẻ
export const cardTypes = [
  {
    id: "VIETTEL",
    name: "Viettel",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Viettel&font=roboto",
  },
  {
    id: "MOBIFONE",
    name: "Mobifone",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Mobifone&font=roboto",
  },
  {
    id: "VINAPHONE",
    name: "Vinaphone",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Vinaphone&font=roboto",
  },
  {
    id: "GATE",
    name: "Gate",

    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Gate&font=roboto",
  },
  {
    id: "ZING",
    name: "Zing",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Zing&font=roboto",
  },
  {
    id: "GARENA",
    name: "Garena",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Garena&font=roboto",
  },
  {
    id: "VCOIN",
    name: "Vcoin",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Vcoin&font=roboto",
  },
  {
    id: "VNMOBI",
    name: "VNMobi",
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=VNMobi&font=roboto",
  },
];

export const cardDenominations = [
  { value: 10000, label: "10,000đ" },
  { value: 20000, label: "20,000đ" },
  { value: 30000, label: "30,000đ" },
  { value: 50000, label: "50,000đ" },
  { value: 100000, label: "100,000đ" },
  { value: 200000, label: "200,000đ" },
  { value: 300000, label: "300,000đ" },
  { value: 500000, label: "500,000đ" },
  { value: 1000000, label: "1,000,000đ" },
];
// Hàm định dạng tiền tệ
export const formatCurrencyVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
