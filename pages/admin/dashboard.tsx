

// import React from "react";
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// interface DashboardOverviewProps {
//   products?: { name: string; quantity: number }[];
//   orders?: any[];
//   users?: any[];
// }

// const DashboardOverview: React.FC<DashboardOverviewProps> = ({
//   products = [],
//   orders = [],
//   users = [],
// }) => (
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

// const StatCard: React.FC<{ title: string; count: number; color: string }> = ({
//   title,
//   count,
//   color,
// }) => {
//   const borderClass = `border-t-4 ${
//     color === "blue"
//       ? "border-blue-500"
//       : color === "green"
//       ? "border-green-500"
//       : "border-purple-500"
//   }`;
//   const textClass = `${
//     color === "blue"
//       ? "text-blue-600"
//       : color === "green"
//       ? "text-green-600"
//       : "text-purple-600"
//   }`;

//   return (
//     <div className={`bg-white shadow-lg rounded-lg p-6 ${borderClass}`}>
//       <h3 className="text-xl font-medium text-gray-700">{title}</h3>
//       <p className={`text-2xl font-semibold ${textClass}`}>{count}</p>
//     </div>
//   );
// };

// export default DashboardOverview;
