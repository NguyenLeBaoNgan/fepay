import { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Cookies from "js-cookie";
import router from "next/router";

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [note, setNote] = useState<string>("");
 const token = Cookies.get("auth_token");
  const userId = token?.user_id;
  useEffect(() => { const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order_id');
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      setCartItems(cartData);
      setTotalAmount(
        cartData.reduce((sum: number, item: any) => sum + item.total, 0)
      );
    }
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }
  }, []);

  const handleCheckout = async () => {
    if (orderId) {
      setMessage("Order already created. Proceed to payment.");
      return; // Nếu đã có orderId, không tạo thêm đơn hàng nữa.
    }
  
    try {
      const response = await axiosClient.post("/api/orders", {
        items: cartItems,
        total_amount: totalAmount,
        user_id: userId,
      });
      setOrderId(response.data.order_id); // Lưu orderId sau khi tạo đơn hàng
      setMessage("Order created successfully. Proceed to payment.");
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Failed to create order. Please try again.");
    }
  };
  
  
  const handlePaymentSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
  
    if (!selectedMethod || !phone || !email || !address) {
      setMessage("Please fill in all required fields.");
      setIsProcessing(false);
      return;
    }
  
    if (!orderId) {
      setMessage("Order ID not found. Please try again.");
      setIsProcessing(false);
      return;
    }
  
    try {
      const paymentResponse = await axiosClient.post("/api/payments", {
        order_id: orderId, // Sử dụng order_id đã tạo
        method: selectedMethod,
        payment_status: "pending", // Trạng thái thanh toán ban đầu
        transaction_id: "", // Chưa có transaction_id lúc này
        phone,
        email,
        address,
        note,
      });
  
      if (paymentResponse.data.success) {
        if (selectedMethod === "bank_transfer") {
          setShowDialog(true); // Hiển thị QR Code
  
        } else {
          setMessage("Payment method not supported.");
        }
        if (paymentResponse.data.transaction_id) {
          await handleWebhookResponse(paymentResponse.data.transaction_id); // Cập nhật webhook với transaction_id
        }

      } else {
        setMessage("Failed to create payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      setMessage("Error occurred while processing payment.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWebhookResponse = async (transactionId: string) => {
    try {
      const response = await axiosClient.post("/api/sepay/webhook", {
        transaction_id: transactionId,
        order_id: orderId,
        transferType: selectedMethod === "bank_transfer" ? "in" : "out",
        gateway: "MBBank",
        accountNumber: "168820029999",
      });

      if (response.status === 200) {
        setMessage("Thanh toán thành công!");
          localStorage.removeItem("cart"); 
          setTimeout(() => {
            router.push(`/order-success?order_id=${orderId}`);
        }, 100);
      } else {
        setMessage("Thanh toán thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý webhook:", error);
      setMessage("Đã xảy ra lỗi khi xử lý webhook.");
    }
  };
  

  // const handlePaymentSubmit = async () => {
  //   if (isProcessing) return;
  //   setIsProcessing(true);

  //   if (!selectedMethod || !phone || !email || !address) {
  //     setMessage("Please fill in all required fields.");
  //     setIsProcessing(false);
  //     return;
  //   }

  //   if (!orderId) {
  //     setMessage("Order ID not found. Please try again.");
  //     setIsProcessing(false);
  //     return;
  //   }

  //   try {
  //     const paymentResponse = await axiosClient.post("/api/payments", {
  //       order_id: orderId,
  //       method: selectedMethod,
  //       payment_status: "pending",
  //       transaction_id: "",
  //       phone,
  //       email,
  //       address,
  //       note,
  //     });

  //     if (paymentResponse.data.success) {
  //       setMessage("Payment created successfully.");
  //       if (selectedMethod === "bank_transfer") {
  //         setShowDialog(true); // Show QR Code dialog
  //       } else {
  //         setMessage("Payment method not supported.");
  //       }
  //     } else {
  //       setMessage("Failed to create payment. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error creating payment:", error);
  //     setMessage("Error occurred while processing payment.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  return (
    <>
      <Header />
      <div className="checkout-container container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {message && (
          <div
            className={`${
              message.includes("successfully") ? "bg-green-100" : "bg-red-100"
            } border ${
              message.includes("successfully")
                ? "border-green-400"
                : "border-red-400"
            } text-${
              message.includes("successfully") ? "green" : "red"
            }-700 px-4 py-3 rounded relative`}
          >
            {message}
          </div>
        )}

        <div className="cart-summary mb-6">
          <h2 className="text-2xl mb-4">Your Cart</h2>
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
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.price} VND</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4">{item.total} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xl font-semibold mt-4">Total: {totalAmount} VND</p>
        </div>

        <div className="payment-details mb-6">
          <h2 className="text-2xl mb-4">Payment Details</h2>
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          <textarea
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
        </div>

        <div className="payment-methods mb-6">
          <h2 className="text-2xl mb-4">Select Payment Method</h2>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select a method</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <button
          onClick={orderId ? handlePaymentSubmit : handleCheckout}
          className="bg-blue-500 text-white p-4 rounded"
        >
          {orderId ? "Pay Now" : "Checkout"}
        </button>
      </div>

      {showDialog && (
        <div className="dialog">
          <div className="dialog-content">
            <h2>Scan to Pay</h2>
            <img
              src={`https://qr.sepay.vn/img?bank=MBBank&acc=168820029999&template=compact&amount=${Math.floor(
                totalAmount
              )}&des=DH${orderId}`}
              alt="Bank Transfer QR Code"
            />
            <button onClick={() => setShowDialog(false)}>Close</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CheckoutPage;
