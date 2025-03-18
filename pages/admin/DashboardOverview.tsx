import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ShoppingCart, Users } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import axiosClient from "@/utils/axiosClient";
import TopSellingProducts from "../topselling";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface DashboardOverviewProps {
  products: { name: string; quantity: number }[];
  orders: any[];
  users: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  orders,
  users,
}) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState<any[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [currentMonthStats, setCurrentMonthStats] = useState<any>(null);
  const currentMonth = new Date().getMonth();

  useEffect(() => {
    axiosClient
      .get(`/api/revenue`, { params: { year } })
      .then((response) => {
        const formattedData = Array(12)
          .fill(null)
          .map((_, index) => ({
            month: monthNames[index],
            total: 0,
          }));

        response.data.monthly_revenue.forEach((item: any) => {
          const monthIndex = item.month - 1;
          formattedData[monthIndex].total = item.total;
        });

        setMonthlyRevenue(formattedData);

        const currentMonthData = response.data.monthly_transactions.find(
          (item: any) => item.month === currentMonth + 1
        );
        setCurrentMonthStats(currentMonthData || null);
      })
      .catch((error) =>
        console.error("Error fetching monthly revenue:", error)
      );
  }, [year, currentMonth]);

  useEffect(() => {
    axiosClient
      .get(`/api/transactions`, { params: { year } })
      .then((response) => {
        const monthlyData = Array(12)
          .fill(null)
          .map((_, index) => ({
            month: monthNames[index],
            amount_in: 0,
            amount_out: 0,
          }));

        response.data.forEach((item: any) => {
          const date = new Date(item.transaction_date);
          const transactionYear = date.getFullYear();
          const monthIndex = date.getMonth();

          if (transactionYear === year) {
            monthlyData[monthIndex].amount_in +=
              parseFloat(item.amount_in) || 0;
            monthlyData[monthIndex].amount_out +=
              parseFloat(item.amount_out) || 0;
          }
        });

        setMonthlyTransactions(monthlyData);
      })
      .catch((error) =>
        console.error("Error fetching transaction data:", error)
      );
  }, [year]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800:text-white tracking-tight">
              Dashboard Overview
            </h1>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:bg-gray-50"
            >
              {Array.from({ length: 2 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Sản phẩm"
              count={products?.length}
              color="indigo"
              icon={ShoppingCart}
              year={year}
            />
            <StatCard
              title="Đơn hàng"
              count={orders?.length}
              color="emerald"
              icon={ArrowUpCircle}
              year={year}
            />
            <StatCard
              title="Người dùng"
              count={users?.length}
              color="violet"
              icon={Users}
              year={year}
            />
          </div>
          {currentMonthStats && (
            <Card className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-900">
                  Tổng quan tháng {monthNames[currentMonth]}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>Tổng thu</p>
                  <p className="text-xl font-semibold text-emerald-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      currentMonthStats.amount_in - currentMonthStats.amount_out
                    )}
                  </p>
                </div>
                <div>
                  <p>Giao dịch</p>
                  <p className="text-xl font-semibold">
                    {currentMonthStats.total_transactions || 0}
                  </p>
                </div>
                <div>
                  <p>Tiền vào</p>
                  <p className="text-lg font-medium text-emerald-500">
                    {currentMonthStats.count_in || 0}
                  </p>
                </div>
                <div>
                  <p>Tiền ra</p>
                  <p className="text-lg font-medium text-red-500">
                    {currentMonthStats.count_out || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-rows-2 gap-8">
              <Card className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Doanh thu {year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                      <XAxis dataKey="month" stroke="#6b7280" tickMargin={10} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#6366f1" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Tiền vào / Tiền ra {year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyTransactions}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                      <XAxis dataKey="month" stroke="#6b7280" tickMargin={10} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="amount_in"
                        fill="#10b981"
                        name="Tiền Vào"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="amount_out"
                        fill="#ef4444"
                        name="Tiền Ra"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 row-span-2">
              <TopSellingProducts />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

const StatCard: React.FC<{
  title: string;
  count: number;
  color: string;
  icon: any;
  year: number;
}> = ({ title, count, color, icon: Icon }) => (
  <Card
    className={cn(
      "bg-white rounded-xl shadow-md p-6 border border-gray-100",
      "hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`text-${color}-600 w-8 h-8`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  </Card>
);

export default DashboardOverview;
