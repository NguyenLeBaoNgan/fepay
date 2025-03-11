import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, registerUser } from "@/service/authService";
import Cookies from "js-cookie"; 
import axiosClient from "@/utils/axiosClient"; 
interface AuthContextType {
  [x: string]: any;
  user: any;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

 
  const restoreAuthState = async () => {
    const token = Cookies.get("auth_token"); 
    if (token) {
      try {
      
        const response = await axiosClient.get("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        Cookies.remove("auth_token");
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    restoreAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await loginUser(email, password);
    setUser(userData);
    setIsLoggedIn(true);
  
    if (userData.token) {
      Cookies.set("auth_token", userData.token, { expires: 7 }); 
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    const userData = await registerUser(
      name,
      email,
      password,
      password_confirmation
    );
    setUser(userData);
    setIsLoggedIn(true);

    if (userData.token) {
      Cookies.set("auth_token", userData.token, { expires: 7 });
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsLoggedIn(false);
    Cookies.remove("auth_token"); 
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, setIsLoggedIn, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};