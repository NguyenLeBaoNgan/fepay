"use client";

import { useState, useEffect, useCallback } from "react";
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
  account_number: string;
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

  const applyFilters = useCallback(() => {
    let filteredData = [...transactions];

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

    if (startDate) {
      filteredData = filteredData.filter((t) => {
        const transactionDate = new Date(t.transaction_date);
        transactionDate.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        if (!endDate || start.getTime() === (endDate ? new Date(endDate).setHours(0, 0, 0, 0) : 0)) {
          return transactionDate.getTime() === start.getTime();
        }

        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        return transactionDate >= start && (!end || transactionDate <= end);
      });
    }

    setFilteredTransactions(filteredData);
  }, [transactions, filter, startDate, endDate]);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
    applyFilters();
  };

  useEffect(() => {
    applyFilters();
  }, [dateRange, transactions, applyFilters]);

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
    { key: "transaction_date", label: "Ngày Giao Dịch" },
    { key: "amount_in", label: "Tiền Vào" },
    { key: "amount_out", label: "Tiền Ra" },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg font-semibold px-4 text-center">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6">
      {/* Header Card */}
      <Card className="mb-6 shadow-lg border-none bg-white:bg-dark rounded-xl">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800:text-white">
            Danh Sách Giao Dịch
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FaFilter className="text-gray-500" />
                <Select value={filter} onValueChange={handleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500">
                    <SelectValue placeholder="Lọc giao dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="amount_in">Tiền Vào</SelectItem>
                    <SelectItem value="amount_out">Tiền Ra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                  placeholderText="Chọn khoảng thời gian"
                  className="w-full sm:w-[220px] border-gray-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  isClearable={true}
                />
              </div>
            </div>
            <Button
              variant="default"
              className="w-full sm:w-auto bg-gradient-to-r text-gray-800 text-white dark:text-blue-400 font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
              onClick={() => setOpenQRDialog(true)}
            >
              <FaQrcode />
              Tạo QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-lg border-none bg-white:bg-dark rounded-xl">
        <CardContent className="p-4 sm:p-6">
          <DataTable title="" data={filteredTransactions} columns={columns} />
        </CardContent>
      </Card>

      {/* QR Dialog */}
      <Dialog open={openQRDialog} onOpenChange={setOpenQRDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl shadow-2xl bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-indigo-600">
              Tạo Mã QR Thanh Toán
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Nhập thông tin để tạo mã QR nhanh chóng
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            <Input
              placeholder="Số tài khoản *"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Input
              placeholder="Tên ngân hàng (VD: MBBank) *"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Input
              placeholder="Số tiền (tuỳ chọn)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Input
              placeholder="Nội dung chuyển khoản"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500">
                <SelectValue placeholder="Chọn Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                {templates.filter((t) => t).map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
            onClick={generateQR}
          >
            Tạo QR Code
          </Button>
          {qrUrl && (
            <div className="mt-4 sm:mt-6 flex flex-col items-center">
              <div className="border border-gray-200 p-2 sm:p-3 rounded-lg bg-gray-50 shadow-sm">
                <Image
                  src={qrUrl || "/placeholder.svg"}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="rounded-md sm:w-[180px] sm:h-[180px]"
                />
              </div>
              <Button
                variant="outline"
                className="mt-3 sm:mt-4 w-full sm:w-auto border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
                asChild
              >
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