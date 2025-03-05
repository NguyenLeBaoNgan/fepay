import React, { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { toast } from "react-toastify";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | File;
  category: string[];
  description: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    quantity: 0,
    image: "",
    category: [],
    description: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get("/api/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewProduct((prev) => ({
        ...prev,
        image: e.target.files ? e.target.files[0] : "",
      }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategories = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setNewProduct((prev) => ({
      ...prev,
      category: selectedCategories,
    }));
  };

  const handleSaveProduct = async () => {
    try {
      // Log các danh mục đã chọn
      console.log("Danh mục đã chọn:", newProduct.category);

      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price.toString());
      formData.append("quantity", newProduct.quantity.toString());

      // Nếu có ảnh, thêm ảnh vào formData
      if (newProduct.image instanceof File) {
        formData.append("image", newProduct.image);
      }

      // Kiểm tra và thêm các category_id vào FormData
      if (newProduct.category.length > 0) {
        newProduct.category.forEach((categoryId: string) => {
          formData.append("category_id[]", categoryId); // Sử dụng category_id[] ở đây
          // Log ra ID của danh mục để kiểm tra
          console.log("Category ID appended:", categoryId);
        });
      }

      // Log FormData để kiểm tra
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Gửi dữ liệu đến API
      const response = await axiosClient.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onAddProduct(response.data);
      onClose();

      setNewProduct({
        id: 0,
        name: "",
        price: 0,
        quantity: 0,
        image: "",
        category: [],
        description: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Đã có sản phẩm. Vui lòng kiểm tra lại!");
    }
   
  };

  const handleCancel = () => {
    onClose();
    setNewProduct({
      id: 0,
      name: "",
      price: 0,
      quantity: 0,
      image: "",
      category: [],
      description: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto overflow-hidden">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">
          Thêm Sản Phẩm Mới
        </h2>
        <div
          className="space-y-6"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {/* Ảnh sản phẩm */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Ảnh sản phẩm
            </label>
            <div className="flex items-center space-x-4">
              {typeof newProduct.image === "string" ? (
                <img
                  src={newProduct.image}
                  alt="Product"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              ) : newProduct.image ? (
                <img
                  src={URL.createObjectURL(newProduct.image)}
                  alt="Product"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400">Chưa có ảnh</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-4 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Chọn ảnh mới
                </label>
              </div>
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Giá
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₫</span>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="w-full pl-8 border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={4}
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          {/* Số lượng & Danh mục */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Số lượng
              </label>
              <input
                type="number"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Danh mục
              </label>
              <select
                multiple
                name="category"
                value={newProduct.category}
                onChange={handleCategoryChange}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 mt-8 border-t">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
