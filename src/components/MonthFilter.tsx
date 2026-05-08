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
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wide flex-shrink-0">เดือน:</span>

      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
          selectedMonth === null
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
            : "bg-white/5 text-slate-400 border border-white/8 hover:bg-white/10 hover:text-white hover:border-white/15"
        )}
      >
        ทุกเดือน
      </button>

      {validMonths.map((m) => {
        const isSelected = selectedMonth === m.month;
        return (
          <button
            key={m.month}
            onClick={() => onSelect(isSelected ? null : m.month)}
            title={`${m.month}: ${m.count} รายการ`}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
              isSelected
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-white/5 text-slate-400 border border-white/8 hover:bg-white/10 hover:text-white hover:border-white/15"
            )}
          >
            {m.month}
            {isSelected && (
              <span className="ml-1.5 opacity-70 font-normal">{m.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
