import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  //  baseURL: "https://api.nganbao.id.vn",
  // baseURL: "http://127.0.0.1:8000/",
  baseURL: "https://a07e-1-53-82-217.ngrok-free.app",
  withCredentials: true,
});

// Hàm lấy CSRF token từ Laravel Sanctum
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCsrfToken = async () => {
  try {
    await axiosClient.get("/sanctum/csrf-cookie");
    console.log("CSRF cookie đã được thiết lập thành công.");
  } catch (error) {
    console.error("Lỗi khi lấy CSRF token:", error);
    throw error;
  }
};

export default axiosClient;
