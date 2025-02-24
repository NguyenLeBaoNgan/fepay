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
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpCircle, ShoppingCart, Users } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import axiosClient from "@/utils/axiosClient";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
        const formattedData = response.data.monthly_revenue.map(
          (item: any) => ({
            month: monthNames[item.month - 1],
            total: item.total,
          })
        );
        setMonthlyRevenue(formattedData);

        const currentMonthData = response.data.monthly_transactions.find(
          (item: any) => item.month === currentMonth + 1
        );
        setCurrentMonthStats(currentMonthData || null);
      })
      .catch((error) =>
        console.error("Error fetching monthly revenue:", error)
      );
  }, [year]);

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
          const monthIndex = date.getMonth();
          monthlyData[monthIndex].amount_in += parseFloat(item.amount_in) || 0;
          monthlyData[monthIndex].amount_out +=
            parseFloat(item.amount_out) || 0;
        });

        setMonthlyTransactions(monthlyData);
      })
      .catch((error) =>
        console.error("Error fetching transaction data:", error)
      );
  }, [year]);

  return (
    <>
      {" "}
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Tổng quan</h1>

          {/* Thẻ thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Tổng Sản phẩm"
              count={products?.length}
              color="blue"
              icon={ShoppingCart}
            />
            <StatCard
              title="Total Orders"
              count={orders?.length}
              color="green"
              icon={ArrowUpCircle}
            />
            <StatCard
              title="Total Users"
              count={users?.length}
              color="purple"
              icon={Users}
            />
          </div>

          {/* Thẻ thông tin tháng hiện tại */}
          {currentMonthStats && (
            <Card className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">
                  📅 Tổng thu tháng {monthNames[currentMonth]}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <p>
                  <strong>Tổng thu:</strong>{" "}
                  <span className="text-green-600 font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      currentMonthStats.amount_in - currentMonthStats.amount_out
                    )}
                  </span>
                </p>
                <p>
                  <strong>Giao dịch:</strong>{" "}
                  {currentMonthStats.total_transactions || 0}
                </p>
                <p>
                  <strong>Tiền vào:</strong> {currentMonthStats.count_in || 0}
                </p>
                <p>
                  <strong>Tiền ra:</strong> {currentMonthStats.count_out || 0}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Biểu đồ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg rounded-lg p-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">
                  📈 Doanh thu ({year})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#4f46e5"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg rounded-lg p-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">
                  💰 Tiền vào / Tiền ra ({year})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount_in" fill="#34d399" name="Tiền Vào" />
                    <Bar dataKey="amount_out" fill="#f87171" name="Tiền Ra" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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
}> = ({ title, count, color, icon: Icon }) => (
  <Card className="bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 hover:scale-105 transition">
    <Icon className={`text-${color}-500`} size={32} />
    <div>
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
    </div>
  </Card>
);

export default DashboardOverview;
