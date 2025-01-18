// components/PaymentForm.tsx
import React, { useState } from "react";

interface PaymentFormProps {
  onSubmit: (paymentDetails: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentDetails = {
      address,
      phone,
      email,
    };
    onSubmit(paymentDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded mt-4"
      >
        Pay Now
      </button>
    </form>
  );
};

export default PaymentForm;
