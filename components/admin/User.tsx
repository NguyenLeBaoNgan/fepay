import React from 'react';
import DataTable from './DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string; 
}
interface UserProps {
  users: User[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const User: React.FC<UserProps> = ({ users, onEdit, onDelete }) => {
  return (
    <DataTable
      title="Users"
      data={users}
      columns={[
        { key: 'name', label: 'User Name' },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles', render: (row) => row.roles.join(', ') },
        { key: 'status', label: 'Status' }, 
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default User;
