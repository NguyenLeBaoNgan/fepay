// Header.tsx (giữ nguyên phần lớn mã của bạn, chỉ kiểm tra lại)
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

function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

const Header: React.FC = () => {
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [exactMatch, setExactMatch] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug trạng thái trong Header
  useEffect(() => {
    console.log("Header: auth.isLoggedIn:", auth?.isLoggedIn);
  }, [auth?.isLoggedIn]);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/api/logout");
      if (response.status === 200) {
        document.cookie = "token=; Max-Age=0; path=/;";
        auth?.setIsLoggedIn(false);
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
      const response = await apiClient.post("/api/products/search", { name: query });
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
            {error && searchTerm && <p className="absolute mt-1 text-red-500 text-sm">{error}</p>}
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
              <>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                <Button asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button>
                  <Link href="/cart">Cart</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
                <Button>
                  <Link href="/cart">Cart</Link>
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