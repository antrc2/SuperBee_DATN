import api from "./http";

const refreshToken = async () => {
  try {
    const res = await api.post("/refreshToken");
    console.log("🚀 ~ refreshToken ~ res:", res);
    const accessToken = res.data?.access_token;
    if (!accessToken) {
      throw new Error("No access token returned");
    }
    sessionStorage.setItem("access_token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Refresh token failed:", error);
    if (error.code === "ECONNABORTED") {
      alert("Máy chủ không phản hồi sau 10 giây. Vui lòng thử lại sau.");
    }
    throw error;
  }
};

export { refreshToken };
