import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
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

  const router = useRouter();

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
        setCategories(categoryResponse.data);
      } catch (err) {
        setError("Failed to fetch categories");
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value === "all" ? "" : value,
    }));
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
      // Nếu đã có sản phẩm trong giỏ hàng, kiểm tra xem có đủ số lượng mua không
      if (existingCart[existingItemIndex].quantity >= product.quantity) {
        alert(`Đã có trong giỏ hàng. Chỉ còn ${product.quantity} sản phẩm.`);
        return;
      }

      // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
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
    // if (filters.category) {
    //   const productCategory = product.category?.name?.toLowerCase().trim() || "";
    //   const filterCategory = filters.category.toLowerCase().trim();
    //   if (productCategory !== filterCategory) {
    //     match = false;
    //   }
    // }
    
    if (filters.category) {
      const filterCategory = filters.category.toLowerCase().trim();
  
      // Kiểm tra nếu ít nhất một category trong danh sách khớp với bộ lọc
      const hasMatchingCategory = product.category.some(
        (cat) => cat.name.toLowerCase().trim() === filterCategory
      );
  
      if (!hasMatchingCategory) {
        match = false;
      }
    }
    
    
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange.split("-").map(Number);
      if (product.price < minPrice || (maxPrice && product.price > maxPrice)) {
        match = false;
      }
    }
    return match;
  });

  if (loading) return <Skeleton className="w-full h-40" />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Product List</h1>

      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <Select onValueChange={(value) => handleFilterChange("category", value)}>
          <SelectTrigger className="w-[220px] shadow-md rounded-lg bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleFilterChange("priceRange", value)}>
          <SelectTrigger className="w-[220px] shadow-md rounded-lg bg-white">
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-10000">0 - 10,000 VND</SelectItem>
            <SelectItem value="10000-50000">10,000 - 50,000 VND</SelectItem>
            <SelectItem value="50000-max">50,000+ VND</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <motion.div key={product.id} whileHover={{ scale: 1.05 }}>
              <Card className="shadow-lg rounded-xl overflow-hidden bg-white transition-all">
                <CardHeader>
                  <Link href={`/product/${product.id}`}>
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-52 object-cover rounded-t-xl"
                      whileHover={{ scale: 1.1 }}
                    />
                  </Link>
                </CardHeader>
                <CardContent className="p-5">
                  <CardTitle className="text-xl font-semibold text-gray-900 text-center">
                    {product.name}
                  </CardTitle>
                  <p className="text-blue-600 text-center text-lg font-bold mt-2">{product.price} VND</p>
                  {product.quantity === 0 ? (
                    <Badge className="bg-red-500 text-white mt-3 text-sm py-1 px-3 rounded-full text-center">
                      Hết hàng
                    </Badge>
                  ) : (
                    <Button
                      className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg shadow-md hover:scale-105 transition"
                      onClick={() => handleBuyNow(product)}
                    >
                      Mua ngay
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-lg font-medium text-gray-600">No products found.</p>
        )}
      </motion.div>
    </div>
  );
};

export default ProductList;
