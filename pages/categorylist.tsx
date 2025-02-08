import React, { useEffect, useState } from "react";
import axiosClient from "@/utils/axiosClient"; // Đảm bảo đường dẫn chính xác tới file axiosClient
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="category-list">
      {/* <h1 className="title">Category List</h1>

      <div className="grid-container">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <Link href={`/categories/${category.id}`}>
 
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                </div>

            </Link>
          </div>
        ))}
      </div>

      {categories.length === 0 && <p>No categories found.</p>} */}
    </div>
  );
};

export default CategoryList;
