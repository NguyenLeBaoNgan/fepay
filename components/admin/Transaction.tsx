"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { FaQrcode, FaFilter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import DataTable from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const templates = ["", "compact", "qronly"];

interface Transaction {
  id: string;
  gateway: string;
  transaction_date: string;
  amount_in: number;
  amount_out: number;
  account_number?: string;
}

const Transaction = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosClient.get("/api/transactions");
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (err) {
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const applyFilters = () => {
    let filteredData = [...transactions];

    // Lọc theo loại giao dịch
    switch (filter) {
      case "amount_in":
        filteredData = filteredData.filter((t) => t.amount_in > 0);
        break;
      case "amount_out":
        filteredData = filteredData.filter((t) => t.amount_out > 0);
        break;
      case "all":
      default:
        break;
    }

    // Lọc theo khoảng ngày
    if (startDate) {
      filteredData = filteredData.filter((t) => {
        const transactionDate = new Date(t.transaction_date);
        // Chuẩn hóa transactionDate về 00:00:00 để so sánh ngày
        transactionDate.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Chuẩn hóa startDate về đầu ngày

        // Nếu không có endDate hoặc endDate trùng startDate, lọc chính xác 1 ngày
        if (!endDate || start.getTime() === (endDate ? new Date(endDate).setHours(0, 0, 0, 0) : 0)) {
          return transactionDate.getTime() === start.getTime();
        }

        // Nếu có endDate khác startDate, lọc theo khoảng
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999); // Chuẩn hóa endDate về cuối ngày

        return transactionDate >= start && (!end || transactionDate <= end);
      });
    }

    setFilteredTransactions(filteredData);
  };

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
    applyFilters();
  };

  useEffect(() => {
    applyFilters();
  }, [dateRange, transactions]);

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
    );

  return (
    <div className="flex flex-col h-full bg-background">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-muted-foreground" />
                <Select value={filter} onValueChange={handleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter transactions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="amount_in">Amount In</SelectItem>
                    <SelectItem value="amount_out">Amount Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update: [Date | null, Date | null]) => {
                    setDateRange(update);
                  }}
                  placeholderText="Select Date Range"
                  className="w-[220px] border border-border rounded-md p-2 text-sm"
                  isClearable={true}
                />
              </div>
            </div>
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => setOpenQRDialog(true)}
            >
              <FaQrcode />
              Tạo QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <DataTable title="" data={filteredTransactions} columns={columns} />
        </CardContent>
      </Card>

      <Dialog open={openQRDialog} onOpenChange={setOpenQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">Tạo Thông Tin Thanh Toán QR Code</DialogTitle>
            <DialogDescription>Nhập thông tin tài khoản để tạo mã QR thanh toán</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nhập số tài khoản *"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
            <Input
              placeholder="Nhập tên ngân hàng (VD: MBBank, Vietcombank)*"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            />
            <Input
              placeholder="Số tiền (tuỳ chọn)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              placeholder="Nội dung chuyển khoản"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                {templates.filter((t) => t).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={generateQR}>
            Tạo QR Code
          </Button>

          {qrUrl && (
            <div className="mt-4 flex flex-col items-center">
              <div className="border border-border p-4 rounded-lg bg-muted/30">
                <Image
                  src={qrUrl || "/placeholder.svg"}
                  alt="QR Code"
                  width={200}
                  height={200}
                />
              </div>
              <Button variant="outline" className="mt-4" asChild>
                <a href={qrUrl + "&download=true"} download>Tải QR về</a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transaction;