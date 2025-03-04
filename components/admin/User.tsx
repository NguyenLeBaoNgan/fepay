import React, { useState } from "react";
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

const User: React.FC<UserProps> = ({ users, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  React.useEffect(() => {
    setLocalUsers(users);
  }, [users]);

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
    <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
        <button
          onClick={handleOpenModal}
          className="bg-indigo-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 ease-in-out"
        >
          Thêm người dùng
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <DataTable
          title="User"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
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