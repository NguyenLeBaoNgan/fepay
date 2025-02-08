
// export default AdminDashboard;
import React, { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import Sidebar from "./Sidebar";
import DashboardOverview from "./DashboardOverview";
import Product from "@/components/admin/Product";
import Category from "@/components/admin/Category";
import User from "@/components/admin/User";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditUser from "@/components/admin/user/Edit";
import Orders from "@/components/admin/Orders";

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          productsResponse,
          usersResponse,
          categoriesResponse,
          ordersResponse,
        ] = await Promise.all([
          axiosClient.get("/api/products"),
          axiosClient.get("/api/getalluser"),
          axiosClient.get("/api/categories"),
          axiosClient.get("/api/orders"),
        ]);

        setProducts(productsResponse.data);
        setUsers(usersResponse.data);
        setCategories(categoriesResponse.data);
        console.log("API Response:", categoriesResponse.data);
        setOrders(ordersResponse.data);
        console.log("order:", categoriesResponse.data);
      } catch (error) {
        toast.error("Error loading data!");
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/api/products/${id}`);

      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Error deleting !");
    }
  };
  const handleEditUser = (id: string) => {
    const userToEdit = users.find((user) => user.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
    }
  };
  const DeleteUser = async (id: string) => {
    await axiosClient.delete(`/api/user/${id}`);
    setProducts(users.filter((user) => user.id !== id));
    toast.success("User deleted successfully!");
  };
  const handleEdit = (id: string) => {
    const productToEdit = products.find((product) => product.id === id);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setIsModalOpen(true); // Mở modal
    }
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      const formData = new FormData();

      formData.append("name", editingProduct.name);
      formData.append("price", String(editingProduct.price));
      formData.append("description", editingProduct.description);
      formData.append("quantity", String(editingProduct.quantity));

      // Loop through selected category names, find the corresponding category IDs, and append each one
      if (editingProduct.category.length > 0) {
        editingProduct.category.forEach((categoryName: string) => {
          const category = categories.find((cat) => cat.name === categoryName);
          if (category) {
            formData.append("category_id[]", category.id); // Append category ID
          }
        });
      }

      if (editingProduct.image instanceof File) {
        formData.append("image", editingProduct.image);
      }

      const response = await axiosClient.post(
        `/api/products/${editingProduct.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Product updated successfully!");
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id ? response.data : product
        )
      );
      setEditingProduct(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.response) {
        toast.error(
          `Error updating product: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        toast.error("Error updating product!");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div className="flex-1 p-8">
        {selectedTab === "dashboard" && (
          <DashboardOverview
            products={products}
            //  categories={categories}
            orders={orders}
            users={users}
          />
        )}
        {selectedTab === "products" && (
          <Product
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {selectedTab === "categories" && <Category categories={categories} />}
        {selectedTab === "orders" && <Orders orders={orders} />}
        {selectedTab === "users" && (
          <User users={users} onEdit={handleEditUser} onDelete={DeleteUser} />
        )}
      </div>

      {/* Modal Edit Product */}
      {editingProduct && (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">
            Chỉnh sửa sản phẩm
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
                {typeof editingProduct.image === "string" ? (
                  <img
                    src={editingProduct.image}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                ) : editingProduct.image ? (
                  <img
                    src={URL.createObjectURL(editingProduct.image)} // Hiển thị ảnh đã chọn
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditingProduct({
                          ...editingProduct,
                          image: file, // Lưu tệp hình ảnh vào state
                        });
                      }
                    }}
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
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
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
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
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
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
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
                  value={editingProduct.quantity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      quantity: Number(e.target.value),
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Danh mục
                </label>
                <select
                  multiple
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 mt-8 border-t">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      {editingUser && (
        <EditUser
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          users={users}
          setUsers={setUsers}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
