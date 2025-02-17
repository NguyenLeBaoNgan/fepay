import axiosClient, { getCsrfToken } from "@/utils//axiosClient";
import Cookies from "js-cookie";

// Đăng ký người dùng
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  password_confirmation: string
) => {
  await getCsrfToken(); // Nhận CSRF token

  const response = await axiosClient.post("api/register", {
    name,
    email,
    password,
    password_confirmation,
  });

  const { user, token } = response.data;

  Cookies.set("auth_token", token, { expires: 7 }); // Token tồn tại trong 7 ngày

  return user;
};

// Đăng nhập người dùng
export const loginUser = async (email: string, password: string) => {
  try {
    await getCsrfToken();
    axiosClient.defaults.headers.post["Content-Type"] = "application/json";

    const response = await axiosClient.post("/api/login", { email, password });

    console.log("API response:", response); // Debug toàn bộ response

    // Đảm bảo chỉ trả về `response.data`
    if (!response.data) {
      throw new Error("Response data is missing");
    }

    const { token, role } = response.data;

    // Lưu token vào cookie
    Cookies.set("auth_token", token, { expires: 7 });

    return response.data; // Trả về `data` để sử dụng sau này
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error(
      (error as any).response?.data?.message || "Login failed. Please try again."
    );
  }
};

// Đăng xuất người dùng
export const logoutUser = async () => {
  await axiosClient.post("/logout");
  Cookies.remove("auth_token");
};
