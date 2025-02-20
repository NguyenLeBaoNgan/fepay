"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axiosClient";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axiosClient from "@/utils/axiosClient";

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  result: string;
  ip_address: string;
  browser: string;
  created_at: string;
}

export default function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    axiosClient.get("/api/audit-logs").then((response) => {
      setLogs(response.data);
    });
  };

  const handleDeleteAll = async () => {
    if (!confirm("Bạn có chắc chắn muốn xoá tất cả audit logs?")) return;
    setLoading(true);
    try {
      await axiosClient.delete("/api/audit-logs");
      setLogs([]);
      toast.success("Xoá tất cả logs thành công!");
    } catch (error) {
      toast.error("Lỗi khi xoá logs!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "user_name", label: "Người dùng" },
    { key: "action", label: "Hành động" },
    { key: "result", label: "Kết quả" },
    { key: "ip_address", label: "IP" },
    { key: "browser", label: "Trình duyệt" },
    { key: "created_at", label: "Thời gian" },
  ];

  const formattedLogs = logs.map((log) => ({
    ...log,
    created_at: new Date(log.created_at).toLocaleString(),
    browser: (() => {
      if (log.browser.includes("Edg/")) return "Edge";
      if (log.browser.includes("Chrome/") && !log.browser.includes("Edg/"))
        return "Chrome";
      if (log.browser.includes("Firefox/")) return "Firefox";
      if (log.browser.includes("Safari/") && !log.browser.includes("Chrome/"))
        return "Safari";
      return "Unknown";
    })(),
    full_browser: log.browser,
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Audit Log User</h2>
        <Button
          variant="destructive"
          onClick={handleDeleteAll}
          disabled={loading}
        >
          {loading ? "Đang xoá..." : "Xoá tất cả"}
        </Button>
      </div>
      <DataTable title="" data={formattedLogs} columns={columns} />
    </div>
  );
}
