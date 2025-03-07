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
import Account from "@/components/admin/Account";
import Transaction from "@/components/admin/Transaction";
import AuditLogTable from "@/components/admin/AuditLog";
import Payment from "@/components/admin/Payment";

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Thêm state để theo dõi trạng thái Sidebar

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          productsResponse,
          usersResponse,
          categoriesResponse,
          ordersResponse,
          accountResponse,
        ] = await Promise.all([
          axiosClient.get("/api/products"),
          axiosClient.get("/api/getalluser"),
          axiosClient.get("/api/categories"),
          axiosClient.get("/api/orders"),
          axiosClient.get("/api/accounts"),
        ]);

        setProducts(productsResponse.data);
        setUsers(usersResponse.data);
        setCategories(categoriesResponse.data);
        setOrders(ordersResponse.data);
        setAccounts(accountResponse.data);
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
      toast.error("Error deleting!");
    }
  };

  const handleEditUser = (id: string) => {
    const userToEdit = users.find((user) => user.id === id);
    if (userToEdit) setEditingUser(userToEdit);
  };

  const DeleteUser = async (id: string) => {
    await axiosClient.delete(`/api/user/${id}`);
    setUsers(users.filter((user) => user.id !== id)); // Sửa từ setProducts thành setUsers
    toast.success("User deleted successfully!");
  };

  const handleEdit = (id: string) => {
    const productToEdit = products.find((product) => product.id === id);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setIsModalOpen(true);
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

      if (editingProduct.category.length > 0) {
        editingProduct.category.forEach((categoryName: string) => {
          const category = categories.find((cat) => cat.name === categoryName);
          if (category) formData.append("category_id[]", category.id);
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
      setProducts(products.map((p) => (p.id === editingProduct.id ? response.data : p)));
      setEditingProduct(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product!");
    }
  };

  // Callback để nhận trạng thái collapsed từ Sidebar
  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 ">
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        onToggle={handleSidebarToggle} // Truyền callback để cập nhật trạng thái
      />
      <div
        className="flex-1 p-4 md:p-8 transition-all duration-300 w-full"
        style={{
          marginLeft: isSidebarCollapsed ? "64px" : "256px", // Điều chỉnh margin-left động
        }}
      >
        {selectedTab === "dashboard" && (
          <DashboardOverview products={products} orders={orders} users={users} />
        )}
        {selectedTab === "products" && (
          <Product products={products} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {selectedTab === "categories" && <Category />}
        {selectedTab === "orders" && <Orders />}
        {selectedTab === "users" && (
          <User users={users} onEdit={handleEditUser} onDelete={DeleteUser} />
        )}
        {selectedTab === "accounts" && <Account accounts={accounts} />}
        {selectedTab === "transactions" && <Transaction />}
        {selectedTab === "payments" && <Payment />}
        {selectedTab === "auditlog" && <AuditLogTable />}
      </div>

      {/* Modal Edit Product */}
      {editingProduct && (
        <dialog
          open={isModalOpen}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
              Chỉnh sửa sản phẩm
            </h2>
            <div className="space-y-4 md:space-y-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Ảnh sản phẩm</label>
                <div className="flex items-center space-x-4">
                  {typeof editingProduct.image === "string" ? (
                    <img
                      src={editingProduct.image}
                      alt="Product"
                      className="w-24 md:w-32 h-24 md:h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : editingProduct.image ? (
                    <img
                      src={URL.createObjectURL(editingProduct.image)}
                      alt="Product"
                      className="w-24 md:w-32 h-24 md:h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 md:w-32 h-24 md:h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-gray-400">Chưa có ảnh</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) setEditingProduct({ ...editingProduct, image: file });
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-3 md:px-4 py-1 md:py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      Chọn ảnh mới
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 md:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Giá</label>
                  <div className="relative">
                    <span className="absolute left-2 md:left-3 top-2 md:top-3 text-gray-500">₫</span>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                      }
                      className="w-full pl-6 md:pl-8 border-2 border-gray-200 rounded-lg p-2 md:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Mô tả</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 md:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={4}
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Số lượng</label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 md:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Danh mục</label>
                  <select
                    multiple
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: Array.from(e.target.selectedOptions, (option) => option.value),
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 md:p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 md:space-x-4 pt-4 md:pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 md:px-6 py-1 md:py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 md:px-6 py-1 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </dialog>
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