import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import axiosClient from "@/utils/axiosClient";

const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
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

  useEffect(() => {
    // Fetch Monthly Revenue Data from the API
    axiosClient
      .get(`/api/revenue`, { params: { year } })
      .then((response) => {
        const formattedData = response.data.monthly_revenue.map((item: any) => ({
          month: monthNames[item.month - 1], 
          total: item.total
        }));
        setMonthlyRevenue(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching monthly revenue:", error);
      });
  }, [year]);

  useEffect(() => {
    // Fetch Transaction Data for Amount In/Out
    axiosClient
      .get(`/api/transactions`, { params: { year } })
      .then((response) => {
        const monthlyData = Array(12).fill(null).map((_, index) => ({
          month: monthNames[index],
          amount_in: 0,
          amount_out: 0,
        }));

        response.data.forEach((item: any) => {
          const date = new Date(item.transaction_date);
          const monthIndex = date.getMonth();
          monthlyData[monthIndex].amount_in += parseFloat(item.amount_in) || 0;
          monthlyData[monthIndex].amount_out += parseFloat(item.amount_out) || 0;
        });

        setMonthlyTransactions(monthlyData);
      })
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
      });
  }, [year]);

  return (
    <div>
      <Header />
      <br />
      <CardTitle className="text-3xl font-semibold mb-6">Tổng quan</CardTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Cards */}
        <StatCard title="Tổng Sản phẩm" count={products?.length} color="blue" />
        <StatCard title="Total Orders" count={orders?.length} color="green" />
        <StatCard title="Total Users" count={users?.length} color="purple" />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="mt-8">
        <CardTitle className="text-2xl font-semibold mb-4">
          THỐNG KÊ DOANH THU ({year})
        </CardTitle>
        <Card>
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
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Transaction Statistics */}
      <div className="mt-8">
        <CardTitle className="text-2xl font-semibold mb-4">
          TIỀN VÀO / RA ({year})
        </CardTitle>
        <Card>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTransactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount_in" fill="#4caf50" name="Tiền Vào" />
                <Bar dataKey="amount_out" fill="#f44336" name="Tiền Ra" />
              </BarChart>
            </ResponsiveContainer>
            
          </CardContent>
          <div className="mt-4 text-sm text-gray-600">
          <p><span className="text-green-600 font-semibold">Tiền Vào:</span> Tổng số tiền nhận được trong tháng.</p>
          <p><span className="text-red-600 font-semibold">Tiền Ra:</span> Tổng số tiền đã chi trong tháng.</p>
        </div>
        </Card>
      </div>

      <br />
      <Footer />
    </div>
  );
};

const StatCard: React.FC<{ title: string; count: number; color: string }> = ({
  title,
  count,
  color,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <p className="text-2xl font-semibold">{count}</p>
      <Badge className={cn(`border-${color}-500 text-${color}-500`)} />
    </CardHeader>
  </Card>
);

export default DashboardOverview;
