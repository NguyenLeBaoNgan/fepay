import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Footer from "@/components/footer";
import Header from "@/components/header";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category?: Category[];
  image: string;
}

interface Category {
  id: number;
  name: string;
}

const SearchPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Chỉ dùng cho lỗi thực sự
  const [notFound, setNotFound] = useState<boolean>(false); // Trạng thái khi không tìm thấy sản phẩm
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
  const { query } = router.query;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const response = await axiosClient.post("/api/products/search", {
          name: query,
        });
        const data = response.data;

        if (response.status === 200) {
          if (data.products && data.products.length > 0) {
            setProducts(data.products); // Có sản phẩm
            setNotFound(false);
          } else {
            setProducts([]); // Không có sản phẩm
            setNotFound(true); // Đánh dấu không tìm thấy
          }
        }
      } catch (err: any) {
        setProducts([]);
        if (err.response && err.response.status === 404) {
          setNotFound(true); // Không tìm thấy sản phẩm
        } else {
          setError("Failed to fetch search results"); // Lỗi thực sự
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoryResponse = await axiosClient.get<Category[]>(
          "/api/categories"
        );
        setCategories(categoryResponse.data);
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };

    fetchSearchResults();
    fetchCategories();
  }, [query]);

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

  const filteredProducts = products.filter((product) => {
    let match = true;

    if (filters.category && Array.isArray(product.category)) {
      const filterCategory = filters.category.toLowerCase().trim();
      const hasMatchingCategory = product.category.some(
        (cat) => cat.name.toLowerCase().trim() === filterCategory
      );
      if (!hasMatchingCategory) match = false;
    }

    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);
      if (product.price < minPrice || (maxPrice && product.price > maxPrice)) {
        match = false;
      }
    }
    return match;
  });

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

  // Nếu có lỗi thực sự (không phải "not found"), hiển thị thông báo lỗi
  if (error) {
    return <p className="text-red-500 text-center text-lg py-10">{error}</p>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen container mx-auto bg-gradient-to-br from-gray-100 via-white to-blue-50 px-4 py-8 md:px-6 lg:px-8">
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-blue-800 mb-12 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Kết quả tìm kiếm cho <span className="text-green-600">{query}</span>
        </motion.h1>

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
          ) : notFound ? (
            <motion.p
              className="col-span-full text-center text-lg font-medium text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Không tìm thấy sản phẩm nào.
              <div className="flex flex-col items-center">
                <img
                  src="https://cdn.dribbble.com/userupload/25177493/file/original-cd89b23a9858ad9e8b4d6b125d44d4ff.gif"
                  alt="404 Image"
                  //   width={500}
                />
              </div>
            </motion.p>
          ) : null}
        </motion.div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm"
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
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    } transition-all duration-300 shadow-sm`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm"
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
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
