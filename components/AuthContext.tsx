import React, { createContext, useContext, useState } from "react";
import { loginUser, logoutUser, registerUser } from "@/service/authService";

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Thêm state isLoggedIn

  const login = async (email: string, password: string) => {
    const userData = await loginUser(email, password);
    setUser(userData);
    setIsLoggedIn(true); // Đánh dấu trạng thái đăng nhập thành công
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    const userData = await registerUser(name, email, password, password_confirmation);
    setUser(userData);
    setIsLoggedIn(true); // Đánh dấu trạng thái đăng ký thành công
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsLoggedIn(false); // Đánh dấu trạng thái đăng xuất
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, setIsLoggedIn, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
