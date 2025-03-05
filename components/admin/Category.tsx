import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/utils/axiosClient";
import DataTable from "./DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";

interface Category {
  id: string;
  name: string;
}

const Category: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories("");
  }, []);

  const fetchCategories = async (query: string) => {
    setLoading(query === ""); 
    setIsSearching(!!query); 
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get<Category[]>(
        `/api/categories${query ? `?search=${encodeURIComponent(query)}` : ""}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      setCategories(response.data);
    } catch (err) {
      setError("Không thể lấy danh sách thể loại");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };
  // const modifiedCategories = categories.map((category) => ({
  //   ...category,
  //   id: `#${category.id.slice(-5)}`, 
  // }));
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(debounce(fetchCategories, 300), []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await axiosClient.get<Category>(`/api/categories/${id}`);
      if (!response.data || !response.data.id) {
        throw new Error("Category không hợp lệ!");
      }
      setEditCategory(response.data);
      setNewName(response.data.name);
    } catch (err) {
      toast.error("Lỗi: Không thể lấy dữ liệu category!");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editCategory) return;
    try {
      await axiosClient.post(`/api/categories/${id}`, {
        name: newName,
      });
      setEditCategory(null);
      setNewName("");
      fetchCategories(searchQuery); 
      toast.success("Cập nhật thành công!");
    } catch (err) {
      toast.error("Lỗi khi cập nhật!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Xóa thể loại thành công!");
    } catch (err) {
      toast.error("Lỗi khi xóa thể loại!");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await axiosClient.post("/api/categories", { name: newCategoryName });
      setNewCategoryName("");
      setIsAddDialogOpen(false);
      fetchCategories(searchQuery); 
      toast.success("Thêm thể loại thành công!");
    } catch (err) {
      toast.error("Lỗi khi thêm thể loại!");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Quản lý Thể loại</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Thêm Thể loại</Button>
      </div>
      <Card className="p-4 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
            Danh sách Thể loại
          </h2>
          <div className="relative w-full md:w-72">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên thể loại..."
              className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
            {isSearching ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
              </div>
            ) : (
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>
        <DataTable
          title=""
          data={categories}
          
          columns={[{ 
            key: "id", label: "ID" },
            { key: "name", label: "Tên Thể loại" }
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Thể loại</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nhập tên thể loại mới"
          />
          <DialogFooter>
            <Button onClick={handleAddCategory} variant="secondary">
              Thêm
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)} variant="default">
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Thể loại</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nhập tên mới"
          />
          <DialogFooter>
            <Button
              onClick={() => handleUpdate(editCategory?.id || "")}
              variant="secondary"
            >
              Lưu
            </Button>
            <Button onClick={() => setEditCategory(null)} variant="default">
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Category;