import React, { useEffect, useState } from "react";
import axiosClient from "@/utils//axiosClient";
import Link from "next/link";

interface Product {
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

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get<Product[]>("/api/products");
        setProducts(response.data);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-list container">
      <h1 className="title">Product List</h1>
      <div className="grid-container">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <Link href={`/product/${product.id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            </Link>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              {/* <p className="product-description">{product.description}</p> */}
              <p className="product-price"> {product.price} vnd</p>
              {/* <p className="product-quantity">Quantity: {product.quantity}</p> */}
              {/* <p className="product-category">Category: {product.category.name}</p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
