"use client";

import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: { date: string; total: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? "#888" : "#888888"} 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis
          stroke={isDark ? "#888" : "#888888"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}€`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: isDark ? '#111' : '#fff', border: '1px solid #333' }}
          formatter={(value: any) => [`${value} €`, "Chiffre d'affaires"]}
        />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "hsl(var(--primary))" }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface TopProductsChartProps {
  data: { name: string; quantity: number }[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? "#333" : "#eee"} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          fontSize={12} 
          stroke={isDark ? "#888" : "#888888"}
        />
        <Tooltip
          cursor={{ fill: isDark ? '#222' : '#f5f5f5' }}
          contentStyle={{ backgroundColor: isDark ? '#111' : '#fff', borderRadius: '8px' }}
          formatter={(value: any) => [value, "Unités vendues"]}
        />
        <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface BoutiqueSplitChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b'];

export function BoutiqueSplitChart({ data }: BoutiqueSplitChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
           formatter={(value: any) => [formatCurrency(Number(value)), "C.A."]}
           contentStyle={{ backgroundColor: isDark ? '#111' : '#fff', borderRadius: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface SparkAreaChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

export function SparkAreaChart({ data, labels, height = 200 }: SparkAreaChartProps) {
  const max = Math.max(...data, 100);
  
  const generatePath = (values: number[], width: number, h: number) => {
    if (values.length < 2) return `M 0,${h} L ${width},${h}`;
    const step = width / (values.length - 1);
    const points = values.map((v, i) => ({
      x: i * step,
      y: h - (v / max) * h,
    }));

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const cx = (p1.x + p2.x) / 2;
        path += ` C ${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`;
      }
      return path;
    };
  
    const generateAreaPath = (values: number[], width: number, h: number) => {
      const path = generatePath(values, width, h);
      return `${path} L ${width},${h} L 0,${h} Z`;
    };
  
    return (
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={generateAreaPath(data, 800, 200)}
            fill="url(#sparkGradient)"
            className="transition-all duration-1000"
          />
          <path
            d={generatePath(data, 800, 200)}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground/30 mt-4 px-2 tracking-tighter">
          <span>{labels[0]}</span>
          <span />
          <span>{labels[labels.length - 1]}</span>
        </div>
      </div>
    );
  }

export function CategoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={8}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-80 transition-opacity cursor-pointer outline-none" 
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [`${value} ventes`, "Volume"]}
          contentStyle={{ 
            backgroundColor: isDark ? '#111' : '#fff', 
            borderRadius: '1.5rem',
            border: 'none',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AreaRevenueChart({ data }: { data: { date: string; total: number }[] }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
  
    return (
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
          <XAxis 
            dataKey="date" 
            stroke={isDark ? "#555" : "#888"} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke={isDark ? "#555" : "#888"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}€`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{ 
                backgroundColor: isDark ? '#111' : '#fff', 
                borderRadius: '1.5rem',
                border: 'none',
                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
            }}
            formatter={(value: any) => [formatCurrency(Number(value)), "Chiffre d'affaires"]}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(var(--primary))" 
            strokeWidth={4} 
            dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} 
            activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "#fff" }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
