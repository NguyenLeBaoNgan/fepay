import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosClient from "@/utils/axiosClient";
import { AxiosError } from "axios"; // Import AxiosError
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  roles: string[];
}

interface ErrorResponse {
  message?: string;
}

interface EditUserProps {
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

const EditUser: React.FC<EditUserProps> = ({ editingUser, setEditingUser, users, setUsers }) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosClient.get("/api/roles");
        if (Array.isArray(response.data)) {
          setRoles(response.data.map((role: any) => role.name));
        } else {
          toast.error("Dữ liệu vai trò không hợp lệ!");
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error("Error fetching roles:", axiosError);
        toast.error(axiosError.response?.data?.message || "Lỗi lấy danh sách vai trò!");
      }
    };

    if (editingUser) {
      fetchRoles();
      setStatus(editingUser.status || "active");
      setSelectedRole(editingUser.roles?.[0] || "");
    }
  }, [editingUser]);

  const handleSave = async () => {
    if (!editingUser) return;

    setLoading(true);
    try {
      const updatedData = {
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        status,
        roles: selectedRole ? [selectedRole] : [],
      };

      if (!updatedData.name || !updatedData.email) {
        throw new Error("Tên và email là bắt buộc!");
      }

      const response = await axiosClient.post(`/api/updateuser/${editingUser.id}`, updatedData);
      const updatedUser = { ...response.data, roles: response.data.roles || editingUser.roles };

      setUsers(users.map((user) => (user.id === editingUser.id ? updatedUser : user)));
      toast.success("Cập nhật người dùng thành công!");
      setEditingUser(null);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error updating user:", axiosError);
      toast.error(
        axiosError.response?.data?.message || axiosError.message || "Lỗi cập nhật người dùng!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 ">
        <CardHeader className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-blue-500"></span> Chỉnh sửa người dùng
          </h2>
          <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin người dùng một cách dễ dàng</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">
              Tên người dùng
            </Label>
            <Input
              id="name"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              placeholder="Nhập tên người dùng"
              className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              placeholder="Nhập email"
              className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 font-medium">
              Vai trò
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role" className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg rounded-md">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      {role}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">Không có vai trò</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700 font-medium">
              Trạng thái
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg rounded-md">
                <SelectItem value="active" className="hover:bg-blue-50 transition-colors duration-150">
                  <span className="text-green-600">●</span> Active
                </SelectItem>
                <SelectItem value="locked" className="hover:bg-blue-50 transition-colors duration-150">
                  <span className="text-red-600">●</span> Locked
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-200 p-6 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setEditingUser(null)}
            className="px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-100 transition-all duration-200"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                </svg>
                Đang lưu...
              </span>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditUser;