import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface DashboardOverviewProps {
  products: { name: string; quantity: number }[];
  orders: any[];
  users: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  orders,
  users,
}) => (
  <div>
    <>
    <Header/>
   <br/>
    <CardTitle className="text-3xl font-semibold mb-6"> {/* Removed text-gray-800 because we want to rely on themes */}
      Dashboard
    </CardTitle>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Using Shadcn Card for Stat Cards */}
      <StatCard title="Total Products" count={products?.length} color="blue" />
      <StatCard title="Total Orders" count={orders?.length} color="green" />
      <StatCard title="Total Users" count={users?.length} color="purple" />
    </div>
    {/* <div className="mt-8">
      <CardTitle as="h2" className="text-2xl font-semibold mb-4"> 
        Product Distribution
      </CardTitle>
      <Card>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={products.map((p) => ({
                  name: p.name,
                  value: p.quantity,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
              >
                {products.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div> */}
    <br/>
    <Footer/>
    </>
  </div>
);

const StatCard: React.FC<{ title: string; count: number; color: string }> = ({
  title,
  count,
  color,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <p className="text-2xl font-semibold">{count}</p> {/* Keep text style and rely on Shadcn theme */}
      <Badge className={cn(`border-${color}-500 text-${color}-500`)}></Badge> {/* Added cn utility */}
    </CardHeader>
  </Card>
);

export default DashboardOverview;
