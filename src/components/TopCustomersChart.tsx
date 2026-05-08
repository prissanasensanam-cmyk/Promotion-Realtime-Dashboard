"use client";

import { useMemo } from "react";
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
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-heavy rounded-xl p-3 shadow-2xl border border-white/15">
      <p className="text-white font-semibold text-sm mb-1 max-w-[200px] break-words">{label}</p>
      <p className="text-emerald-300 text-xs font-medium">
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
  const top10 = useMemo(() => data.slice(0, 10), [data]);
  const maxVal = top10[0]?.total ?? 1;

  if (top10.length === 0) {
    return (
      <div className="glass-light rounded-2xl p-5 flex items-center justify-center h-[320px]">
        <p className="text-slate-500 text-sm">ไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
        Top 10 ยอดขายสูงสุด
        <span className="ml-auto text-slate-500 text-xs font-normal">{top10.length} รายการ</span>
      </h3>

      {/* Responsive chart for wider viewports */}
      <div className="hidden sm:block">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
              }
            />
            <YAxis
              type="category"
              dataKey="customer"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={90}
              tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="total" name="ยอดขาย" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {top10.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={1 - i * 0.06} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compact list for small screens and as fallback */}
      <div className="sm:hidden space-y-2">
        {top10.map((entry, i) => (
          <div key={entry.customer} className="flex items-center gap-2">
            <span
              className="text-xs font-bold w-5 text-right flex-shrink-0"
              style={{ color: COLORS[i % COLORS.length] }}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-slate-300 text-xs truncate max-w-[120px]">{entry.customer}</span>
                <span className="text-white text-xs font-semibold ml-2 flex-shrink-0">
                  ฿{entry.total >= 1_000_000 ? `${(entry.total / 1_000_000).toFixed(2)}M` : entry.total.toLocaleString("th-TH")}
                </span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(entry.total / maxVal) * 100}%`, background: COLORS[i % COLORS.length] }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
