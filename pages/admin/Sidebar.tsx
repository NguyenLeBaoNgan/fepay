import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaBehance,
  FaStore,
  FaBitcoin,
  FaBars,
  FaBalanceScale,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  onToggle?: (collapsed: boolean) => void; // Thêm prop để truyền trạng thái
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, setSelectedTab, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { tab: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { tab: "products", label: "Products", icon: FaBox },
    { tab: "categories", label: "Category", icon: FaBook },
    { tab: "orders", label: "Orders", icon: FaClipboardList },
    { tab: "users", label: "Users", icon: FaUsers },
    { tab: "accounts", label: "Accounts", icon: FaStore },
    { tab: "transactions", label: "Transactions", icon: FaBitcoin },
    { tab: "payments", label: "Payments", icon: FaBalanceScale },
    { tab: "auditlog", label: "Audit Log", icon: FaBehance },
  ];

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      if (onToggle) onToggle(newState); // Gọi callback để thông báo trạng thái mới
      return newState;
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen p-4 md:p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl",
        "fixed top-0 left-0 transition-all duration-300 z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-6 md:mb-10">
        {!isCollapsed && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-lg">
            <Link href="/" className="text-blue-500">
              Shop
            </Link>
          </h2>
        )}
        <Button
          variant="ghost"
          className={cn(
            "p-2 text-white hover:bg-white/10 rounded-full",
            isCollapsed ? "mx-auto" : ""
          )}
          onClick={toggleSidebar}
        >
          <FaBars className="w-4 md:w-5 h-4 md:h-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-2 md:space-y-3">
        {menuItems.map(({ tab, label, icon: Icon }) => (
          <Button
            key={tab}
            variant="ghost"
            className={cn(
              "w-full py-2 md:py-3 px-2 md:px-4 rounded-xl text-xs md:text-sm font-medium",
              "hover:bg-white/10 hover:text-white transition-all duration-200",
              selectedTab === tab && "bg-white/20 text-white shadow-inner font-semibold",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => setSelectedTab(tab)}
            title={isCollapsed ? label : undefined}
          >
            <Icon className="w-4 md:w-5 h-4 md:h-5 shrink-0" />
            {!isCollapsed && <span className="ml-2 md:ml-3">{label}</span>}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;