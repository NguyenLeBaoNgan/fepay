import React from "react";
import DataTable from "./DataTable";
import { Card } from "@/components/ui/card";

interface Account {
  id: string;
  account_name: string;
  account_number: string;
  account_type: string;
  is_default: boolean;
  gateway: string;
  user_id: string;
}

const AccountList: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const handleEdit = async (id: string) => {
    console.log("Edit account", id);
  };
  const handleDelete = async (id: string) => {
    console.log("Delete account", id);
  };

  if (!accounts || accounts.length === 0) return <p>No accounts found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Account List
      </h1>

      <Card className="p-4 shadow-lg">
        {/* <pre>{JSON.stringify(accounts, null, 2)}</pre> */}

        <DataTable
          title=""
          data={accounts}
          columns={[
            { key: "account_name", label: "Account Name" },
            { key: "account_number", label: "Account Number" },
            { key: "account_type", label: "Account Type" },
            { key: "gateway", label: "Gateway" },
            { key: "user_id", label: "User ID" },
            { key: "is_default", label: "Default" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  );
};

export default AccountList;
