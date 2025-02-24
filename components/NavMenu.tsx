"use client";

import Link from "next/link";

const NavMenu: React.FC = () => {
  return (
    <nav className="bg-gray-100 dark:bg-gray-800 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex justify-center space-x-6 py-3">
          <li>
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Sản phẩm
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Giới thiệu
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Liên hệ
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavMenu;
