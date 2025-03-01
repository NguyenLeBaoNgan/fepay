import React from "react";
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaBehance,
  FaStore,
  FaBitcoin,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, setSelectedTab }) => {
  const menuItems = [
    { tab: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { tab: "products", label: "Products", icon: FaBox },
    { tab: "categories", label: "Category", icon: FaBook },
    { tab: "orders", label: "Orders", icon: FaClipboardList },
    { tab: "users", label: "Users", icon: FaUsers },
    { tab: "accounts", label: "Accounts", icon: FaStore },
    { tab: "transactions", label: "Transactions", icon: FaBitcoin },
    { tab: "auditlog", label: "Audit Log", icon: FaBehance },
  ];

  return (
    <div
      className={cn(
        "flex flex-col w-64 h-screen p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl",
        "fixed top-0 left-0"
      )}
    >
      <h2 className="text-3xl font-bold text-center mb-10 tracking-tight text-white drop-shadow-lg">
        Admin Panel
      </h2>
      <nav className="flex-1 space-y-3">
        {menuItems.map(({ tab, label, icon: Icon }) => (
          <Button
            key={tab}
            variant="ghost"
            className={cn(
              "w-full justify-start py-3 px-4 rounded-xl text-sm font-medium",
              "hover:bg-white/10 hover:text-white transition-all duration-200",
              selectedTab === tab && "bg-white/20 text-white shadow-inner font-semibold"
            )}
            onClick={() => setSelectedTab(tab)}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;