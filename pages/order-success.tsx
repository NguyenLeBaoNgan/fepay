// pages/order-success.tsx

import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/router";
const OrderSuccess: React.FC = () => {
  const router = useRouter();

  const handleViewOrderHistory = () => {
    router.push("/order-history"); 
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-6">Order Successfully Placed!</h1>
        <p>Thank you for your order. You will receive an email confirmation shortly.</p>
        <img src="https://i.pinimg.com/originals/ac/a9/4c/aca94cbfe9cf770ec9149b032367b7a9.gif" alt="Order Success" className="mx-auto mt-6" />
        <button
          onClick={handleViewOrderHistory}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full"
        >
          View Order History
        </button>
      </div>
      
      <Footer />
    </>
  );
};

export default OrderSuccess;
