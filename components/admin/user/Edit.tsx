import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosClient from "@/utils/axiosClient";

interface EditUserProps {
  editingUser: any;
  setEditingUser: (user: any | null) => void;
  users: any[];
  setUsers: (users: any[]) => void;
}

const EditUser: React.FC<EditUserProps> = ({
  editingUser,
  setEditingUser,
  users,
  setUsers,
}) => {
  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const response = await axiosClient.post(
        `/api/user/updateuser/${editingUser.id}`,
        editingUser
      );
      toast.success("User updated successfully!");
      setUsers(
        users.map((user) => (user.id === editingUser.id ? response.data : user))
      );
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user!");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">
        Chỉnh sửa người dùng
      </h2>
      <div className="space-y-6">
        {/* Tên người dùng */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tên người dùng
          </label>
          <input
            type="text"
            value={editingUser.name}
            onChange={(e) =>
              setEditingUser({ ...editingUser, name: e.target.value })
            }
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            value={editingUser.email}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            value={editingUser.password}
            onChange={(e) =>
              setEditingUser({ ...editingUser, password: e.target.value })
            }
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 mt-8 border-t">
          <button
            onClick={() => setEditingUser(null)}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
