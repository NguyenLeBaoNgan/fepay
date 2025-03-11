// pages/product/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosClient from "../../utils/axiosClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import FeedbackForm from "./feedback";
import Feedback from "./feedback";
interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: {
    id: number;
    name: string;
  };
  image: string;
}

const ProductDetail: React.FC = () => {
  const { query } = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const productId = query.id as string;

  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchProductDetail = async () => {
      const { id } = query;
      if (!id) return;

      try {
        const response = await axiosClient.get<ProductDetail>(
          `/api/products/${id}`
        );
        setProduct(response.data);
      } catch (err) {
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [query]);
  const handleAddToCart = () => {
    setShowForm(true);
  };

  // const handleAddToCartConfirm = () => {
  //   if (product) {
  //     const newItem = {
  //       product_id: product.id,
  //       name: product.name,
  //       price: product.price,
  //       quantity: quantity,
  //       total: product.price * quantity,
  //     };

  //     const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
  //     const existingItemIndex = existingCart.findIndex(
  //       (item: any) => item.product_id === product.id
  //     );

  //     if (existingItemIndex !== -1) {
  //       // Cập nhật số lượng nếu sản phẩm đã tồn tại
  //       existingCart[existingItemIndex].quantity += quantity;
  //       existingCart[existingItemIndex].total =
  //         existingCart[existingItemIndex].price *
  //         existingCart[existingItemIndex].quantity;
  //     } else {
  //       // Thêm sản phẩm mới
  //       existingCart.push(newItem);
  //     }
  //     localStorage.setItem("cart", JSON.stringify(existingCart));
  //     alert("Product added to cart!");
  //     setShowForm(false);
  //   }
  // };
  const handleAddToCartConfirm = async () => {
    if (product) {
      // Tạo dữ liệu yêu cầu kiểm tra tồn kho
      const requestPayload = {
        items: [
          {
            product_id: product.id,
            quantity: quantity,
          },
        ],
      };

      try {
        // Gọi API kiểm tra tồn kho
        const response = await axiosClient.post(
          "/api/check-stock",
          requestPayload
        );

        if (response.status === 200) {
          const availableQuantity = response.data.available_quantity;

          // Nếu số lượng còn lại nhỏ hơn số lượng yêu cầu
          if (quantity > availableQuantity) {
            // toast.warn(`Chỉ còn ${availableQuantity} sản phẩm trong kho.`, {
            //   position: "top-right",
            // });
            alert(
              `Insufficient stock. Only ${availableQuantity} item(s) available.`
            );
            return;
          }

          // Thêm sản phẩm vào giỏ hàng nếu còn hàng
          const newItem = {
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            total: product.price * quantity,
          };

          const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const existingItemIndex = existingCart.findIndex(
            (item: any) => item.product_id === product.id
          );

          if (existingItemIndex !== -1) {
            // Cập nhật số lượng nếu sản phẩm đã tồn tại
            existingCart[existingItemIndex].quantity += quantity;
            existingCart[existingItemIndex].total =
              existingCart[existingItemIndex].price *
              existingCart[existingItemIndex].quantity;
          } else {
            // Thêm sản phẩm mới
            existingCart.push(newItem);
          }

          localStorage.setItem("cart", JSON.stringify(existingCart));
          // Cập nhật giỏ hàng trên tất cả các tab
          window.dispatchEvent(new Event("storage"));
          alert("Product added to cart!");
          setShowForm(false);
        }
      } catch (err) {
        console.error("Failed to check stock:", err);
        alert("An error occurred while checking stock. Please try again.");
      }
    }
  };
  useEffect(() => {
    if (!productId) return;
  
    const fetchFeedbacks = async () => {
      setFeedbackLoading(true);
      try {
        const response = await axiosClient.get(`/api/feedbacks/${productId}`);
        const feedbackData = Array.isArray(response.data) ? response.data : [];
        setFeedbacks(feedbackData);
  
        if (feedbackData.length > 0) {
          const totalRating = feedbackData.reduce(
            (sum: number, feedback: any) => sum + feedback.rating,
            0
          );
          setAverageRating(totalRating / feedbackData.length);
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        setFeedbacks([]);
        setAverageRating(0);
      } finally {
        setFeedbackLoading(false);
      }
    };
  
    fetchFeedbacks();
  }, [productId]);
  const handleFeedbackUpdate = (newFeedbacks: Feedback[]) => {
    setFeedbacks(newFeedbacks);
    if (newFeedbacks.length > 0) {
      const totalRating = newFeedbacks.reduce(
        (sum: number, fb: Feedback) => sum + fb.rating,
        0
      );
      setAverageRating(totalRating / newFeedbacks.length);
    } else {
      setAverageRating(0);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!product) return <p>Product not found</p>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 md:p-8">
        <motion.div
          className="flex flex-col lg:flex-row items-start bg-white rounded-3xl shadow-xl p-6 md:p-10 transition-all duration-300 hover:shadow-2xl border border-gray-100"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="product-image-container w-full lg:w-2/5 overflow-hidden rounded-2xl shadow-lg bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <motion.div
              className="relative w-full aspect-square flex items-center justify-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain rounded-xl transform transition-all duration-500"
                whileHover={{ scale: 1.08, rotate: 1 }}
                style={{
                  filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.15))",
                }}
              />
            </motion.div>
          </div>

          {/* Phần thông tin sản phẩm */}
          <div className="product-info flex flex-col lg:ml-14 mt-8 lg:mt-0 w-full lg:w-3/5">
            {/* Danh mục sản phẩm */}
            <div className="category-banner flex flex-wrap gap-2 mb-4">
              {Array.isArray(product.category) &&
              product.category.length > 0 ? (
                product.category.map((cat, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-700 text-white py-1.5 px-4 rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-110"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Tag size={14} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </motion.div>
                ))
              ) : (
                <span className="text-gray-500">No Categories</span>
              )}
            </div>

            {/* Tên sản phẩm */}
            <motion.h3
              className="text-3xl font-extrabold text-gray-900 mt-2 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {product.name}
            </motion.h3>

            {/* Đánh giá */}
            <div className="flex items-center gap-1 mb-5">
  {[1, 2, 3, 4, 5].map((star) => (
    <svg
      key={star}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={star <= Math.round(averageRating) ? "#FFC107" : "none"}
      stroke={star <= Math.round(averageRating) ? "#FFC107" : "#E5E7EB"}
      strokeWidth="2"
      className="transition-all duration-300"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ))}
  <span className="text-sm text-gray-500 ml-2">
    {feedbacks.length > 0
      ? `${averageRating.toFixed(1)} (${feedbacks.length} đánh giá)`
      : "(Chưa có đánh giá)"}
  </span>
</div>

            <div className="relative">
              <motion.p
                className="text-gray-600 text-lg leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {product.description}
              </motion.p>
            </div>

            <motion.div
              className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-2xl shadow-sm flex flex-wrap md:flex-nowrap justify-between items-center gap-4 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="price-container">
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </p>
                  {/* <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    -20% OFF
                  </span> */}
                </div>
              </div>

              <div className="stock-container">
                <p className="text-sm text-gray-500 mb-1">In Stock</p>
                <p className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      product.quantity > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {product.quantity} items
                </p>
              </div>
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-4">
              <motion.button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg py-4 px-8 rounded-full transform transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                disabled={product.quantity <= 0}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6H21"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add to Cart
              </motion.button>

              <motion.button
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-blue-600 border border-gray-200 transition-all hover:bg-blue-50"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.12831 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.12831 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 6V12L16 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Fast delivery: 2-3 days
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Free shipping nationwide
              </div>
            </div>
          </div>
        </motion.div>

        <FeedbackForm productId={product?.id || 0} onFeedbackUpdate={handleFeedbackUpdate} />
      </div>
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger>
            <div className="add-to-cart-form fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"></div>
          </DialogTrigger>

          <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <h2 className="text-lg font-semibold mb-4">Select Quantity</h2>
            </DialogHeader>
            <input
              type="number"
              min="1"
              max={product?.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded-lg px-4 py-2 mb-4 w-full"
            />
            <DialogFooter>
              <div className="flex justify-end gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddToCartConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add to Cart
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </>
  );
};

export default ProductDetail;
