import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient";
import DataTable from "./DataTable";
import { Card } from "@/components/ui/card";


interface Category {
  id: string;
  name: string;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get<Account[]>("/api/accounts");
      setCategories(response.data);
    } catch (err) {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

//   const handleEdit = async (id: string) => {
//     try {
//       const response = await axiosClient.get<Category>(`/api/categories/${id}`);
//       if (!response.data || !response.data.id) {
//         throw new Error("Category không hợp lệ!");
//       }
//       setEditCategory(response.data);
//       setNewName(response.data.name);
//     } catch (err) {
//       console.error("Lỗi: Không thể lấy dữ liệu category!", err);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editCategory || !editCategory.id) return;
//     try {
//       await axiosClient.put(`/api/categories/${editCategory.id}`, { name: newName });
//       setEditCategory(null);
//       setNewName("");
//       fetchCategories();
//     } catch (err) {
//       console.error("Failed to update category", err);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await axiosClient.delete(`/api/categories/${id}`);
//       setCategories(categories.filter((cat) => cat.id !== id));
//     } catch (err) {
//       console.error("Failed to delete category", err);
//     }
//   };
//   const handleAddCategory = async () => {
//     if (!newCategoryName) return;
//     try {
//       await axiosClient.post("/api/categories", { name: newCategoryName });
//       setNewCategoryName("");
//       setIsAddDialogOpen(false);
//       fetchCategories();
//     } catch (err) {
//       console.error("Failed to add category", err);
//     }
//   };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Account List</h1>
      
      <Card className="p-4 shadow-lg">
        <DataTable
          title="Categories"
          data={categories}
          columns={[{ key: "name", label: "Category Name" }]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
   
    </div>
  );
};

export default CategoryList;