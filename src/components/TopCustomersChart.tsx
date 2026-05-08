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
} from "recharts";
import type { CustomerSales } from "@/types";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 shadow-xl border border-white/10">
      <p className="text-white font-semibold text-sm mb-1">{label}</p>
      <p className="text-blue-300 text-xs">
        ฿{(payload[0].value ?? 0).toLocaleString("th-TH")}
      </p>
    </div>
  );
}

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#6366f1",
  "#14b8a6", "#f97316",
];

interface Props {
  data: CustomerSales[];
}

export function TopCustomersChart({ data }: Props) {
  const top10 = data.slice(0, 10);

  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
        Top 10 ยอดสูงสุด
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
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
            type="category"
            dataKey="customer"
            tick={{ fill: "#cbd5e1", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" name="ยอดขาย" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {top10.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
