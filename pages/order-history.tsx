import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import axiosClient from "@/utils/axiosClient";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  CalendarIcon,
  CreditCardIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  productID: string;
}

interface Payment {
  method: string;
  payment_status: string;
  transaction_id: string | null;
}

interface PaymentDetails {
  phone: string;
  email: string;
  address: string;
  note: string | null;
}

interface Order {
  order_id: string;
  total_amount: string;
  status: string;
  items: OrderItem[];
  created_at: string;
  payment: Payment | null;
  payment_details: PaymentDetails | null;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [isCancelling, setIsCancelling] = useState<string | null>(null); // Trạng thái hủy

  const perPage = 10;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get(
          `/api/history?page=${currentPage}`
        );
        const data = response.data;
        if (data && Array.isArray(data.data)) {
          setOrders(data.data);
          setCurrentPage(data.current_page || 1);
          setTotalPages(data.last_page || 1);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage]);

  const toggleDetails = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      setExpandedOrders([]);
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages: (number | string)[] = [];
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages;
  };

  const getStatusInfo = (order: Order) => {
    const status = order.status.toLowerCase();
    switch (status) {
      case "paid":
        return {
          color: "bg-emerald-600",
          text: "text-emerald-50",
          label: "Đã thanh toán",
          icon: <CreditCardIcon className="h-4 w-4" />,
        };
      case "unpaid":
        return {
          color: "bg-amber-500",
          text: "text-amber-50",
          label: "Chờ thanh toán",
          icon: <CalendarIcon className="h-4 w-4" />,
        };
      case "cancelled":
        return {
          color: "bg-rose-600",
          text: "text-rose-50",
          label: "Đã hủy",
          icon: <ArrowPathIcon className="h-4 w-4" />,
        };
      case "refunded":
        return {
          color: "bg-blue-600",
          text: "text-blue-50",
          label: "Đã hoàn tiền",
          icon: <CreditCardIcon className="h-4 w-4" />,
        };
      default:
        return {
          color: "bg-gray-500",
          text: "text-gray-50",
          label: status,
          icon: <TruckIcon className="h-4 w-4" />,
        };
    }
  };

  // Hàm hủy đơn hàng
  const handleCancelOrder = async (orderId: string) => {
    setIsCancelling(orderId);
    try {
      const response = await axiosClient.post(`/api/cancel/${orderId}`);
      if (response.data.success) {
        // Cập nhật trạng thái đơn hàng trong UI
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId
              ? {
                  ...order,
                  status: "cancelled",
                  payment: { ...order.payment!, payment_status: "cancelled" },
                }
              : order
          )
        );
        alert("Đơn hàng đã được hủy thành công!");
      } else {
        alert(response.data.message || "Không thể hủy đơn hàng.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Đã xảy ra lỗi khi hủy đơn hàng.");
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-blue-600">
              Lịch Sử Đơn Hàng
            </h1>
            <p className="text-gray-600 mt-2">
              Xem và quản lý tất cả đơn hàng của bạn
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <span className="ml-4 text-gray-700 font-medium">
                Đang tải đơn hàng...
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
              <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Chưa có đơn hàng nào
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn chưa có đơn hàng nào trong lịch sử mua sắm.
              </p>
              <Link href="/">
                Quay về trang chủ
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const orderIndex = (currentPage - 1) * perPage + index + 1;
                const isExpanded = expandedOrders.includes(order.order_id);
                const statusInfo = getStatusInfo(order);
                const orderDate = new Date(order.created_at);

                const canCancel =
                  order.payment?.method === "cash_on_delivery" &&
                  order.payment?.payment_status === "pending";

                return (
                  <div
                    key={order.order_id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="border-b border-gray-100">
                      <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold text-gray-800">
                              Đơn hàng #{order.order_id.slice(-6)}
                            </span>
                            <div
                              className={`inline-flex items-center px-3 py-1 ${statusInfo.color} ${statusInfo.text} text-xs font-medium rounded-full gap-1`}
                            >
                              {statusInfo.icon}
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {orderDate.toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              -{" "}
                              {orderDate.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-3">
                          <span className="text-lg font-bold text-indigo-700">
                            {formatCurrency(order.total_amount)}
                          </span>
                          <button
                            onClick={() => toggleDetails(order.order_id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                            aria-label={
                              isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"
                            }
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                                <span className="text-xs font-medium">
                                  {item.quantity}x
                                </span>
                              </div>
                              <span className="font-medium text-gray-800 truncate max-w-xs">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-medium text-gray-700">
                              {formatCurrency(
                                parseFloat(item.price) * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isExpanded && (order.payment || order.payment_details) && (
                      <div className="bg-indigo-50 border-t border-indigo-100">
                        <div className="p-5">
                          <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">
                            Chi tiết thanh toán
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.payment && (
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <CreditCardIcon className="h-4 w-4 text-indigo-600" />
                                  Thông tin thanh toán
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Phương thức:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {order.payment.method}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Trạng thái:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {order.payment.payment_status}
                                    </span>
                                  </div>
                                  {order.payment.transaction_id && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Mã giao dịch:
                                      </span>
                                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
                                        {order.payment.transaction_id}
                                      </span>
                                    </div>
                                  )}
                                  {canCancel && (
                                    <button
                                      onClick={() =>
                                        handleCancelOrder(order.order_id)
                                      }
                                      disabled={isCancelling === order.order_id}
                                      className={`mt-4  py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isCancelling === order.order_id
                                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {isCancelling === order.order_id
                                        ? "Đang hủy..."
                                        : "Hủy đơn hàng"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {order.payment_details && (
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <TruckIcon className="h-4 w-4 text-indigo-600" />
                                  Thông tin giao hàng
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-gray-600">SĐT:</span>
                                    <span className="font-medium text-gray-800">
                                      {order.payment_details.phone}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-gray-600">
                                      Email:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {order.payment_details.email}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-gray-600">
                                      Địa chỉ:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {order.payment_details.address}
                                    </span>
                                  </div>
                                  {order.payment_details.note && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <span className="text-gray-600 block mb-1">
                                        Ghi chú:
                                      </span>
                                      <p className="bg-gray-50 p-2 rounded text-gray-700 text-sm">
                                        {order.payment_details.note}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                      className={`px-5 py-2.5 rounded-lg font-medium transition duration-200 ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm"
                      }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Trang trước
                    </button>

                    <div className="flex justify-center items-center">
                      {getPageNumbers().map((page, idx) => (
                        <button
                          key={idx}
                          className={`w-10 h-10 mx-1 rounded-lg text-sm font-medium transition duration-200 ${
                            page === currentPage
                              ? "bg-indigo-600 text-white shadow-sm"
                              : typeof page === "number"
                              ? "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200"
                              : "text-gray-400 cursor-default bg-transparent border-none"
                          }`}
                          onClick={() =>
                            typeof page === "number" && handlePageChange(page)
                          }
                          disabled={typeof page !== "number"}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className={`px-5 py-2.5 rounded-lg font-medium transition duration-200 ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm"
                      }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Trang sau →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderHistory;
