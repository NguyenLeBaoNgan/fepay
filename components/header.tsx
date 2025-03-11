import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Moon,
  Sun,
  Search,
  LogOut,
  User,
  Settings,
  ShoppingCart,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/axiosClient";
import { useAuth } from "@/components/AuthContext";
import { cn } from "@/lib/utils";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("auth_token=")); // Thay 'token=' bằng 'auth_token='
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

const Header: React.FC = () => {
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string }[]
  >([]);
  const [exactMatch, setExactMatch] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(auth?.user?.name || ""); // Lấy từ auth.user nếu có
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getTokenFromCookie();
      console.log("Header: Token from cookie:", token);
      console.log("Header: auth.isLoggedIn:", auth?.isLoggedIn);
      console.log("Header: auth.user:", auth?.user);
      if (token && auth?.isLoggedIn) {
        try {
          const response = await apiClient.get("/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Header: User data from API:", response.data);
          setUserName(response.data.name || "User");
        } catch (err: any) {
          console.error(
            "Header: Fetch user failed:",
            err.response?.data || err.message
          );
          setUserName("User");
        }
      } else {
        console.log("Header: No token or not logged in");
      }
    };
    // Nếu auth.user đã có name, không cần gọi API
    if (!auth?.user?.name) {
      fetchUser();
    } else {
      setUserName(auth.user.name);
    }
  }, [auth?.isLoggedIn, auth?.user]);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/api/logout");
      if (response.status === 200) {
        document.cookie = "auth_token=; Max-Age=0; path=/;"; // Thay 'token=' bằng 'auth_token='
        auth?.setIsLoggedIn(false);
        // auth?.setUser(null);
        // setUserName("User");
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
        router.push("/auth/login");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setExactMatch(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/api/products/search", {
        name: query,
      });
      if (response.status === 200) {
        setSuggestions(response.data.suggestions || []);
        setExactMatch(response.data.exact_match || null);
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to fetch suggestions");
      setSuggestions([]);
      setExactMatch(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (id: string) => {
    router.push(`/product/${id}`);
  };

  const handleEnterSearch = () => {
    if (exactMatch) {
      router.push(`/product/${exactMatch.id}`);
    } else {
      router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(
        cartItems.reduce(
          (total: any, item: { quantity: any }) => total + item.quantity,
          0
        )
      );
    };

    // Cập nhật số lượng ngay khi component mount
    updateCartCount();

    // Theo dõi sự thay đổi của localStorage
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  if (!mounted) return null;
  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            Logo
          </Link>

          <div className="flex-1 max-w-xl px-4 relative">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleEnterSearch()}
              />
            </div>
            {suggestions.length > 0 && searchTerm && (
              <ul className="absolute z-10 mt-1 w-full border rounded-md bg-white shadow-md max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSearch(suggestion.id)}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
            {error && searchTerm && (
              <p className="absolute mt-1 text-red-500 text-sm">{error}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
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

            {auth?.isLoggedIn ? (
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer">
                  <span className="text-lg font-semibold text-indigo-600">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div
                  className={cn(
                    "absolute right-0 mt-2 w-48 bg-white  rounded-md shadow-lg py-2 z-10",
                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    "transition-all duration-200 ease-in-out"
                  )}
                >
                  {auth?.user?.roles?.length > 0 &&
                    auth?.user?.roles?.[0]?.name?.toLowerCase() === "admin" && (
                      <Link
                        href="/admin/AdminDashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <AcademicCapIcon className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    )}
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/order-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    OrderHistory
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </>
            )}
            <Button variant="outline" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
