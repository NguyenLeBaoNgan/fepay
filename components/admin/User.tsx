import React from 'react';
import DataTable from './DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string; 
  render?: (row: any) =>React.ReactNode;
}
interface UserProps {
  users: User[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
    
const User: React.FC<UserProps> = ({ users, onEdit, onDelete }) => {
  const modifiedUsers = users.map(user => ({
    ...user,
    roles: user.roles.join(', '), 
  }));
  return (
    <DataTable
      title="Users"
      data={modifiedUsers}
      columns={[
        { key: 'name', label: 'User Name' },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles' },
        { key: 'status', label: 'Status' }, 
      ]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default User;
