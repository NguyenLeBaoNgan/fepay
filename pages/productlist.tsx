import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: Category[];
  image: string;
}

interface Category {
  id: number;
  name: string;
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  user: { name: string };
  created_at: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    category: string;
    priceRange: string;
  }>({
    category: "",
    priceRange: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 12;

  const router = useRouter();

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const productResponse = await axiosClient.get<Product[]>(
  //         "/api/products"
  //       );
  //       setProducts(productResponse.data);
  //     } catch (err) {
  //       setError("Failed to fetch products");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const fetchCategories = async () => {
  //     try {
  //       const categoryResponse = await axiosClient.get<Category[]>(
  //         "/api/categories"
  //       );
  //       setCategories(categoryResponse.data);
  //     } catch (err) {
  //       setError("Failed to fetch categories");
  //     }
  //   };

  //   fetchProducts();
  //   fetchCategories();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axiosClient.get<Product[]>("/api/products"),
          axiosClient.get<Category[]>("/api/categories"),
        ]);
        setProducts(productResponse.data);
        setCategories(categoryResponse.data);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      if (products.length === 0) return;

      const productIds = products.map((product) => product.id);
      try {
        const response = await axiosClient.post("/api/feedbacks/batch", {
          productIds,
        });
        setRatings(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy batch ratings:", error);
        const fallbackRatings = products.reduce((acc, product) => {
          acc[product.id] = 0;
          return acc;
        }, {} as { [key: string]: number });
        setRatings(fallbackRatings);
      }
    };

    fetchRatings();
  }, [products]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value === "all" ? "" : value,
    }));
    setCurrentPage(1);
  };

  const handleBuyNow = (product: Product) => {
    const newItem = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      total: product.price,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.product_id === product.id
    );

    if (existingItemIndex !== -1) {
      if (existingCart[existingItemIndex].quantity >= product.quantity) {
        alert(`Đã có trong giỏ hàng. Chỉ còn ${product.quantity} sản phẩm.`);
        return;
      }
      existingCart[existingItemIndex].quantity += 1;
      existingCart[existingItemIndex].total =
        existingCart[existingItemIndex].price *
        existingCart[existingItemIndex].quantity;
    } else {
      existingCart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    router.push("/cart");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let match = true;
      if (filters.category) {
        const filterCategory = filters.category.toLowerCase().trim();
        const hasMatchingCategory = product.category.some(
          (cat) => cat.name.toLowerCase().trim() === filterCategory
        );
        if (!hasMatchingCategory) match = false;
      }

      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);
        if (
          product.price < minPrice ||
          (maxPrice && product.price > maxPrice)
        ) {
          match = false;
        }
      }
      return match;
    });
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.round(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="h-12 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 h-80 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error)
    return <p className="text-red-500 text-center text-lg py-10">{error}</p>;

  return (
    <>
      <Hero />
      <div className="min-h-screen container mx-auto bg-gradient-to-br from-gray-100 via-white to-blue-50 px-4 py-8 md:px-6 lg:px-8">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-12 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Sản Phẩm
        </motion.h1>

        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <select
            className="w-full sm:w-64 p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
            onChange={(e) => handleFilterChange("category", e.target.value)}
            value={filters.category || "all"}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="w-full sm:w-64 p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
            value={filters.priceRange || "all"}
          >
            <option value="all">Tất cả giá</option>
            <option value="0-10000">0 - 10,000 VND</option>
            <option value="10000-50000">10,000 - 50,000 VND</option>
            <option value="50000-max">50,000+ VND</option>
          </select>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-60 object-cover rounded-t-2xl transition-transform duration-300 hover:scale-105"
                  />
                </Link>
                <div className="p-5 flex flex-col items-center">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 text-center hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center w-full mt-3">
                    <p className="text-blue-700 text-2xl font-bold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </p>
                    <div className="flex items-center">
                      {renderStars(ratings[product.id] || 0)}
                      <span className="text-sm text-gray-500 ml-1">
                        (
                        {ratings[product.id]
                          ? ratings[product.id].toFixed(1)
                          : "0"}
                        )
                      </span>
                    </div>
                  </div>
                  {product.quantity === 0 ? (
                    <span className="mt-4 inline-block bg-red-100 text-red-600 py-1 px-3 rounded-full text-sm font-medium">
                      Hết hàng
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-md"
                    >
                      Mua ngay
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              className="col-span-full text-center text-lg font-medium text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Không tìm thấy sản phẩm nào.
            </motion.p>
          )}
        </motion.div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            {/* Nút Previous */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full border-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>

            {/* Các nút phân trang */}
            <div className="flex items-center gap-2">
              {/* Trang đầu */}
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(1)}
                className={`w-10 h-10 rounded-full ${
                  currentPage === 1
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                    : "text-gray-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                } transition-all duration-300 shadow-sm`}
              >
                1
              </Button>

              {/* Dấu "..." phía trước */}
              {totalPages > 1 && currentPage > 4 && (
                <span className="text-gray-600 mx-1">...</span>
              )}

              {/* Các trang giữa */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page !== 1 &&
                    page !== totalPages &&
                    page >= currentPage - 1 &&
                    page <= currentPage + 1
                  );
                })
                .map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                        : "text-gray-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    } transition-all duration-300 shadow-sm`}
                  >
                    {page}
                  </Button>
                ))}

              {/* Dấu "..." phía sau */}
              {totalPages > 4 && currentPage < totalPages - 2 && (
                <span className="text-gray-600 mx-1">...</span>
              )}

              {/* Trang cuối */}
              {totalPages > 1 && (
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  className={`w-10 h-10 rounded-full ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "text-gray-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  } transition-all duration-300 shadow-sm`}
                >
                  {totalPages}
                </Button>
              )}
            </div>

            {/* Nút Next */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full border-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductList;
