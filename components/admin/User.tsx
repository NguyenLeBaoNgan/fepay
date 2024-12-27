import React from 'react';
import DataTable from './DataTable';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserProps {
  users: User[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const User: React.FC<UserProps> = ({ users, onEdit, onDelete  }) => {
  return (
    <DataTable
      title="Users"
      data={users}
      columns={[
        { key: 'name', label: 'User Name' },
        { key: 'email', label: 'Email' },
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />

  );
};

export default User;
