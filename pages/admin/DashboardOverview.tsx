import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import axios from "axios";

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
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    // Fetch Monthly Revenue Data from the API
    axios
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

  return (
    <div>
      <Header />
      <br />
      <CardTitle className="text-3xl font-semibold mb-6">Dashboard</CardTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Cards */}
        <StatCard title="Total Products" count={products?.length} color="blue" />
        <StatCard title="Total Orders" count={orders?.length} color="green" />
        <StatCard title="Total Users" count={users?.length} color="purple" />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="mt-8">
        <CardTitle className="text-2xl font-semibold mb-4">
          Monthly Revenue ({year})
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
