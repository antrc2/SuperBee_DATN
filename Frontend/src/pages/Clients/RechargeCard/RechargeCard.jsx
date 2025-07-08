import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  CreditCard,
  Landmark,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Download,
} from "lucide-react";
import api from "@utils/http";

const cardTypes = [
  {
    id: "VIETTEL",
    name: "Viettel",
    fee: 20,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Viettel&font=roboto",
  },
  {
    id: "MOBIFONE",
    name: "Mobifone",
    fee: 20,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Mobifone&font=roboto",
  },
  {
    id: "VINAPHONE",
    name: "Vinaphone",
    fee: 21,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Vinaphone&font=roboto",
  },
  {
    id: "GATE",
    name: "Gate",
    fee: 18,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Gate&font=roboto",
  },
  {
    id: "ZING",
    name: "Zing",
    fee: 18,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Zing&font=roboto",
  },
  {
    id: "GARENA",
    name: "Garena",
    fee: 18,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Garena&font=roboto",
  },
  {
    id: "VCOIN",
    name: "Vcoin",
    fee: 18,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=Vcoin&font=roboto",
  },
  {
    id: "VNMOBI",
    name: "VNMobi",
    fee: 25,
    logo: "https://placehold.co/100x40/E2E8F0/4A5568?text=VNMobi&font=roboto",
  },
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
  { value: 1000000, label: "1,000,000đ" },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function RechargeCard() {
  const [activeTab, setActiveTab] = useState("card");
  const [selectedCardType, setSelectedCardType] = useState(cardTypes[0].id);
  const [serial, setSerial] = useState("");
  const [pin, setPin] = useState("");
  const [selectedDenomination, setSelectedDenomination] = useState(
    cardDenominations[0].value
  );
  const [cardFormErrors, setCardFormErrors] = useState({});
  const [cardSubmissionStatus, setCardSubmissionStatus] = useState(null);
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [showCopiedMessage, setShowCopiedMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const bankInfo = user
    ? {
        bankName: "Ngân hàng Quân đội (MB Bank)",
        accountNumber: "0838411897",
        accountHolder: "NGUYỄN NGỌC AN",
        branch: "Chi nhánh Hà Nội",
        transferContentPrefix: `${user.donate_code} NAPTIEN`,
        qrCodeUrl: `https://img.vietqr.io/image/MB-0838411897-qr_only.png?addInfo=${user.donate_code}`,
      }
    : null;

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
    return errors;
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setCardSubmissionStatus(null);
    const errors = validateCardForm();
    setCardFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setCardSubmissionStatus({
        type: "loading",
        message: "Đang xử lý yêu cầu nạp thẻ...",
      });

      const requestData = {
        telco: selectedCardType,
        amount: selectedDenomination,
        serial: serial.trim(),
        code: pin.trim(),
      };

      console.log("Sending request data:", requestData);

      const response = await api.post("/donate/card", requestData);

      console.log("Backend response:", response.data);

      const { status, message, data } = response.data;

      if (status && data?.status === 99) {
        setCardSubmissionStatus({
          type: "loading",
          message: "Đang xử lý thẻ cào, vui lòng đợi trong giây lát.",
        });

        let receivedAmount = selectedDenomination * (1 - currentCardFee / 100);

        const newHistoryEntry = {
          id: `rh${Date.now()}`,
          date: new Date().toLocaleString("vi-VN"),
          type: `Thẻ ${cardTypes.find((c) => c.id === selectedCardType).name}`,
          code: serial.slice(0, 4) + "********" + serial.slice(-4),
          amount: selectedDenomination,
          received: receivedAmount,
          status: "Đang xử lý",
          requestId: data.request_id || null,
        };

        setRechargeHistory((prev) => [newHistoryEntry, ...prev]);

        setSerial("");
        setPin("");

        setTimeout(() => {
          setCardSubmissionStatus({
            type: "success",
            message: "Thẻ đã được gửi xử lý thành công!",
          });
        }, 2000);
      } else {
        setCardSubmissionStatus({
          type: "error",
          message:
            message === "Dữ liệu thẻ không đúng"
              ? "Dữ liệu thẻ không đúng, vui lòng kiểm tra số seri và mã thẻ."
              : message || "Nạp thẻ thất bại. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Error:", error.response?.data);

      let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
      if (error.response?.data?.message === "INPUT_DATA_INCORRECT") {
        errorMessage =
          "Dữ liệu thẻ không đúng, vui lòng kiểm tra số seri và mã thẻ.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }

      setCardSubmissionStatus({
        type: "error",
        message: errorMessage,
      });
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
        alert("Không thể sao chép tự động. Vui lòng sao chép thủ công.");
      });
  };

  const getStatusClass = (status) => {
    if (status === "Thành công") return "bg-green-100 text-green-700";
    if (status.includes("Thất bại")) return "bg-red-100 text-red-700";
    if (status === "Đang xử lý") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (status === "Thành công")
      return <CheckCircle size={16} className="mr-1 text-green-500" />;
    if (status.includes("Thất bại"))
      return <AlertCircle size={16} className="mr-1 text-red-500" />;
    if (status === "Đang xử lý")
      return <Clock size={16} className="mr-1 text-yellow-500" />;
    return null;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-main-title mb-8">
          Nạp Tiền Vào Tài Khoản
        </h1>

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

        {activeTab === "card" && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-main-title mb-6">
              Chọn loại thẻ và mệnh giá
            </h2>
            <form onSubmit={handleCardSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="telco"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Loại thẻ
                </label>
                <select
                  id="telco"
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
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mã PIN
                </label>
                <input
                  type="text"
                  id="code"
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
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mệnh giá thẻ
                </label>
                <select
                  id="amount"
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

        {activeTab === "bank" && bankInfo && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
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
              <div className="mt-6 w-full max-w-md text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Ngân hàng:</strong> {bankInfo.bankName}
                </p>
                <p className="mb-2 flex items-center">
                  <strong>Số tài khoản:</strong> {bankInfo.accountNumber}
                  <button
                    onClick={() =>
                      copyToClipboard(bankInfo.accountNumber, "accountNumber")
                    }
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    <Copy size={16} />
                  </button>
                  {showCopiedMessage === "accountNumber" && (
                    <span className="ml-2 text-green-600 text-xs">
                      Đã sao chép!
                    </span>
                  )}
                </p>
                <p className="mb-2">
                  <strong>Chủ tài khoản:</strong> {bankInfo.accountHolder}
                </p>
                <p className="mb-2">
                  <strong>Chi nhánh:</strong> {bankInfo.branch}
                </p>
                <p className="mb-2 flex items-center">
                  <strong>Nội dung chuyển khoản:</strong>{" "}
                  {bankInfo.transferContentPrefix}
                  <button
                    onClick={() =>
                      copyToClipboard(
                        bankInfo.transferContentPrefix,
                        "transferContent"
                      )
                    }
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    <Copy size={16} />
                  </button>
                  {showCopiedMessage === "transferContent" && (
                    <span className="ml-2 text-green-600 text-xs">
                      Đã sao chép!
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-main-title mb-6 flex items-center">
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
