import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

interface RoomUsageChartProps {
  popularRoomsData: any[];
  roomUsageData: any[];
}

export const RoomUsageChart: React.FC<RoomUsageChartProps> = ({
  popularRoomsData,
  roomUsageData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Popular Rooms Chart */}
      <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            สถิติความนิยมการจองแยกตามห้อง
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularRoomsData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} 
                  width={160} 
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="จำนวนการจอง" fill="#6366f1" radius={[0, 8, 8, 0]} maxBarSize={16}>
                  {popularRoomsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Room Usage Proportion Pie Chart */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            สัดส่วนการใช้งานแต่ละห้อง
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[350px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomUsageData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roomUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
