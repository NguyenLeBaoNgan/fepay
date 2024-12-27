// import React from "react";
// import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

// interface DataTableProps {
//   title: string;
//   data: any[];
//   columns: { key: string; label: string }[];
//   onEdit?: (id: string) => void;
//   onDelete?: (id: string) => void;
// }

// const DataTable: React.FC<DataTableProps> = ({
//   title,
//   data,
//   columns,
//   onEdit,
//   onDelete,
// }) => (
//   <div className="mt-8">
//     <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
//     <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//       <thead>
//         <tr>
//           {columns.map((col) => (
//             <th key={col.key} className="py-3 px-4 text-left bg-gray-200">
//               {col.label}
//             </th>
//           ))}
//           {onEdit && <th className="py-3 px-4 bg-gray-200">Actions</th>}
//         </tr>
//       </thead>
//       <tbody>
//         {data.length > 0 ? (
//           data.map((row) => (
//             <tr key={row.id} className="border-b hover:bg-gray-100">
//               {columns.map((col) => (
//                 <td key={col.key} className="py-3 px-4">
//                   {col.key === "image" ? (
//                     <img
//                       src={row[col.key]}
//                       alt={row.name}
//                       className="w-16 h-16 object-cover"
//                     />
//                   ) : col.key === "category" ? (
//                     // Render category as a comma-separated list
//                     row[col.key].map((cat: { name: string }) => cat.name).join(", ")
//                   ) : (
//                     row[col.key]
//                   )}
//                 </td>
//               ))}
//               {onEdit && (
//                 <td className="py-3 px-4 flex gap-2">
//                   <button
//                     onClick={() => onEdit(row.id)}
//                     className="text-blue-500 hover:text-blue-700"
//                   >
//                     <AiOutlineEdit />
//                   </button>
//                   <button
//                     onClick={() => onDelete && onDelete(row.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <AiOutlineDelete />
//                   </button>
//                 </td>
//               )}
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan={columns.length + 1} className="text-center py-3">
//               No data available
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// );

// export default DataTable;
