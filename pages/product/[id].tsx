// pages/product/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosClient from "../../utils/axiosClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { toast } from "react-toastify";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
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
          alert("Product added to cart!");
          setShowForm(false);
        }
      } catch (err) {
        console.error("Failed to check stock:", err);
        alert("An error occurred while checking stock. Please try again.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!product) return <p>Product not found</p>;

  return (
    <>
      <Header />
      <div className="product-detail container mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-center justify-center bg-white rounded-lg shadow-xl p-8">
          <div className="product-image-container flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="product-image rounded-xl shadow-lg transition-transform transform hover:scale-105"
            />
          </div>

          <div className="product-info flex flex-col lg:ml-12 mt-4 lg:mt-0 w-full">
            <div className="category-banner mt-3 p-3 w-max">
              <span className="category-text text-lg font-semibold">
                {Array.isArray(product.category) && product.category.length > 0
                  ? product.category.map((cat, index) => (
                      <button
                        key={index}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full shadow-md transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 mr-2 mt-2"
                      >
                        {cat.name}
                      </button>
                    ))
                  : "No Categories"}
              </span>
            </div>

            <h3 className="product-title text-4xl font-bold text-gray-900 mt-6">
              {product.name}
            </h3>

            <p className="product-description text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            <div className="product-price-quantity mt-6">
              <p className="text-2xl font-semibold text-gray-800">
                <strong>Price:</strong> {product.price} VND
              </p>
              <p className="text-lg text-gray-500">
                <strong>Quantity:</strong> {product.quantity} items available
              </p>
            </div>

            <div className="action-buttons mt-8">
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-xl"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
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
