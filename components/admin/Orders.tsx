import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";
import axiosClient from "@/utils/axiosClient";
import { FaEdit, FaTrash, FaEye, FaFilter } from "react-icons/fa";
import DatePicker from "react-datepicker";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: string;
  total: string;
}

interface Order {
  id: string;
  user: string;
  total_amount: number;
  status: "paid" | "unpaid" | "cancelled" | "refunded";
  created_at: string;
  items: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Order[]>("/api/orders");
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setOrders(response.data);
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi lấy dữ liệu đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // const handleEditStatus = async (id: string, newStatus: Order["status"]) => {
  //   try {
  //     await axiosClient.put(`/api/orders/${id}`, { status: newStatus });
  //     setOrders(prevOrders =>
  //       prevOrders.map(order =>
  //         order.id === id ? { ...order, status: newStatus } : order
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Lỗi khi cập nhật trạng thái:", error);
  //   }
  // };

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/api/orders/${id}`);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
    } catch (error) {
      console.error("Lỗi khi xoá đơn hàng:", error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedOrder(null);
  };
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
  
    const adjustedStartDate = startDate ? new Date(startDate) : null;
    let adjustedEndDate = endDate ? new Date(endDate) : null;
  
    // Nếu chỉ chọn 1 ngày, set cả startDate và endDate thành ngày đó
    if (adjustedStartDate && !adjustedEndDate) {
      adjustedEndDate = new Date(adjustedStartDate);
    }
  
    // Set giờ để lấy đủ dữ liệu trong ngày
    if (adjustedStartDate) adjustedStartDate.setHours(0, 0, 0, 0);
    if (adjustedEndDate) adjustedEndDate.setHours(23, 59, 59, 999);
  
    return (
      (!adjustedStartDate || orderDate >= adjustedStartDate) &&
      (!adjustedEndDate || orderDate <= adjustedEndDate)
    );
  });
  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  const columns = [
    { key: "id", label: "ID" },
    { key: "user", label: "Tên Khách Hàng" },
    { key: "total_amount", label: "Tổng Tiền" },
    { key: "status", label: "Trạng Thái" },
    { key: "created_at", label: "Ngày Tạo" },
    { key: "actions", label: "Thao Tác" },
  ];

  const modifiedData = filteredOrders.map((order) => ({
    id: `#${order.id.slice(-5)}`,
    user: order.user || "Không xác định",
    total_amount: order.total_amount,
    status: order.status,
    // (
    //   <select
    //     value={order.status.toLocaleLowerCase()}
    //     onChange={(e) => handleEditStatus(order.id, e.target.value as Order["status"])}
    //     className="border p-1 rounded"
    //   >
    //     <option value="paid">Paid</option>
    //     <option value="unpaid">Unpaid</option>
    //     <option value="cancelled">Cancelled</option>
    //     <option value="refunded">Refunded</option>
    //   </select>
    // ),
    created_at: order.created_at,
    actions: (
      <div className="flex gap-4">
        <button onClick={() => handleViewDetails(order)} className="text-blue-500">
          <FaEye size={15} />
        </button>
        <button onClick={() => handleDelete(order.id)} className="text-red-500">
          <FaTrash size={15} />
        </button>
      </div>
    ),
  }));
 
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
         <FaFilter className="text-muted-foreground" />
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update: [Date | null, Date | null]) => {
            setDateRange(update);
          }}
          placeholderText="Chọn khoảng thời gian"
          className="w-[220px] border border-border rounded-md p-2 text-sm"
          isClearable={true}
        />
      </div>
      <DataTable title="Danh Sách Đơn Hàng" data={modifiedData} columns={columns} />

      {showDialog && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Chi Tiết Đơn Hàng</h3>
            <p><strong>Tổng Tiền:</strong> {selectedOrder.total_amount}</p>
            <p><strong>Trạng Thái:</strong> {selectedOrder.status}</p>
            <p><strong>Ngày Tạo:</strong> {selectedOrder.created_at}</p>

            <h4 className="text-lg font-semibold mt-4">Danh sách sản phẩm:</h4>
            <ul className="mt-2">
              {selectedOrder.items.length > 0 ? (
                selectedOrder.items.map(item => (
                  <li key={item.id} className="border-b py-2">
                    <p><strong>Tên Sản Phẩm:</strong> {item.product_name || "Không xác định"}</p>
                    <p><strong>Số Lượng:</strong> {item.quantity}</p>
                    <p><strong>Giá:</strong> {item.price}</p>
                    <p><strong>Tổng:</strong> {item.total}</p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào.</p>
              )}
            </ul>

            <button
              onClick={handleCloseDialog}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
