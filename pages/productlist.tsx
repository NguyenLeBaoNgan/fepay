import React, { useEffect, useMemo, useState, useCallback } from "react";
import axiosClient from "@/utils/axiosClient";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import { ChevronRight, ChevronLeft } from "lucide-react";

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

const ProductCard = React.memo(
  ({
    product,
    rating,
    handleBuyNow,
  }: {
    product: Product;
    rating: number;
    handleBuyNow: (product: Product) => void;
  }) => {
    const renderStars = (rating: number) => {
      return [...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ));
    };

    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg"
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-60 object-cover rounded-t-2xl"
            loading="lazy" 
          />
        </Link>
        <div className="p-5 flex flex-col items-center">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex justify-between items-center w-full mt-3">
            <p className="text-blue-700 text-xl font-bold">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
            </p>
            <div className="flex items-center">
              {renderStars(rating)}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                ({rating.toFixed(1)})
              </span>
            </div>
          </div>
          {product.quantity === 0 ? (
            <span className="mt-4 inline-block bg-red-100 text-red-600 py-1 px-3 rounded-full text-sm font-medium">
              Hết hàng
            </span>
          ) : (
            <Button
              onClick={() => handleBuyNow(product)}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            >
              Mua ngay
            </Button>
          )}
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ category: string; priceRange: string }>({
    category: "",
    priceRange: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 12;
  const router = useRouter();

  // Fetch data
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

  // Fetch ratings
  useEffect(() => {
    if (!products.length) return;

    const fetchRatings = async () => {
      const productIds = products.map((p) => p.id);
      try {
        const response = await axiosClient.post("/api/feedbacks/batch", { productIds });
        setRatings(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy ratings:", error);
        setRatings(products.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}));
      }
    };
    fetchRatings();
  }, [products]);

  // Memoized filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category) {
        const filterCategory = filters.category.toLowerCase().trim();
        if (!product.category.some((cat) => cat.name.toLowerCase().trim() === filterCategory)) {
          return false;
        }
      }
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);
        if (product.price < minPrice || (maxPrice && product.price > maxPrice)) {
          return false;
        }
      }
      return true;
    });
  }, [products, filters]);

  // Memoized pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle filter change
  const handleFilterChange = useCallback((name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value === "all" ? "" : value }));
    setCurrentPage(1);
  }, []);

  // Handle buy now
  const handleBuyNow = useCallback((product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemIndex = cart.findIndex((item: any) => item.product_id === product.id);

    if (itemIndex !== -1) {
      if (cart[itemIndex].quantity >= product.quantity) {
        alert(`Đã có trong giỏ hàng. Chỉ còn ${product.quantity} sản phẩm.`);
        return;
      }
      cart[itemIndex].quantity += 1;
      cart[itemIndex].total = cart[itemIndex].price * cart[itemIndex].quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/cart");
  }, [router]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-12 bg-gray-200 rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-80 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-center text-lg py-10">{error}</p>;

  return (
    <>
      <Hero />
      <div className="min-h-screen container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Sản Phẩm
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-3xl mx-auto mb-12">
          <select
            className="w-full sm:w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
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
            className="w-full sm:w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
            value={filters.priceRange || "all"}
          >
            <option value="all">Tất cả giá</option>
            <option value="0-10000">0 - 10,000 VND</option>
            <option value="10000-50000">10,000 - 50,000 VND</option>
            <option value="50000-max">50,000+ VND</option>
          </select>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            key={currentPage} // Đảm bảo animation khi đổi trang
          >
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rating={ratings[product.id] || 0}
                  handleBuyNow={handleBuyNow}
                />
              ))
            ) : (
              <motion.p
                className="col-span-full text-center text-lg font-medium text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Không tìm thấy sản phẩm nào.
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
                className={`rounded-full ${currentPage === page ? "bg-blue-600 text-white" : ""}`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductList;