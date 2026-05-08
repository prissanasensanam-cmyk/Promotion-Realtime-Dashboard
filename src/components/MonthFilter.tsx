"use client";

import clsx from "clsx";
import type { MonthlySales } from "@/types";

interface MonthFilterProps {
  months: MonthlySales[];
  selectedMonth: string | null;
  onSelect: (month: string | null) => void;
}

export function MonthFilter({ months, selectedMonth, onSelect }: MonthFilterProps) {
  const validMonths = months.filter((m) => m.monthIndex > 0);

  if (validMonths.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-400 text-xs font-medium">กรอง:</span>
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
          selectedMonth === null
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
        )}
      >
        ทุกเดือน
      </button>
      {validMonths.map((m) => (
        <button
          key={m.month}
          onClick={() => onSelect(selectedMonth === m.month ? null : m.month)}
          className={clsx(
            "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
            selectedMonth === m.month
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {m.month}
        </button>
      ))}
    </div>
  );
}
