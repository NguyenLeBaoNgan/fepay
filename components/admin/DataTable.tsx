import React, { useState } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface DataTableProps {
  title: string;
  data: any[];
  columns: { key: string; label: string }[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (order: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ title, data, columns, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>

      <div className="mt-8 max-w-6xl mx-auto ">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
        <Card className="shadow-md p-4">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                {onEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-100">
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.key === "image" ? (
                          <img src={row[col.key]} alt={row.name} className="w-16 h-16 object-cover" />
                        ) : col.key === "category" ? (
                          row[col.key].map((cat: { name: string }) => cat.name).join(", ")
                        ) : (
                          row[col.key]
                        )}
                      </TableCell>
                    ))}
                    {onEdit && (
                      <TableCell>
                        <Button variant="ghost" onClick={() => onEdit(row.id)}>
                          <AiOutlineEdit className="text-blue-500"/>
                        </Button>
                        <Button variant="ghost" onClick={() => onDelete && onDelete(row.id)}>
                          <AiOutlineDelete className="text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-3">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>

    </>
  );
};

export default DataTable;