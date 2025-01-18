// pages/api/place-order.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in the order." });
  }

  try {
    // Giả lập lưu đơn hàng vào cơ sở dữ liệu
    console.log("Order received:", { items, total });

    // Trả về phản hồi thành công
    res.status(200).json({ message: "Order placed successfully." });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ message: "An error occurred while processing the order." });
  }
}
