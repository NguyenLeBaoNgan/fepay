// pages/order-success.tsx

import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

const OrderSuccess: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Order Successfully Placed!</h1>
        <p>Thank you for your order. You will receive an email confirmation shortly.</p>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccess;
