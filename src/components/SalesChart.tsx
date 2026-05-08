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
  Area,
  AreaChart,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { MonthlySales } from "@/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function SalesTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-heavy rounded-xl p-3 shadow-2xl border border-white/15">
      <p className="text-white font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-white font-semibold ml-auto pl-2">
            {entry.name === "จำนวน"
              ? `${entry.value.toLocaleString("th-TH")} รายการ`
              : `฿${entry.value.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="glass-heavy rounded-xl p-3 shadow-2xl border border-white/15">
      <p className="text-white font-semibold text-sm">{entry.name}</p>
      <p className="text-slate-300 text-xs mt-1">
        ฿{(entry.value ?? 0).toLocaleString("th-TH")}
      </p>
    </div>
  );
}

const CHART_COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#6366f1",
  "#14b8a6", "#f97316", "#84cc16", "#a855f7",
];

interface SalesChartProps {
  data: MonthlySales[];
  selectedMonth: string | null;
}

function yTickFormatter(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export function SalesBarChart({ data, selectedMonth }: SalesChartProps) {
  const filtered = data.filter((m) => m.monthIndex > 0);

  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
        ยอดขายรายเดือน
        <span className="ml-auto text-slate-500 text-xs font-normal">หน่วย: บาท</span>
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <defs>
            {filtered.map((_, i) => (
              <linearGradient key={i} id={`bG${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.95} />
                <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Sarabun, sans-serif" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Sarabun, sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter}
            width={44}
          />
          <Tooltip content={<SalesTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="total" name="ยอดขาย" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {filtered.map((entry, i) => (
              <Cell
                key={`bc-${i}`}
                fill={`url(#bG${i})`}
                stroke={selectedMonth && entry.month === selectedMonth ? "rgba(255,255,255,0.5)" : "transparent"}
                strokeWidth={1.5}
                opacity={selectedMonth && entry.month !== selectedMonth ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesTrendChart({ data }: { data: MonthlySales[] }) {
  const filtered = data.filter((m) => m.monthIndex > 0);

  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
        แนวโน้มยอดขาย & จำนวนรายการ
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="aGsales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="aGcount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Sarabun, sans-serif" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="sales"
            orientation="left"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter}
            width={44}
          />
          <YAxis
            yAxisId="count"
            orientation="right"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<SalesTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ color: "#64748b", fontSize: "11px", paddingTop: "8px" }}
          />
          <Area
            yAxisId="sales"
            type="monotone"
            dataKey="total"
            name="ยอดขาย"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#aGsales)"
            dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }}
          />
          <Area
            yAxisId="count"
            type="monotone"
            dataKey="count"
            name="จำนวน"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#aGcount)"
            dot={{ fill: "#06b6d4", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#06b6d4", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyShareChart({ data }: { data: MonthlySales[] }) {
  const filtered = data.filter((m) => m.monthIndex > 0 && m.total > 0);
  if (filtered.length === 0) return null;

  const total = filtered.reduce((s, m) => s + m.total, 0);

  const pieData = filtered.map((m, i) => ({
    name: m.month,
    value: m.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
    pct: total > 0 ? ((m.total / total) * 100).toFixed(1) : "0",
  }));

  return (
    <div className="glass-light rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
        สัดส่วนยอดขายรายเดือน
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: string, entry: any) => (
              <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                {value} <span style={{ color: "#cbd5e1" }}>{(entry.payload as { pct?: string })?.pct}%</span>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
