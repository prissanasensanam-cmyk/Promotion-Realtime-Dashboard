"use client";

import { type ReactNode } from "react";
import clsx from "clsx";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  accentColor: string;     // tailwind bg class e.g. "bg-blue-500"
  glowClass?: string;      // e.g. "glow-blue"
  borderColor?: string;    // tailwind border class
  progress?: number;       // 0-100
  badge?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  glowClass,
  borderColor = "border-white/10",
  progress,
  badge,
}: KPICardProps) {
  return (
    <div
      className={clsx(
        "kpi-card glass-light rounded-2xl p-5 relative overflow-hidden",
        "hover:scale-[1.025] transition-all duration-200 cursor-default",
        glowClass
      )}
    >
      {/* Accent glow blob */}
      <div
        className={clsx(
          "absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20",
          accentColor
        )}
      />

      {/* Top border accent line */}
      <div className={clsx("absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60", accentColor)} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={clsx("p-2.5 rounded-xl bg-white/5 border", borderColor)}>
            {icon}
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/8 text-slate-300 border border-white/10">
              {badge}
            </span>
          )}
        </div>

        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-white leading-tight stat-value">{value}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}

        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className={clsx("h-full rounded-full relative overflow-hidden transition-all duration-700", accentColor)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              >
                <div className="absolute inset-0 progress-shimmer" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
