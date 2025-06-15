import React from "react";
import api from "../../../utils/http";

export default function ActiveDomain() {
  const postData = async (data) => {
    try {
      const res = await api.post("/domain/active", { ...data });
      console.log(res?.data?.status);
      if (res.data?.status == true) {
        alert("kich hoat thanh cong");
        window.location.reload();
      }
    } catch (error) {
      // console.log(error?.response?.data?.status);
      if (error?.response?.data?.status == false) {
        // showError(error?.response?.data?.message || "Không xác định");
        alert(error?.response?.data?.message || "Không xác định");
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const keyShop = e.target.keyShop.value;
    // console.log("Submitted keyShop:", keyShop);
    await postData({ keyShop: keyShop });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
        <h1>Vui lòng kiểm tra email của bạn</h1>
        <input
          type="text"
          name="keyShop"
          placeholder="Nhập key shop"
          style={{ padding: "8px", marginRight: "8px", fontSize: "16px" }}
          required
        />
        <button type="submit" style={{ padding: "8px 16px", fontSize: "16px" }}>
          Gửi
        </button>
      </form>
    </div>
  );
}
