// pages/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axiosClient from "@/utils/axiosClient";
import Header from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false); // Trạng thái chỉnh sửa
  const [updatedUser, setUpdatedUser] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        router.push("/api/login");
        return;
      }

      try {
        const response = await axiosClient.get("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setUpdatedUser(response.data); // Khởi tạo giá trị ban đầu để chỉnh sửa
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch profile");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUser((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const token = Cookies.get("auth_token");
      const dataToSubmit = {
        ...updatedUser,
        password: updatedUser.password ? updatedUser.password : user.password, // Giữ mật khẩu cũ nếu không thay đổi
      };
      await axiosClient.put("/api/users", updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <>
      <Header />
      <div className="container mx-auto mt-8 p-4">
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Your Profile
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                name="name"
                value={updatedUser.name || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                name="email"
                value={updatedUser.email || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={updatedUser.password || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                } p-2 mt-1 border border-gray-300 rounded-md`}
              />
            </div>
            {/* Thêm thông tin khác nếu cần */}
          </div>
          <div className="flex justify-between mt-6">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
