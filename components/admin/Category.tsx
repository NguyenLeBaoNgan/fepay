import React from "react";
import DataTable from "./DataTable";

interface Category {
  id: string;
  name: string;
}

interface CategoryProps {
  categories: Category[];
}

const Category: React.FC<CategoryProps> = ({ categories }) => {
  return (
    <DataTable
      title="Category"
      data={categories}
      columns={[{ key: "name", label: "Category" }]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default Category;
