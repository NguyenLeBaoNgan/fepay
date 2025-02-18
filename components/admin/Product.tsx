
import React, { useState } from "react";
import DataTable from "./DataTable";
import AddProductModal from "./product/add";


interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | File;
  category: string[];
  description: string;
}

interface ProductProps {
  products: Product[];
  onEdit: (id: string ) => void;
  onDelete: (id: string) => void;
}

const Product: React.FC<ProductProps> = ({ products, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productList, setProductList] = useState<Product[]>(products);

  const handleAddProductClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProductList([...productList, newProduct]);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Product List</h1>
        <button
          onClick={handleAddProductClick}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          Add Product
        </button>
      </div>

      <DataTable
        title="Products"
        data={productList}
        columns={[
          { key: "name", label: "Product Name" },
          { key: "description", label: "Description" },
          { key: "price", label: "Price" },
          { key: "quantity", label: "Quantity" },
          { key: "image", label: "Image" },
          { key: "category", label: "Category" },
        ]}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Modal Thêm Sản Phẩm */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default Product;
