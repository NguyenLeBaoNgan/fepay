import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";
import axiosClient from "@/utils/axiosClient";
import { FaEye, FaFilter, FaTrash } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface PaymentDetail {
  id: string;
  payment_id: string;
  address: string;
  phone: string;
  email: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  order_id: string;
  method: string;
  payments_status: "completed" | "pending" | "cancelled" | "failed"; // Thêm "failed"
  payment_amount: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
  reference_number: string | null;
  payment_details: PaymentDetail;
}

const PaymentPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Payment[]>("/api/payments");
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPayments(response.data);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi lấy dữ liệu thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa payment này?")) return;
    try {
      const response = await axiosClient.delete(`/api/payments/${id}`);
      if (response.status === 200) {
        setPayments((prevPayments) => prevPayments.filter((payment) => payment.id !== id));
        toast.success("Payment deleted successfully");
      } else {
        toast.error("Failed to delete payment");
      }
    } catch (error: any) {
      toast.error("Error deleting payment");
    }
  };
  const handleUpdateStatus = async (id: string, newStatus: Payment["payments_status"]) => {
    try {
      const response = await axiosClient.put(`/api/payments/${id}`, { payment_status: newStatus });
      console.log("Update response:", response.data);
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.id === id ? { ...payment, payments_status: newStatus } : payment
        )
      );
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái thanh toán:", error.response?.data || error.message);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedPayment(null);
  };

  if (loading) return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Lỗi: {error}</div>;

  const filteredPayments = payments.filter((payment) => {
    const matchesMethod = selectedMethod ? payment.method === selectedMethod : true;
    const matchesDate = selectedDate
      ? new Date(payment.created_at).toISOString().split("T")[0] === selectedDate
      : true;
    return matchesMethod && matchesDate;
  });


  const columns = [
    { key: "id", label: "ID" },
    { key: "order_id", label: "Mã Đơn Hàng" },
    { key: "payment_amount", label: "Số Tiền" },
    { key: "method", label: "Phương Thức" },
    { key: "payments_status", label: "Trạng Thái" },
    { key: "created_at", label: "Ngày Tạo" },
    { key: "actions", label: "Thao Tác" },
  ];

  const modifiedData = filteredPayments.map((payment) => ({
    id: `#${payment.id.slice(-5)}`,
    order_id: `#${payment.order_id.slice(-5)}`,
    payment_amount: parseFloat(payment.payment_amount).toLocaleString() + " VND",
    method: payment.method,
    payments_status: (
      <select
        value={payment.payments_status}
        onChange={(e) => handleUpdateStatus(payment.id, e.target.value as Payment["payments_status"])}
        className="border p-1 rounded bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500"
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="failed">Failed</option> {/* Thêm trạng thái Failed */}
      </select>
    ),
    created_at: new Date(payment.created_at).toLocaleString(),
    actions: (
      <div className="flex gap-4">
        <button
          onClick={() => handleViewDetails(payment)}
          className="text-blue-500 hover:text-blue-700"
        >
          <FaEye size={15} />
        </button>
        <button
          onClick={() => handleDelete(payment.id)}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash size={15} />
        </button>
      </div>
    ),
  }));

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap gap-4 justify-end items-center">
         <FaFilter className="text-muted-foreground" />
        <select className="border p-2 rounded" value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
          <option value="">Tất Cả Phương Thức</option>
          <option value="cash_on_delivery">COD</option>
          <option value="bank_transfer">Chuyển Khoản Ngân Hàng</option>
        </select>

        <input type="date" className="border p-2 rounded" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />

        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { setSelectedMethod(""); setSelectedDate(""); }}>
          Xóa Lọc
        </button>
      </div>
      <DataTable title="Danh Sách Thanh Toán" data={modifiedData} columns={columns} />

      {showDialog && selectedPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Chi Tiết Thanh Toán</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold">Mã Thanh Toán:</span> {`#${selectedPayment.id.slice(-5)}`}
              </p>
              <p>
                <span className="font-semibold">Mã Đơn Hàng:</span> {`${selectedPayment.order_id.slice(-5)}`}
              </p>
              <p>
                <span className="font-semibold">Số Tiền:</span>{" "}
                {parseFloat(selectedPayment.payment_amount).toLocaleString()} VND
              </p>
              <p>
                <span className="font-semibold">Phương Thức:</span> {selectedPayment.method}
              </p>
              <p>
                <span className="font-semibold">Trạng Thái:</span>{" "}
                <span
                  className={cn(
                    "inline-block px-2 py-1 rounded-full text-sm",
                    selectedPayment.payments_status === "completed" && "bg-green-100 text-green-700",
                    selectedPayment.payments_status === "pending" && "bg-yellow-100 text-yellow-700",
                    selectedPayment.payments_status === "cancelled" && "bg-red-100 text-red-700",
                    selectedPayment.payments_status === "failed" && "bg-orange-100 text-orange-700" // Thêm màu cho Failed
                  )}
                >
                  {selectedPayment.payments_status}
                </span>
              </p>
              <p>
                <span className="font-semibold">Mã Giao Dịch:</span> 
                {`#${selectedPayment.transaction_id?.toString().slice(-5)}`}
              </p>
              <p>
                <span className="font-semibold">Ngày Tạo:</span>{" "}
                {new Date(selectedPayment.created_at).toLocaleString()}
              </p>
              {selectedPayment.reference_number && (
                <p>
                  <span className="font-semibold">Số Tham Chiếu:</span> {selectedPayment.reference_number}
                </p>
              )}
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Thông Tin Người Thanh Toán</h4>
            {selectedPayment.payment_details ? (
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Địa Chỉ:</span> {selectedPayment.payment_details.address}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Số Điện Thoại:</span> {selectedPayment.payment_details.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {selectedPayment.payment_details.email}
                </p>
                {selectedPayment.payment_details.note && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Ghi Chú:</span> {selectedPayment.payment_details.note}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngày Tạo:</span>{" "}
                  {new Date(selectedPayment.payment_details.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Không có thông tin người thanh toán.</p>
            )}

            <button
              onClick={handleCloseDialog}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;