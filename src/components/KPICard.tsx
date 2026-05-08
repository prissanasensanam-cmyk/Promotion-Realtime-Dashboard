"use client";

import { type ReactNode } from "react";
import clsx from "clsx";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  gradient: string;
  trend?: { value: string; positive: boolean };
}

export function KPICard({ title, value, subtitle, icon, gradient, trend }: KPICardProps) {
  return (
    <div className="glass-light rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
      <div
        className={clsx(
          "absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity",
          gradient
        )}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={clsx("p-2.5 rounded-xl", gradient, "bg-opacity-20")}>
            {icon}
          </div>
          {trend && (
            <span
              className={clsx(
                "text-xs font-semibold px-2 py-1 rounded-full",
                trend.positive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
