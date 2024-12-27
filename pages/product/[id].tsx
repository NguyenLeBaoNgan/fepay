// pages/product/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosClient from "../../utils/axiosClient";
import Header from "@/components/header";
import Footer from "@/components/footer";

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

  const handleAddToCartConfirm = () => {
    if (product) {
      const newItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity,
      };

      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      existingCart.push(newItem);
      localStorage.setItem("cart", JSON.stringify(existingCart));
      alert("Product added to cart!");
      setShowForm(false);
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
            <div className="category-banner mt-3 p-3 bg-gradient-to-r rounded-full shadow-lg w-max">
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
        <div className="add-to-cart-form fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Select Quantity</h2>
            <input
              type="number"
              min="1"
              max={product?.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded-lg px-4 py-2 mb-4 w-full"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCartConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ProductDetail;
