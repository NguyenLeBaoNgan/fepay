import React from "react";
import DataTable from "./DataTable";

interface Category {
  id: number;
  name: string;
}

interface CategoryProps {
  categories: Category[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const Category: React.FC<CategoryProps> = ({ categories , onEdit, onDelete }) => {
  return (
    <DataTable
      title="Category"
      data={categories}
      columns={[{ key: "name", label: "Name" }]}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default Category;
