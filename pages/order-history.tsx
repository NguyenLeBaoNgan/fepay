// pages/order-history.tsx

import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import axiosClient from "@/utils/axiosClient";

interface OrderItemDTO {
  name: string;
  quantity: number;
  price: string;
  productID: string;
}

interface OrderDTO {
  order_id: string;
  total_amount: string;
  status: string;
  items: OrderItemDTO[];
  created_at: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);

  const perPage = 10; 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosClient.get(`/api/history?page=${currentPage}`);
        const data = response.data;
        
        // Cập nhật danh sách đơn hàng và thông tin phân trang
        setOrders(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [currentPage]); // Gọi lại khi `currentPage` thay đổi

  // Chuyển trang
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">You have no previous orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-left p-4">#</th>
                  <th className="text-left p-4">Items</th>
                  <th className="text-left p-4">Total Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  // Tính lại chỉ số để cộng thêm vào từ trang trước
                  const orderIndex = (currentPage - 1) * perPage + index + 1;
                  return (
                    <tr key={order.order_id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4">{orderIndex}</td>
                      <td className="p-4">
                        <ul className="list-disc ml-5">
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              <span className="font-bold">{item.name}</span> - {item.quantity} x {item.price} VND
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4">{order.total_amount} VND</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            order.status === "Paid" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderHistory;
