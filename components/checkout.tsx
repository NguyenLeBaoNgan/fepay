import React, { useState } from "react";
import Header from "@/components/header"; 
import Footer from "@/components/footer"; 

const Checkout: React.FC = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    paymentMethod: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      paymentMethod: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullname || !formData.phone || !formData.email || !formData.paymentMethod) {
      setError("Please fill in all fields.");
      return;
    }

    // Gửi thông tin checkout (có thể gọi API ở đây nếu cần)
    console.log("Submitting checkout data: ", formData);
    
    // Thực hiện chuyển hướng hoặc xử lý thanh toán ở đây
  };

  return (
    <>
      <Header />
      <div className="checkout container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullname" className="block text-lg font-semibold">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-lg font-semibold">
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-semibold">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter your email address"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-lg font-semibold">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handlePaymentMethodChange}
              className="w-full p-3 border border-gray-300 rounded"
            >
              <option value="">Select a payment method</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="mt-6 text-right">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Place Order
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
