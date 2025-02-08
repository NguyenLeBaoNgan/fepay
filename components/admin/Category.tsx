import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient"; // Đảm bảo axiosClient được cấu hình đúng
import DataTable from "./DataTable"; // Import DataTable của bạn


const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axiosClient.get<Category[]>("/api/categories");
        setCategories(categoryResponse.data);
      } catch (err) {
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleEdit = (id: string) => {
    console.log("Edit category with id:", id);
    // Add logic for editing the category
  };

  const handleDelete = (id: string) => {
    console.log("Delete category with id:", id);
    // Add logic for deleting the category
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="category-list">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Category List</h1>
      <DataTable
        title="Categories"
        data={categories}
        columns={[{ key: "name", label: "Category Name" }]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CategoryList;
