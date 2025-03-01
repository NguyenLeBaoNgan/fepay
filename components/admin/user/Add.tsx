import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosClient from "@/utils/axiosClient";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
}

interface ErrorResponse {
  message?: string;
}

interface AddUserProps {
  setUsers: (users: User[]) => void;
  users: User[];
  onClose: () => void;
}

const AddUser: React.FC<AddUserProps> = ({ setUsers, users, onClose }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
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
        toast.error(axiosError.response?.data?.message || "Lỗi lấy danh sách vai trò!");
      }
    };
    fetchRoles();
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const newUserData = {
        name: name.trim(),
        email: email.trim(),
        status,
        roles: selectedRole ? [selectedRole] : [],
      };

      if (!newUserData.name || !newUserData.email) {
        throw new Error("Tên và email là bắt buộc!");
      }

      const response = await axiosClient.post("/api/users", newUserData);
      const newUser: User = {
        id: response.data.id || Date.now().toString(), 
        name: response.data.name || newUserData.name,
        email: response.data.email || newUserData.email,
        roles: response.data.roles || newUserData.roles,
        status: response.data.status || newUserData.status, 
      };

      setUsers([...users, newUser]);
      toast.success("Thêm người dùng thành công!");
      onClose();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(
        axiosError.response?.data?.message || axiosError.message || "Lỗi thêm người dùng!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100">
        <CardHeader className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-green-500"></span> Thêm người dùng mới
          </h2>
          <p className="text-sm text-gray-500 mt-1">Tạo người dùng mới nhanh chóng và dễ dàng</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên người dùng</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên người dùng"
              className="w-full border-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className="w-full border-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role" className="w-full border-gray-300 focus:ring-2 focus:ring-green-500">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role} value={role}>
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
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full border-gray-300 focus:ring-2 focus:ring-green-500">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="text-green-600">●</span> Active
                </SelectItem>
                <SelectItem value="locked">
                  <span className="text-red-600">●</span> Locked
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-200 p-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Đang thêm..." : "Thêm người dùng"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddUser;