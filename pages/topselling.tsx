import { useEffect, useState } from "react";
import Image from "next/image";
import axiosClient from "@/utils/axiosClient";

interface Product {
  id: string;
  name: string;
  image: string;
  total_orders: number;
  total_sold: number;
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await axiosClient.get("api/top_selling", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status !== 200) throw new Error("Lỗi khi lấy dữ liệu");

        setProducts(res.data);
      } catch (err) {
        setError("Không thể lấy dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-md   p-4 bg-white:bg-dark shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">🔥 Top Sản Phẩm Bán Chạy</h2>
      <div className="flex flex-col space-y-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`flex items-center p-4 rounded-lg shadow-md ${
              index === 0 ? "bg-yellow-200 border-2 border-yellow-500" :
              index === 1 ? "bg-gray-200" : "bg-orange-200"
            }`}
          >
            <div className="w-20 h-20 relative">
              <Image
                src={product.image}
                alt={product.name}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold">
                {index === 0 && "🏆 "} 
                {index === 1 && "🥈 "} 
                {index === 2 && "🥉 "} 
                {product.name}
              </h3>
              <p className="text-gray-600">🛒 {product.total_orders} đơn hàng</p>
              <p className="text-gray-800 font-bold">📦 {product.total_sold} đã bán</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}