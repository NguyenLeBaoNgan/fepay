import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
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

interface Category {
  id: number;
  name: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    category: string;
    priceRange: string;
  }>({
    category: "",
    priceRange: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productResponse = await axiosClient.get<Product[]>(
          "/api/products"
        );
        setProducts(productResponse.data);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoryResponse = await axiosClient.get<Category[]>(
          "/api/categories"
        );
        console.log("Categories:", categoryResponse.data);
        setCategories(categoryResponse.data);
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  // console.log("Product before:", products);
  const filteredProducts = products.filter((product) => {
    // console.log("Product category:", product.category);
    let match = true;
    if (filters.category) {
      const productCategory = Array.isArray(product.category)
        ? product.category.map((cat) => cat.name.toLowerCase().trim())
        : [product.category?.name?.toLowerCase().trim() || ""];
      const filterCategory = filters.category.toLowerCase().trim();
      if (!productCategory.includes(filterCategory)) {
        match = false;
      }
    }
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);
      if (product.price < minPrice || product.price > maxPrice) {
        match = false;
      }
    }
    return match;
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-list">
      <h1 className="title">Product List</h1>

      <div className="filters">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="priceRange"
          value={filters.priceRange}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Price Ranges</option>
          <option value="0-10000">0 - 10,000 VND</option>
          <option value="10000-50000">10,000 - 50,000 VND</option>
          <option value="50000-max">50,000+ VND</option>
        </select>
      </div>

      <div className="grid-container">
        {filteredProducts.map((product) => (
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
              <p className="product-price">{product.price} VND</p>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && <p>No products found.</p>}
    </div>
  );
};

export default ProductList;
