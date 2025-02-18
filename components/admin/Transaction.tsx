import axiosClient from "@/utils/axiosClient";
import { useState, useEffect } from "react";
import { FaSearchDollar } from "react-icons/fa";
import { Button } from "../ui/button";
import DataTable from "./DataTable"; // Import DataTable

const Transaction = () => {
  interface Transaction {
    id: string;
    gateway: string;
    transaction_date: string;
    amount_in: number;
    amount_out: number;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dữ liệu giao dịch từ API
    const fetchTransactions = async () => {
      try {
        const response = await axiosClient.get("/api/transactions"); // Đảm bảo axiosClient được cấu hình đúng
        const data = response.data;
        setTransactions(data);
      } catch (err) {
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false); // Set loading thành false dù thành công hay lỗi
      }
    };

    fetchTransactions();
  }, []); // Chạy once khi component mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Cấu hình các cột cho DataTable
  const columns = [
    { key: "id", label: "ID" },
    { key: "gateway", label: "Gateway" },
    { key: "account_number", label: "STK" },
    { key: "transaction_date", label: "Date" },
    { key: "amount_in", label: "Amount In" },
    { key: "amount_out", label: "Amount Out" },
  ];

  const handleEdit = (id: string) => {
    console.log(`Edit transaction with ID: ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Delete transaction with ID: ${id}`);
  };

  return (
    <div className="flex flex-col p-6 h-full bg-muted text-muted-foreground">
      <div className="flex justify-between items-center mb-8">
        {/* <h2 className="text-2xl font-semibold">Giao dịch</h2> */}
        <div className="mt-8">
          <Button variant="default" className="flex items-center">
            <FaSearchDollar className="mr-2" />
            Thêm tài khoản
          </Button>
        </div>
        <Button variant="ghost" className="flex items-center">
          <FaSearchDollar className="mr-2" />
          Search
        </Button>
      </div>

      <DataTable
        title="Transactions"
        data={transactions}
        columns={columns}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
      />
    </div>
  );
};

export default Transaction;
