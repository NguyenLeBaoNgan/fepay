// import React, { useState, useEffect } from "react";
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
// import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
// import Modal from "react-modal";
// import axiosClient from "../../utils/axiosClient";

// // Dữ liệu mẫu biểu đồ
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// // Kiểu dữ liệu
// interface Product {
//   id: string;
//   name: string;
//   price: string;
//   quantity: number;
// }

// interface Order {
//   id: string;
//   product_name: string;
//   customer_name: string;
//   total_price: string;
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
// }

// const AdminDashboard: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [selectedTab, setSelectedTab] = useState("dashboard");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const fetchData = async () => {
//     try {
//       const [productsResponse, ordersResponse, usersResponse] =
//         await Promise.all([
//           axiosClient.get("/api/products"),
//           // axiosClient.get("/api/orders"),
//           axiosClient.get("/api/users"),
//         ]);

//       console.log("Products Response:", productsResponse.data); // Kiểm tra trực tiếp dữ liệu từ API
//       setProducts(productsResponse.data);
//       setOrders(ordersResponse.data);
//       setUsers(usersResponse.data);
//     } catch (error: any) {
//       console.error("Error fetching data:", {
//         message: error.message,
//         response: error.response?.data,
//       });
//       alert("Có lỗi khi tải dữ liệu, vui lòng thử lại sau!");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div className="min-h-screen flex bg-gray-50">
//       {/* Sidebar */}
//       <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         {selectedTab === "dashboard" && (
//           <DashboardOverview
//             products={products}
//             orders={orders}
//             users={users}
//           />
//         )}
//         {selectedTab === "products" && (
//           <DataTable
//             title="Products"
//             data={products}
//             columns={[
//               { key: "name", label: "Product Name" },
//               { key: "price", label: "Price" },
//               { key: "quantity", label: "Quantity" },
//             ]}
//             onEdit={(id) => setIsModalOpen(true)}
//           />
//         )}
//         {/* {selectedTab === "orders" && (
//           <DataTable
//             title="Orders"
//             data={orders}
//             columns={[
//               { key: "id", label: "Order ID" },
//               { key: "product_name", label: "Product Name" },
//               { key: "customer_name", label: "Customer Name" },
//               { key: "total_price", label: "Total Price" },
//             ]}
//           />
//         )} */}
//         {selectedTab === "users" && (
//           <DataTable
//             title="Users"
//             data={users}
//             columns={[
//               { key: "name", label: "User Name" },
//               { key: "email", label: "Email" },
//             ]}
//           />
//         )}
//       </div>

//       {/* Modal Example */}
//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={() => setIsModalOpen(false)}
//         contentLabel="Edit Product"
//         className="p-6 bg-white rounded-lg max-w-lg mx-auto shadow-xl"
//         overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
//       >
//         <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
//         {/* Add your form or content here */}
//         <button
//           onClick={() => setIsModalOpen(false)}
//           className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
//         >
//           Close
//         </button>
//       </Modal>
//     </div>
//   );
// };

// const Sidebar: React.FC<{
//   selectedTab: string;
//   setSelectedTab: (tab: string) => void;
// }> = ({ selectedTab, setSelectedTab }) => (
//   <div className="bg-blue-800 text-white w-64 p-6">
//     <h2 className="text-2xl font-bold text-center mb-6">Admin Panel</h2>
//     <nav>
//       <button
//         className={`block w-full text-left px-4 py-2 rounded ${
//           selectedTab === "dashboard" ? "bg-blue-700" : "hover:bg-blue-700"
//         }`}
//         onClick={() => setSelectedTab("dashboard")}
//       >
//         Dashboard
//       </button>
//       <button
//         className={`block w-full text-left px-4 py-2 rounded ${
//           selectedTab === "products" ? "bg-blue-700" : "hover:bg-blue-700"
//         }`}
//         onClick={() => setSelectedTab("products")}
//       >
//         Products
//       </button>
//       <button
//         className={`block w-full text-left px-4 py-2 rounded ${
//           selectedTab === "orders" ? "bg-blue-700" : "hover:bg-blue-700"
//         }`}
//         onClick={() => setSelectedTab("orders")}
//       >
//         Orders
//       </button>
//       <button
//         className={`block w-full text-left px-4 py-2 rounded ${
//           selectedTab === "users" ? "bg-blue-700" : "hover:bg-blue-700"
//         }`}
//         onClick={() => setSelectedTab("users")}
//       >
//         Users
//       </button>
//     </nav>
//   </div>
// );

// const DashboardOverview: React.FC<{
//   products: Product[];
//   orders: Order[];
//   users: User[];
// }> = ({ products, orders, users }) => (
//   <div>
//     <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       <StatCard title="Total Products" count={products.length} color="blue" />
//       <StatCard title="Total Orders" count={orders.length} color="green" />
//       <StatCard title="Total Users" count={users.length} color="purple" />
//     </div>
//     <div className="mt-8">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//         Product Distribution
//       </h2>
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={products.map((p) => ({ name: p.name, value: p.quantity }))}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             outerRadius={100}
//             fill="#8884d8"
//           >
//             {products.map((_, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//           <Tooltip />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   </div>
// );

// // const StatCard: React.FC<{ title: string; count: number; color: string }> = ({
// //   title,
// //   count,
// //   color,
// // }) => (
// //   <div
// //     className={`bg-white shadow-lg rounded-lg p-6 border-t-4 border-${color}-500`}
// //   >
// //     <h3 className="text-xl font-medium text-gray-700">{title}</h3>
// //     <p className={`text-2xl font-semibold text-${color}-600`}>{count}</p>
// //   </div>
// // );

// const DataTable: React.FC<{
//   title: string;
//   data: any[];
//   columns: { key: string; label: string }[];
//   onEdit?: (id: string) => void;
// }> = ({ title, data, columns, onEdit }) => {
//   console.log("Data in DataTable:", data); // Kiểm tra dữ liệu tại DataTable
//   return (
//     <div className="mt-8">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
//       <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//         <thead>
//           <tr>
//             {columns.map((col) => (
//               <th key={col.key} className="py-3 px-4 text-left bg-gray-200">
//                 {col.label}
//               </th>
//             ))}
//             {onEdit && <th className="py-3 px-4 bg-gray-200">Actions</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {data.length > 0 ? (
//             data.map((row) => (
//               <tr key={row.id} className="border-b hover:bg-gray-100">
//                 {columns.map((col) => (
//                   <td key={col.key} className="py-3 px-4">
//                     {row[col.key]}
//                   </td>
//                 ))}
//                 {onEdit && (
//                   <td className="py-3 px-4 flex gap-2">
//                     <button
//                       onClick={() => onEdit(row.id)}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <AiOutlineEdit />
//                     </button>
//                     <button className="text-red-500 hover:text-red-700">
//                       <AiOutlineDelete />
//                     </button>
//                   </td>
//                 )}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={columns.length + 1} className="text-center py-3">
//                 No data available
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface DashboardOverviewProps {
  products?: { name: string; quantity: number }[];
  orders?: any[];
  users?: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products = [],
  orders = [],
  users = [],
}) => (
  <div>
    <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Total Products" count={products.length} color="blue" />
      <StatCard title="Total Orders" count={orders.length} color="green" />
      <StatCard title="Total Users" count={users.length} color="purple" />
    </div>
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Product Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={products.map((p) => ({ name: p.name, value: p.quantity }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {products.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const StatCard: React.FC<{ title: string; count: number; color: string }> = ({
  title,
  count,
  color,
}) => {
  const borderClass = `border-t-4 ${
    color === "blue"
      ? "border-blue-500"
      : color === "green"
      ? "border-green-500"
      : "border-purple-500"
  }`;
  const textClass = `${
    color === "blue"
      ? "text-blue-600"
      : color === "green"
      ? "text-green-600"
      : "text-purple-600"
  }`;

  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 ${borderClass}`}>
      <h3 className="text-xl font-medium text-gray-700">{title}</h3>
      <p className={`text-2xl font-semibold ${textClass}`}>{count}</p>
    </div>
  );
};

export default DashboardOverview;
