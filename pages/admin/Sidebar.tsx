import React from "react";
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaBook,
} from "react-icons/fa"; // Add icons for tabs

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, setSelectedTab }) => (
  <div className="bg-blue-800 text-white w-64 p-6 h-full flex flex-col">
    <h2 className="text-3xl font-semibold text-center mb-8">Admin Panel</h2>
    <nav className="flex-1">
      {[
        { tab: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
        { tab: "products", label: "Products", icon: <FaBox /> },
        { tab: "category", label: "Category", icon: <FaBook /> },
        { tab: "orders", label: "Orders", icon: <FaClipboardList /> },
        { tab: "users", label: "Users", icon: <FaUsers /> },
      ].map(({ tab, label, icon }) => (
        <button
          key={tab}
          className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 mb-2 ${
            selectedTab === tab
              ? "bg-blue-700 text-white"
              : "hover:bg-blue-700 hover:text-white"
          }`}
          onClick={() => setSelectedTab(tab)}
        >
          <span className="mr-4">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  </div>
);

export default Sidebar;
