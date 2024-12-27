"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Moon, Sun, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/axiosClient";
import { useAuth } from "@/components/AuthContext";
// Lấy token từ cookie
function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

const Header: React.FC = () => {
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  // const [isLoggedIn, setIsLoggedIn]   = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isLoggedIn = auth?.isLoggedIn; 
  // Kiểm tra xem user có token không
  // useEffect(() => {
  //   const token = getTokenFromCookie();
  //   setIsLoggedIn(!!token); // Cập nhật trạng thái đăng nhập dựa trên sự tồn tại của token
  // }, [router.pathname]); // Dependency array để kiểm tra khi đường dẫn thay đổi

  // Xử lý logout
  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/api/logout");

      if (response.status === 200) {
        document.cookie = "token=; Max-Age=0; path=/;"; // Xóa token khỏi cookie
        auth?.setIsLoggedIn(false);
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
        router.push("/auth/login"); // Chuyển hướng về trang login
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            Logo
          </Link>

          {/* Search Input */}
          <div className="flex-1 max-w-xl px-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search..." className="pl-8" />
            </div>
          </div>

          {/* Buttons: Theme Toggle + Auth */}
          <div className="flex items-center space-x-4">
            {/* Toggle Light/Dark Theme */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden sm:inline-flex"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {isLoggedIn? (
              <>
                {/* Logout Button */}
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>

                {/* Profile Link */}
                <Button asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>

                {/* Register Link */}
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
