import React from "react";
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaBehance,
  FaStore,
} from "react-icons/fa";
import { cn } from "@/lib/utils"; // Assuming you have a utils file with cn (classnames) function
import { Button } from "@/components/ui/button"; // Assuming you have Shadcn button component

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
    { tab: "account", label: "Accounts", icon: FaStore },
  ];

  return (
    <div className="flex flex-col w-64 p-6 h-full bg-muted text-muted-foreground"> {/* Using Shadcn's muted colors */}
      <h2 className="text-2xl font-semibold text-center mb-8">Admin Panel</h2>
      <nav className="flex-1">
        {menuItems.map(({ tab, label, icon }) => (
          <Button // Using Shadcn button component
            variant="ghost" // Using Shadcn's ghost variant for a cleaner look
            key={tab}
            className={cn(
              "justify-start w-full hover:bg-secondary/50", // Custom classnames, combining Shadcn's with your own
              selectedTab === tab && "bg-secondary text-secondary-foreground" // Shadcn's secondary colors for selected tab
            )}
            onClick={() => setSelectedTab(tab)}
          >
            <span className="mr-2">{React.createElement(icon)}</span> {/* Rendering the icon */}
            <span>{label}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
