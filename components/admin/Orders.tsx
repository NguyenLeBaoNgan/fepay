import React, { useEffect, useState } from "react";
import DataTable from "./DataTable"; 
import axiosClient from "@/utils/axiosClient";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface OrdersProps{
  orders: Order[];
  // onEdit?: (id: string) => void;
  // onDelete?: (id: string) => void;
}

const OrdersPage:React.FC<OrdersProps> = ({orders}) => {
  const [orderslist, setOrders] = useState<Order[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 

  useEffect(() => {
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

    fetchOrders();
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "user.name", label: "Tên Khách Hàng" }, 
    { key: "total_amount", label: "Tổng Tiền" },
    { key: "status", label: "Trạng Thái" },
    { key: "created_at", label: "Ngày Tạo" },
  ];

  
  const handleEdit = (id: string) => {
    console.log(`Edit order with id: ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Delete order with id: ${id}`);

  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order); 
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }


  const getValue = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    } catch (e) {
      return ''; 
    }
  };


  // const modifiedData = orders.map(order => {
  //   columns.forEach(col => {
  //     if (col.key.includes('.')) {
  //       modifiedOrder[col.key] = getValue(order, col.key);
  //     }
  //   });
  //   return modifiedOrder;
  // });
  const modifiedData = orders.map(order => {
    const modifiedOrder: { [key: string]: any } = { ...order };
    columns.forEach(col => {
      if (col.key.includes('.')) {
        modifiedOrder[col.key] = getValue(order, col.key);
      }
    });
    return modifiedOrder;
  });
  
  return (
    <div>
      <DataTable
        title="Danh Sách Đơn Hàng"
        data={modifiedData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleViewDetails} 
      />


      {selectedOrder && (
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Chi Tiết Đơn Hàng</h3>
          <p><strong>ID:</strong> {selectedOrder.id}</p>
          <p><strong>Tên Khách Hàng:</strong> {selectedOrder.user.name}</p>
          <p><strong>Tổng Tiền:</strong> {selectedOrder.total_amount}</p>
          <p><strong>Trạng Thái:</strong> {selectedOrder.status}</p>
          <p><strong>Ngày Tạo:</strong> {selectedOrder.created_at}</p>

        </div>
      )}
    </div>
  );
};

export default OrdersPage;
