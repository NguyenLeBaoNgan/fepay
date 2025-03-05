import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../utils/axiosClient";
import DataTable from "./DataTable";
import AddUser from "./user/Add";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
  render?: (row: any) => React.ReactNode;
}

interface UserProps {
  users: User[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const User: React.FC<UserProps> = ({ users: initialUsers, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalUsers(initialUsers);
  }, [initialUsers]);

  // Hàm gọi API tìm kiếm
  const fetchUsers = async (query: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Sending request with query:", query);
      const response = await axiosClient.get(
        `/api/getalluser${query ? `?search=${encodeURIComponent(query)}` : ""}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      console.log("Response data:", response.data);
      setLocalUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm debounce tự viết
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounce hàm fetchUsers với 300ms
  const debouncedSearch = useCallback(debounce(fetchUsers, 300), []);

  // Xử lý thay đổi input
  const handleSearch = (query: string) => {
    setSearchQuery(query); // Cập nhật query ngay lập tức để hiển thị trên UI
    debouncedSearch(query); // Gọi API tìm kiếm với debounce
  };

  const modifiedUsers = localUsers.map((user) => ({
    ...user,
    roles: user.roles.join(", "),
  }));

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <button
          onClick={handleOpenModal}
          className="w-full md:w-auto bg-indigo-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-0">
            Danh sách người dùng
          </h2>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm tên hoặc email..."
              className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              // Bỏ disabled để luôn cho phép gõ
            />
            {isLoading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
              </div>
            ) : (
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Đang tải dữ liệu...</div>
          ) : modifiedUsers.length > 0 ? (
            <DataTable
              title=""
              data={modifiedUsers}
              columns={[
                { key: "name", label: "Tên người dùng" },
                { key: "email", label: "Email" },
                { key: "roles", label: "Vai trò" },
                { key: "status", label: "Trạng thái" },
              ]}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              Không tìm thấy người dùng nào.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <AddUser
              setUsers={setLocalUsers}
              users={localUsers}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default User;