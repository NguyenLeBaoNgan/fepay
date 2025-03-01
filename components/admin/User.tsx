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

  // Đồng bộ users từ props nếu nó thay đổi bên ngoài
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
    <div>
      <div className="flex justify-between mb-4">
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          Thêm người dùng
        </button>
      </div>

      <DataTable
        title="Danh sách người dùng"
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

      {isModalOpen && (
        <AddUser
          setUsers={setLocalUsers}
          users={localUsers}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default User;