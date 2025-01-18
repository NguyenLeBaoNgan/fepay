import Header from "@/components/header";
import Footer from "@/components/footer";
import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import router from "next/router";

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Tính tổng giá trị giỏ hàng
  const calculateTotal = () =>
    cartItems.reduce((total: number, item: any) => total + item.total, 0);

  // Cập nhật số lượng và tính lại tổng giá trị
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    const updatedCartItems = [...cartItems];
    const updatedItem = updatedCartItems[index];

    if (!updatedItem.product_id) {
      console.error("Product ID is missing or invalid");
      return;
    }

    try {
      // Gọi API kiểm tra tồn kho
      const response = await axiosClient.post("/api/check-stock", {
        items: [
          {
            product_id: updatedItem.product_id,
            quantity: newQuantity,
          },
        ],
      });

      if (response.status === 200) {
        updatedItem.quantity = newQuantity;
        updatedItem.total = updatedItem.price * newQuantity;
        setCartItems(updatedCartItems);
        localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        setError(null);
      } else if (response.status === 400) {
        const availableQuantity = response.data.insufficient_stock[0]?.available_quantity;
        if (newQuantity > availableQuantity) {
          setError(
            `Số lượng không đủ trong kho. Số lượng còn lại: ${availableQuantity}`
          );
          updatedItem.quantity = availableQuantity;
          updatedItem.total = updatedItem.price * availableQuantity;
          setCartItems(updatedCartItems);
          localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra tồn kho:", err);
      setError("Không thể kiểm tra tồn kho. Vui lòng thử lại.");
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (index: number) => {
    const updatedCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
  };

  // Lấy dữ liệu giỏ hàng từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  const handleCheckout = async () => {
    const cartData = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));
  
    try {
      // Gửi yêu cầu tạo đơn hàng
      const response = await axiosClient.post("/api/orders", { items: cartData });
  
      if (response.data.success) {
        const orderId = response.data.order_id; // Lấy order_id từ API trả về
        // Điều hướng sang trang checkout và truyền order_id qua query
        router.push(`/checkout?order_id=${orderId}`);
      } else {
        setError("Có lỗi khi tạo đơn hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setError("Không thể kết nối đến API.");
    }
  };
  

  return (
    <>
      <Header />
      <div className="cart container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            {error}
          </div>
        )}
        {cartItems.length === 0 ? (
          <p>Giỏ hàng của bạn trống.</p>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded">
            <thead>
              <tr>
                <th className="text-left p-4">Sản phẩm</th>
                <th className="text-left p-4">Giá</th>
                <th className="text-left p-4">Số lượng</th>
                <th className="text-left p-4">Tổng</th>
                <th className="text-left p-4">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item: any, index: number) => (
                <tr key={index} className="border-t">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.price} VND</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, parseInt(e.target.value))
                      }
                      className="p-2 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="p-4">{item.total} VND</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="total mt-6 text-right">
          <p className="text-xl font-semibold">Tổng cộng: {calculateTotal()} VND</p>
          <br />
          <button
            onClick={handleCheckout} // Gọi hàm tạo order_id và chuyển hướng
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-xl"
          >
            Thanh toán
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
