"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import type { MonthlySales } from "@/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 shadow-xl border border-white/10">
      <p className="text-white font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-white font-medium">
            {typeof entry.value === "number"
              ? entry.name === "จำนวน"
                ? `${entry.value} รายการ`
                : `฿${entry.value.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
  "#84cc16", "#a855f7",
];

interface SalesChartProps {
  data: MonthlySales[];
  selectedMonth: string | null;
}

export function SalesBarChart({ data, selectedMonth }: SalesChartProps) {
  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
        ยอดขายรายเดือน (บาท)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1_000
                ? `${(v / 1_000).toFixed(0)}K`
                : String(v)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" name="ยอดขาย" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={`url(#barGrad${i})`}
                stroke={
                  selectedMonth && entry.month === selectedMonth
                    ? "#fff"
                    : "transparent"
                }
                strokeWidth={2}
                opacity={
                  selectedMonth && entry.month !== selectedMonth ? 0.35 : 1
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesTrendChart({ data }: { data: MonthlySales[] }) {
  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-purple-500 rounded-full" />
        แนวโน้มยอดขาย & จำนวนรายการ
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="sales"
            orientation="left"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1_000
                ? `${(v / 1_000).toFixed(0)}K`
                : String(v)
            }
          />
          <YAxis
            yAxisId="count"
            orientation="right"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: "12px", paddingTop: "8px" }}
          />
          <Area
            yAxisId="sales"
            type="monotone"
            dataKey="total"
            name="ยอดขาย"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#salesGrad)"
            dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "#8b5cf6" }}
          />
          <Area
            yAxisId="count"
            type="monotone"
            dataKey="count"
            name="จำนวน"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#countGrad)"
            dot={{ fill: "#06b6d4", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#06b6d4" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
