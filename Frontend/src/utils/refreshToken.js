import api from "./http";

const refreshToken = async () => {
  try {
    const res = await api.post("/auth/refresh");
    const accessToken = res.data?.newAccessToken;
    if (!accessToken) {
      throw new Error("No access token returned");
    }
    localStorage.setItem("accessToken", accessToken);
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
