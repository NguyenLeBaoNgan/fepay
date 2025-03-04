import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axiosClient from "@/utils/axiosClient";
import Header from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setUpdatedUser(response.data);
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
    setUpdatedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = Cookies.get("auth_token");
      const dataToSubmit = {
        ...updatedUser,
        password: updatedUser.password || user.password,
      };
      await axiosClient.put("/api/users", dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(updatedUser);
      setIsEditing(false);
      toast({ title: "Success", description: "Your profile has been updated." });
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
      <div className="flex justify-center items-center h-screen text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-medium">
        {error}
      </div>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800"> Profile</h1>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-indigo-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                name="name"
                value={updatedUser.name || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={cn(
                  "w-full rounded-md border-gray-300",
                  !isEditing && "bg-gray-50 text-gray-600 cursor-not-allowed"
                )}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                name="email"
                value={updatedUser.email || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={cn(
                  "w-full rounded-md border-gray-300",
                  !isEditing && "bg-gray-50 text-gray-600 cursor-not-allowed"
                )}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                name="password"
                value={updatedUser.password || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-md border-gray-300",
                  !isEditing && "bg-gray-50 text-gray-600 cursor-not-allowed"
                )}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleUpdate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2 rounded-md"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;