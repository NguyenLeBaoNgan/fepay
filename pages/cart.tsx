import Header from "@/components/header";
import Footer from "@/components/footer";
import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const calculateTotal = () =>
    cartItems.reduce((total: number, item: any) => total + item.total, 0);

  // Cập nhật số lượng và tính lại tổng giá trị
  // const handleQuantityChange = (index: number, newQuantity: number) => {
  //   const updatedCartItems = [...cartItems];
  //   const updatedItem = updatedCartItems[index];

  //   updatedItem.quantity = newQuantity;
  //   updatedItem.total = updatedItem.price * newQuantity;

  //   // Cập nhật lại cartItems
  //   setCartItems(updatedCartItems);

  //   localStorage.setItem("cart", JSON.stringify(updatedCartItems));
  // };
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    const updatedCartItems = [...cartItems];
    const updatedItem = updatedCartItems[index];

    if (!updatedItem.product_id) {
      console.error("Product ID is missing or invalid");
      return;
    }
    // updatedItem.quantity = newQuantity;
    // updatedItem.total = updatedItem.price * newQuantity;

    // localStorage.setItem("cart", JSON.stringify(updatedCartItems));

    try {
      const response = await axiosClient.post("/api/check-stock", {
        items: [
          {
            product_id: updatedItem.product_id,
            quantity: newQuantity,
          },
        ],
      });
      console.log("Response from API:", response);
      if (response.status === 200) {
        updatedItem.quantity = newQuantity;
        updatedItem.total = updatedItem.price * newQuantity;
        setCartItems(updatedCartItems);
        localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        setError(null);
      } else if (response.status === 400) {
        const availableQuantity = response.data.available_quantity;
        // updatedItem.quantity = availableQuantity;
        // updatedItem.total = updatedItem.price * availableQuantity;

        // setCartItems(updatedCartItems);
        // localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        // console.log(
        //   `Insufficient stock. The available quantity is ${availableQuantity}.`
        // );
        if (newQuantity > availableQuantity) {
          setError(
            `Insufficient stock. The available quantity is ${availableQuantity}.`
          );
          updatedItem.quantity = availableQuantity; // Giới hạn lại số lượng
          updatedItem.total = updatedItem.price * availableQuantity;

          setCartItems(updatedCartItems);
          localStorage.setItem("cart", JSON.stringify(updatedCartItems));
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra tồn kho:", err);
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
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  return (
    <>
      <Header />
      <div className="cart container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded">
            <thead>
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Quantity</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Remove</th>
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
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <div className="text-red-500 mt-4">{error}</div>}
        <div className="total mt-6 text-right">
          <p className="text-xl font-semibold">Total: {calculateTotal()} VND</p>
          
        </div>
       
      </div>

      <Footer />
    </>
  );
};

export default Cart;
