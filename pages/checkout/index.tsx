import { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Cookies from "js-cookie";
import router from "next/router";
import PaymentListener from "@/components/PaymentListener";
import { toast } from "react-toastify";
const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Xử lý token
  // const token = Cookies.get("auth_token");
  // let parsedToken = null;
  // if (token) {
  //   try {
  //     parsedToken = JSON.parse(token);
  //   } catch (error) {
  //     console.error("Invalid token format:", error);
  //   }
  // }
  // const userId = parsedToken?.user_id;

  const token = Cookies.get("auth_token");
  let userId = null;

  if (token) {
    try {
      const parsed = JSON.parse(token);
      userId = parsed?.user_id;
    } catch (jsonError) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = atob(payload);
        const parsedJWT = JSON.parse(decodedPayload);
        userId = parsedJWT?.user_id;
      } catch (jwtError) {
        console.error("Invalid token format:", jwtError);
      }
    }
  }

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

  // Khởi tạo dữ liệu từ localStorage và URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get("order_id");
    const storedCart = localStorage.getItem("cart");

    if (storedCart) {
      try {
        const cartData = JSON.parse(storedCart);
        setCartItems(cartData);
        setTotalAmount(
          cartData.reduce((sum: number, item: any) => sum + item.total, 0)
        );
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setMessage("Error loading cart data.");
      }
    }
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }
  }, []);

  // Tạo đơn hàng
  const handleCheckout = async () => {
    if (orderId) {
      setMessage("Order already created. Proceed to payment.");
      return;
    }
    if (!userId) {
      setMessage("Please log in to proceed with checkout.");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await axiosClient.post("/api/orders", {
        items: cartItems,
        total_amount: totalAmount,
        user_id: userId,
      });
      setOrderId(response.data.order_id);
      setMessage("Order created successfully. Proceed to payment.");
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Failed to create order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý thanh toán
  const handlePaymentSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (!selectedMethod || !phone || !email || !address) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setIsProcessing(false);
      return;
    }
    if (!emailRegex.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ.");
      setIsProcessing(false);
      return;
    }
    if (!phoneRegex.test(phone)) {
      toast.error("Vui lòng nhập số điện thoại 10 chữ số hợp lệ.");
      setIsProcessing(false);
      return;
    }
    if (!orderId) {
      toast.error("Không tìm thấy ID đơn hàng. Vui lòng thử lại.");
      setIsProcessing(false);
      return;
    }

    try {
      const paymentResponse = await axiosClient.post("/api/payments", {
        order_id: orderId,
        method: selectedMethod,
        payment_status: "pending",
        transaction_id: "",
        phone,
        email,
        address,
        note,
      });

      if (paymentResponse.data.success) {
        setPaymentId(
          paymentResponse.data.payment?.id || paymentResponse.data.payment_id
        );
        if (selectedMethod === "bank_transfer") {
          setShowDialog(true);
          if (paymentResponse.data.transaction_id) {
            handleWebhookResponse(paymentResponse.data.transaction_id);
          }
        } else if (selectedMethod === "cash_on_delivery") {
          setMessage("Order placed successfully! You will pay upon delivery.");
          localStorage.removeItem("cart");
          setTimeout(() => {
            router.push(`/order-success?order_id=${orderId}`);
          }, 1000);
        } else {
          setMessage("Payment method not supported.");
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

  // Xử lý webhook cho bank_transfer
  const handleWebhookResponse = async (transactionId: string) => {
    console.log("Sending webhook request with transactionId:", transactionId);
    try {
      const response = await axiosClient.post("/api/sepay/hook", {
        transaction_id: transactionId,
        order_id: orderId,
        transferType: "in",
        gateway: "MBBank",
        accountNumber: "168820029999",
      });
      console.log("Webhook response:", response);
      if (response.status === 200) {
        setMessage("Thanh toán thành công!");
        localStorage.removeItem("cart");
        setTimeout(() => {
          router.push(`/order-success?order_id=${orderId}`);
        }, 1000);
      } else {
        setMessage("Thanh toán thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      setMessage("Đã xảy ra lỗi khi xử lý webhook.");
    }
  };

  return (
    <>
      <Header />
      <div className="checkout-container container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800:text-white">
          Checkout
        </h1>
        <PaymentListener />

        {/* Thông báo */}
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
            }-700 px-4 py-3 rounded-lg mb-6`}
          >
            {message}
          </div>
        )}

        {/* Giỏ hàng */}
        <div className="cart-summary mb-8">
          {cartItems.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            <>
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item: any, index: number) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-4 text-gray-800">{item.name}</td>
                      <td className="p-4 text-gray-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-4 text-gray-700">{item.quantity}</td>
                      <td className="p-4 font-medium text-gray-800">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xl text-blue-700 font-semibold mt-4">
                Total: {formatCurrency(totalAmount)}
              </p>
            </>
          )}
        </div>

        {/* Chi tiết thanh toán */}
        <div className="payment-details mb-8">
          <h2 className="text-2xl mb-4 font-semibold text-gray-800:text-white">
            Payment Details
          </h2>
          <input
            type="text"
            placeholder="Phone (10 digits)*"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Address*"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phương thức thanh toán */}
        <div className="payment-methods mb-8">
          <h2 className="text-2xl mb-4 font-semibold text-gray-800:text-white">
            Select Payment Method
          </h2>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a method</option>
            <option value="bank_transfer">QR (Bank Transfer)</option>
            <option value="cash_on_delivery">Cash on Delivery (COD)</option>
          </select>
        </div>

        {/* Nút hành động */}
        <button
          onClick={orderId ? handlePaymentSubmit : handleCheckout}
          disabled={isProcessing}
          className={`w-full py-4 rounded-lg text-white font-semibold transition-all duration-200 ${
            isProcessing
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 inline-block"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : orderId ? (
            selectedMethod === "cash_on_delivery" ? (
              "Place Order"
            ) : (
              "Pay Now"
            )
          ) : (
            "Checkout"
          )}
        </button>
      </div>

      {/* Dialog QR */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Scan to Pay
            </h2>
            <img
              src={`https://qr.sepay.vn/img?bank=MBBank&acc=168820029999&template=compact&amount=${Math.floor(
                totalAmount
              )}&des=DH${orderId}`}
              alt="Bank Transfer QR Code"
              className="w-full mb-4"
            />
            <button
              onClick={() => setShowDialog(false)}
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CheckoutPage;

function usePaymentListener(orderId: string | null, paymentId: string | null) {
  throw new Error("Function not implemented.");
}
