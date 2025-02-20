import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get<Category[]>("/api/categories");
      setCategories(response.data);
    } catch (err) {
      setError("Không thể lấy danh sách thể loại");
    } finally {
      setLoading(false);
    }
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
      fetchCategories();
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
      fetchCategories();
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
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Danh sách Thể loại
        </h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="mb-4">
          Thêm Thể loại
        </Button>
      </div>
      <Card className="p-4 shadow-lg">
        <DataTable
          title="Thể loại"
          data={categories}
          columns={[{ key: "name", label: "Tên Thể loại" }]}
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
