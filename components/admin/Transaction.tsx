"use client";
import axiosClient from "@/utils/axiosClient";
import { useState, useEffect } from "react";
import { FaAddressBook, FaQrcode, FaSearchDollar } from "react-icons/fa";
import { Button } from "../ui/button";
import DataTable from "./DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"; // Import Dialog
import { Input } from "../ui/input";
import Image from "next/image";

const templates = ["", "compact", "qronly"];

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
  const [openQRDialog, setOpenQRDialog] = useState(false); // Trạng thái mở dialog
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosClient.get("/api/transactions");
        setTransactions(response.data);
      } catch (err) {
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const generateQR = () => {
    if (!account || !bank) {
      alert("Số tài khoản và ngân hàng là bắt buộc");
      return;
    }
    const url = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${amount}&des=${encodeURIComponent(
      description
    )}&template=${template}&download=false`;
    setQrUrl(url);
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "gateway", label: "Gateway" },
    { key: "account_number", label: "STK" },
    { key: "transaction_date", label: "Date" },
    { key: "amount_in", label: "Amount In" },
    { key: "amount_out", label: "Amount Out" },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col p-6 h-full bg-muted text-muted-foreground">
      <div className="flex justify-between items-center mb-8">
       
          {/* <Button variant="default" className="flex items-center">
            <FaAddressBook className="mr-2" />
            Thêm tài khoản
          </Button> */}
          
      
        <Button
            variant="default"
            className="flex items-center"
            onClick={() => setOpenQRDialog(true)}
          >
            <FaQrcode className="mr-2" />
            Tạo QR
          </Button>
        {/* <Button variant="ghost" className="flex items-center">
          <FaSearchDollar className="mr-2" />
          Search
        </Button> */}
      </div>

      <DataTable title="Transactions" data={transactions} columns={columns} />

      <Dialog open={openQRDialog} onOpenChange={setOpenQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-400">Tạo Thông Tin Thanh Toán QR Code</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Nhập số tài khoản *"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="Nhập tên ngân hàng (VD: MBBank, Vietcombank)*"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="Số tiền (tuỳ chọn)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="Nội dung chuyển khoản"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-3"
          />
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="mb-3 border p-2 rounded w-full"
          >
            <option value="">Chọn Template</option>
            {templates.map((t) => (
              <option key={t} value={t}>
                {t || "Mặc định"}
              </option>
            ))}
          </select>

          <Button className="w-full" onClick={generateQR}>
            Tạo QR Code
          </Button>

          {qrUrl && (
            <div className="mt-4 flex flex-col items-center">
              <Image src={qrUrl} alt="QR Code" width={200} height={200} />
              <a href={qrUrl + "&download=true"} download className="mt-2 text-blue-500 underline">
                Tải QR về
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transaction;
