import React, { useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Landmark,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Download
} from "lucide-react";

// Dữ liệu giả lập
const cardTypes = [
  {
    id: "viettel",
    name: "Viettel",
    fee: 20,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Viettel&font=roboto"
  },
  {
    id: "mobifone",
    name: "Mobifone",
    fee: 20,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Mobifone&font=roboto"
  },
  {
    id: "vinaphone",
    name: "Vinaphone",
    fee: 21,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Vinaphone&font=roboto"
  },
  {
    id: "vietnamobile",
    name: "Vietnamobile",
    fee: 25,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=VNMobi&font=roboto"
  },
  {
    id: "zing",
    name: "Zing",
    fee: 18,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Zing&font=roboto"
  },
  {
    id: "garena",
    name: "Garena",
    fee: 18,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Garena&font=roboto"
  }
];

const cardDenominations = [
  { value: 10000, label: "10,000đ" },
  { value: 20000, label: "20,000đ" },
  { value: 30000, label: "30,000đ" },
  { value: 50000, label: "50,000đ" },
  { value: 100000, label: "100,000đ" },
  { value: 200000, label: "200,000đ" },
  { value: 300000, label: "300,000đ" },
  { value: 500000, label: "500,000đ" },
  { value: 1000000, label: "1,000,000đ" }
];

const bankInfo = {
  bankName: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
  accountNumber: "0123456789012",
  accountHolder: "CONG TY TNHH SUPERBEE",
  branch: "Chi nhánh TP. Hồ Chí Minh",
  transferContentPrefix: "NAPTIEN SB", // User should add their username
  qrCodeUrl: "https://placehold.co/200x200/E2E8F0/4A5568?text=Vietcombank+QR"
};

const initialRechargeHistory = [
  {
    id: "rh1",
    date: "30/05/2025 10:30",
    type: "Thẻ Viettel",
    code: "VT123456789",
    amount: 100000,
    received: 80000,
    status: "Thành công"
  },
  {
    id: "rh2",
    date: "29/05/2025 15:45",
    type: "Chuyển khoản VCB",
    code: "FT250529123",
    amount: 500000,
    received: 500000,
    status: "Thành công"
  },
  {
    id: "rh3",
    date: "28/05/2025 09:12",
    type: "Thẻ Zing",
    code: "ZING987654",
    amount: 50000,
    received: 0,
    status: "Thất bại - Sai mã thẻ"
  },
  {
    id: "rh4",
    date: "27/05/2025 18:00",
    type: "Thẻ Mobifone",
    code: "MB6543210",
    amount: 200000,
    received: 160000,
    status: "Đang xử lý"
  }
];

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};

export default function RechargeCard() {
  const [activeTab, setActiveTab] = useState("card"); // 'card' or 'bank'

  // Card recharge state
  const [selectedCardType, setSelectedCardType] = useState(cardTypes[0].id);
  const [serial, setSerial] = useState("");
  const [pin, setPin] = useState("");
  const [selectedDenomination, setSelectedDenomination] = useState(
    cardDenominations[0].value
  );
  const [cardFormErrors, setCardFormErrors] = useState({});
  const [cardSubmissionStatus, setCardSubmissionStatus] = useState(null); // { type: 'success'/'error', message: '' }

  // History state
  const [rechargeHistory, setRechargeHistory] = useState(
    initialRechargeHistory
  );
  const [showCopiedMessage, setShowCopiedMessage] = useState("");

  const handleCardTypeChange = (e) => {
    setSelectedCardType(e.target.value);
    setCardFormErrors((prev) => ({ ...prev, cardType: "" }));
  };

  const handleDenominationChange = (e) => {
    setSelectedDenomination(Number(e.target.value));
    setCardFormErrors((prev) => ({ ...prev, denomination: "" }));
  };

  const validateCardForm = () => {
    const errors = {};
    if (!selectedCardType) errors.cardType = "Vui lòng chọn loại thẻ.";
    if (!serial.trim()) errors.serial = "Vui lòng nhập số serial.";
    else if (!/^[a-zA-Z0-9]{8,20}$/.test(serial.trim()))
      errors.serial = "Serial không hợp lệ (8-20 ký tự, chữ và số).";
    if (!pin.trim()) errors.pin = "Vui lòng nhập mã PIN.";
    else if (!/^[a-zA-Z0-9]{8,20}$/.test(pin.trim()))
      errors.pin = "Mã PIN không hợp lệ (8-20 ký tự, chữ và số).";
    if (!selectedDenomination) errors.denomination = "Vui lòng chọn mệnh giá.";

    setCardFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    setCardSubmissionStatus(null);
    if (validateCardForm()) {
      // Simulate API call
      console.log("Submitting card:", {
        selectedCardType,
        serial,
        pin,
        selectedDenomination
      });
      setCardSubmissionStatus({
        type: "loading",
        message: "Đang xử lý yêu cầu nạp thẻ..."
      });
      setTimeout(() => {
        // Simulate success/failure
        const isSuccess = Math.random() > 0.3; // 70% success rate
        if (isSuccess) {
          setCardSubmissionStatus({
            type: "success",
            message: `Nạp thẻ ${
              cardTypes.find((c) => c.id === selectedCardType).name
            } mệnh giá ${formatCurrency(
              selectedDenomination
            )} thành công! Số tiền thực nhận (sau chiết khấu) sẽ được cập nhật vào tài khoản.`
          });
          // Add to history (example)
          const newHistoryEntry = {
            id: `rh${rechargeHistory.length + 1}`,
            date: new Date().toLocaleString("vi-VN"),
            type: `Thẻ ${
              cardTypes.find((c) => c.id === selectedCardType).name
            }`,
            code: serial.slice(0, 4) + "********" + serial.slice(-4),
            amount: selectedDenomination,
            received:
              selectedDenomination *
              (1 - cardTypes.find((c) => c.id === selectedCardType).fee / 100),
            status: "Thành công"
          };
          setRechargeHistory((prev) => [newHistoryEntry, ...prev]);
          // Reset form
          setSerial("");
          setPin("");
        } else {
          setCardSubmissionStatus({
            type: "error",
            message:
              "Nạp thẻ thất bại. Vui lòng kiểm tra lại thông tin thẻ hoặc thử lại sau."
          });
        }
      }, 2000);
    }
  };

  const currentCardFee =
    cardTypes.find((c) => c.id === selectedCardType)?.fee || 0;
  const amountReceived = selectedDenomination * (1 - currentCardFee / 100);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setShowCopiedMessage(fieldName);
        setTimeout(() => setShowCopiedMessage(""), 1500);
      })
      .catch((err) => {
        console.error("Không thể sao chép:", err);
        // Fallback for older browsers or if navigator.clipboard is not available (e.g. in http)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          setShowCopiedMessage(fieldName);
          setTimeout(() => setShowCopiedMessage(""), 1500);
        } catch (err) {
          console.error("Lỗi sao chép fallback:", err);
          alert("Không thể sao chép tự động. Vui lòng sao chép thủ công.");
        }
        document.body.removeChild(textArea);
      });
  };

  const getStatusClass = (status) => {
    if (status === "Thành công") return "bg-green-100 text-green-700";
    if (status === "Thất bại" || status.includes("Thất bại"))
      return "bg-red-100 text-red-700";
    if (status === "Đang xử lý") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (status === "Thành công")
      return <CheckCircle size={16} className="mr-1 text-green-500" />;
    if (status === "Thất bại" || status.includes("Thất bại"))
      return <AlertCircle size={16} className="mr-1 text-red-500" />;
    if (status === "Đang xử lý")
      return <Clock size={16} className="mr-1 text-yellow-500" />;
    return null;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Nạp Tiền Vào Tài Khoản
        </h1>

        {/* Tabs */}
        <div className="mb-8 flex justify-center border-b border-gray-300">
          <button
            onClick={() => setActiveTab("card")}
            className={`py-3 px-6 font-medium text-sm sm:text-base transition-colors duration-150
              ${
                activeTab === "card"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <CreditCard size={18} className="inline mr-2" /> Nạp Thẻ Cào
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`py-3 px-6 font-medium text-sm sm:text-base transition-colors duration-150
              ${
                activeTab === "bank"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <Landmark size={18} className="inline mr-2" /> Nạp Qua Ngân Hàng
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "card" && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Chọn loại thẻ và mệnh giá
            </h2>
            <form onSubmit={handleCardSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="cardType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loại thẻ
                </label>
                <select
                  id="cardType"
                  value={selectedCardType}
                  onChange={handleCardTypeChange}
                  className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    cardFormErrors.cardType
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {cardTypes.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </select>
                {cardFormErrors.cardType && (
                  <p className="text-red-500 text-xs mt-1">
                    {cardFormErrors.cardType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="serial"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Số Serial
                </label>
                <input
                  type="text"
                  id="serial"
                  value={serial}
                  onChange={(e) => {
                    setSerial(e.target.value);
                    setCardFormErrors((prev) => ({ ...prev, serial: "" }));
                  }}
                  placeholder="Nhập số serial trên thẻ"
                  className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    cardFormErrors.serial ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {cardFormErrors.serial && (
                  <p className="text-red-500 text-xs mt-1">
                    {cardFormErrors.serial}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mã PIN
                </label>
                <input
                  type="text"
                  id="pin"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setCardFormErrors((prev) => ({ ...prev, pin: "" }));
                  }}
                  placeholder="Nhập mã PIN của thẻ"
                  className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    cardFormErrors.pin ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {cardFormErrors.pin && (
                  <p className="text-red-500 text-xs mt-1">
                    {cardFormErrors.pin}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="denomination"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mệnh giá thẻ
                </label>
                <select
                  id="denomination"
                  value={selectedDenomination}
                  onChange={handleDenominationChange}
                  className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    cardFormErrors.denomination
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {cardDenominations.map((denom) => (
                    <option key={denom.value} value={denom.value}>
                      {denom.label}
                    </option>
                  ))}
                </select>
                {cardFormErrors.denomination && (
                  <p className="text-red-500 text-xs mt-1">
                    {cardFormErrors.denomination}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-sm text-yellow-700">
                <p>
                  <strong>Lưu ý:</strong> Vui lòng chọn đúng mệnh giá thẻ. Nếu
                  chọn sai mệnh giá, bạn có thể bị mất thẻ hoặc nhận được số
                  tiền không chính xác.
                </p>
                <p className="mt-2">
                  Chiết khấu hiện tại cho thẻ{" "}
                  {cardTypes.find((c) => c.id === selectedCardType)?.name}:{" "}
                  <strong className="text-red-600">{currentCardFee}%</strong>
                </p>
                <p>
                  Số tiền thực nhận:{" "}
                  <strong className="text-green-600">
                    {formatCurrency(amountReceived)}
                  </strong>
                </p>
              </div>

              {cardSubmissionStatus && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    cardSubmissionStatus.type === "success"
                      ? "bg-green-100 text-green-700"
                      : cardSubmissionStatus.type === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {cardSubmissionStatus.type === "loading" ? (
                    <Clock size={16} className="inline mr-2 animate-spin" />
                  ) : cardSubmissionStatus.type === "success" ? (
                    <CheckCircle size={16} className="inline mr-2" />
                  ) : (
                    <AlertCircle size={16} className="inline mr-2" />
                  )}
                  {cardSubmissionStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={cardSubmissionStatus?.type === "loading"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {cardSubmissionStatus?.type === "loading" ? (
                  <Clock size={20} className="mr-2 animate-spin" />
                ) : (
                  <CreditCard size={20} className="mr-2" />
                )}
                Nạp Thẻ
              </button>
            </form>
          </div>
        )}

        {activeTab === "bank" && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Thông tin chuyển khoản ngân hàng
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Vui lòng chuyển khoản chính xác nội dung để được cộng tiền tự
              động. Hỗ trợ 24/7.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-gray-500">Ngân hàng:</p>
                  <p className="font-semibold text-gray-800 text-base">
                    {bankInfo.bankName}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border relative">
                  <p className="text-gray-500">Số tài khoản:</p>
                  <p className="font-semibold text-gray-800 text-base">
                    {bankInfo.accountNumber}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(bankInfo.accountNumber, "accountNumber")
                    }
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {showCopiedMessage === "accountNumber" ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-gray-500">Chủ tài khoản:</p>
                  <p className="font-semibold text-gray-800 text-base">
                    {bankInfo.accountHolder}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border relative">
                  <p className="text-gray-500">
                    Nội dung chuyển khoản (ví dụ):
                  </p>
                  <p className="font-semibold text-red-600 text-base">
                    {bankInfo.transferContentPrefix} TAIKHOANCUAEM
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${bankInfo.transferContentPrefix} TAIKHOANCUAEM`,
                        "transferContent"
                      )
                    }
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {showCopiedMessage === "transferContent" ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Lưu ý: Thay "TAIKHOANCUAEM" bằng tên đăng nhập hoặc ID tài
                    khoản của bạn trên website.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={bankInfo.qrCodeUrl}
                  alt="Bank QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain border rounded-lg p-2 bg-white shadow-sm"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Quét mã QR để chuyển khoản nhanh
                </p>
                <a
                  href={bankInfo.qrCodeUrl}
                  download="Ma_QR_SuperBee.png"
                  className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Download size={16} className="mr-1" /> Tải mã QR
                </a>
              </div>
            </div>
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md text-sm text-blue-700">
              <h4 className="font-semibold mb-1">Quan trọng:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Chuyển khoản 24/7, tiền vào tài khoản sau 1-5 phút nếu đúng
                  nội dung.
                </li>
                <li>
                  Nếu sau 15 phút chưa nhận được tiền, vui lòng liên hệ hỗ trợ
                  kèm theo biên lai chuyển khoản.
                </li>
                <li>
                  Chúng tôi không chịu trách nhiệm nếu bạn chuyển sai thông tin
                  hoặc sai nội dung.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Lịch sử nạp tiền */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <History size={24} className="mr-3 text-blue-600" /> Lịch Sử Nạp
            Tiền
          </h2>
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            {rechargeHistory.length > 0 ? (
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Thời gian
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Hình thức
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Mã/Serial
                    </th>
                    <th className="p-3 text-right font-semibold text-gray-600">
                      Số tiền nạp
                    </th>
                    <th className="p-3 text-right font-semibold text-gray-600">
                      Thực nhận
                    </th>
                    <th className="p-3 text-center font-semibold text-gray-600">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rechargeHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-gray-700">{item.date}</td>
                      <td className="p-3 text-gray-700">{item.type}</td>
                      <td className="p-3 text-gray-700 font-mono">
                        {item.code}
                      </td>
                      <td className="p-3 text-gray-700 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="p-3 text-green-600 font-medium text-right">
                        {formatCurrency(item.received)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-gray-500">
                Chưa có lịch sử nạp tiền.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
