import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosClient from "@/utils/axiosClient";
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
        console.error("Error fetching roles:", error);
        toast.error("Lỗi lấy danh sách vai trò!");
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
        name: editingUser.name,
        email: editingUser.email,
        status: status,
        roles: selectedRole ? [selectedRole] : [],
      };

      const response = await axiosClient.post(`/api/updateuser/${editingUser.id}`, updatedData);
      const updatedUser = { ...response.data, roles: response.data.roles || editingUser.roles };

      setUsers(users.map((user) => (user.id === editingUser.id ? updatedUser : user)));
      toast.success("Cập nhật thành công!");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Lỗi cập nhật người dùng!");
    } finally {
      setLoading(false);
    }
  };

  if (!editingUser) return null;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border rounded-xl p-6">
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa người dùng</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Tên người dùng</Label>
          <Input value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
        </div>
        <div>
          <Label>Chọn vai trò</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => setEditingUser(null)}>Hủy</Button>
        <Button onClick={handleSave} disabled={loading} className={loading ? "opacity-50 cursor-not-allowed" : ""}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditUser;