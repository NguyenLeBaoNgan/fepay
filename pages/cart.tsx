import Header from "@/components/header";
import Footer from "@/components/footer";
import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import router from "next/router";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculateTotal = () =>
    cartItems.reduce((total: number, item: any) => total + item.total, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuantityChange = async (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCartItems = [...cartItems];
    const updatedItem = updatedCartItems[index];

    if (!updatedItem.product_id) {
      console.error("Product ID is missing or invalid");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/api/check-stock", {
        items: [{ product_id: updatedItem.product_id, quantity: newQuantity }],
      });

      if (response.status === 200) {
        updatedItem.quantity = newQuantity;
        updatedItem.total = updatedItem.price * newQuantity;
        setCartItems(updatedCartItems);
        localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        setError(null);
      } else if (response.status === 400) {
        const availableQuantity =
          response.data.insufficient_stock[0]?.available_quantity;
        if (newQuantity > availableQuantity) {
          setError(
            `Số lượng không đủ trong kho. Còn lại: ${availableQuantity}`
          );
          updatedItem.quantity = availableQuantity;
          updatedItem.total = updatedItem.price * availableQuantity;
          setCartItems(updatedCartItems);
          localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra tồn kho:", err);
      setError("Số lượng không đủ trong kho.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      let count=5;
      // setError("Vui lòng đăng nhập để tiếp tục thanh toán. Bạn sẽ được chuyển hướng đến trang đăng nhập sau ${count} giây.");
      const countdownInterval = setInterval(() => {
        count -= 1;
        setError(`Vui lòng đăng nhập để tiếp tục thanh toán. Chuyển hướng sau ${count} giây.`);
        if (count <= 0) {
          clearInterval(countdownInterval);
          router.push("auth/login");
        }
      }, 1000);
      // setTimeout(() => {
      //   router.push("auth/login");
      // }, 5000);
      return;
    }

    if (cartItems.length === 0) {
      setError("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }

    setIsLoading(true);
    const cartData = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const response = await axiosClient.post("/api/orders", {
        items: cartData,
      });
      if (response.data.success) {
        const orderId = response.data.order_id;
        router.push(`/checkout?order_id=${orderId}`);
      } else {
        setError("Có lỗi khi tạo đơn hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setError("Không thể kết nối đến API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50:bg-dark-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white:bg-dark-600 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-8">
            <ShoppingCartIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-500">
              CART
            </h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCartIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg sm:text-xl text-gray-500">
                Giỏ hàng của bạn đang trống
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-6 inline-flex items-center justify-center px-5 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700:text-white">
                        Sản phẩm
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700:text-white">
                        Giá
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700:text-white">
                        Số lượng
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700:text-white">
                        Tổng
                      </th>
                      {/* <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        Xóa
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {/* <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div> */}
                            <span className="font-medium text-gray-800 ">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center border border-gray-200 rounded-lg w-32">
                            <button
                              onClick={() =>
                                handleQuantityChange(index, item.quantity - 1)
                              }
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 "
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  index,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full text-center bg-transparent  border-none focus:outline-none p-0"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(index, item.quantity + 1)
                              }
                              className="px-3 py-2 text-gray-600 hover:text-gray-800"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-6">
                {cartItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="mb-3">
                      <span className="text-lg font-semibold text-gray-900 truncate block">
                        {item.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">
                          Giá
                        </span>
                        <p className="text-base font-medium text-gray-800 mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">
                          Tổng
                        </span>
                        <p className="text-base font-bold text-blue-600 mt-1">
                          {formatCurrency(item.total)}
                        </p>
                      </div>

                      <div className="col-span-2 mt-2">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">
                          Số lượng
                        </span>
                        <div className="flex items-center mt-1 bg-gray-100 rounded-full w-32 border border-gray-200">
                          <button
                            onClick={() =>
                              handleQuantityChange(index, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-l-full transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                index,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full text-center bg-transparent border-none focus:outline-none text-sm font-medium text-gray-800"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(index, item.quantity + 1)
                            }
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-r-full transition-colors duration-150"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="mt-4 w-full flex items-center justify-center py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all duration-200"
                    >
                      <TrashIcon className="h-5 w-5 mr-1" /> Xóa
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-t border-gray-200 pt-8">
                <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:justify-between md:items-center">
                  <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      ></path>
                    </svg>
                    Tiếp tục mua sắm
                  </button>

                  <div className="w-full md:w-72 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Tổng sản phẩm:</span>
                      <span className="font-medium">
                        {cartItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
                      <span className="text-lg font-semibold text-gray-800">
                        Tổng cộng:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className={`w-full flex items-center justify-center py-3 px-6 text-base font-medium rounded-lg text-white transition-all ${
                        isLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        "Thanh toán ngay"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
