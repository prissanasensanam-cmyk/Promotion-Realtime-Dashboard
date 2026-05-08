"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { SaleRecord, ColumnDef } from "@/types";
import clsx from "clsx";

const PAGE_SIZE = 15;

interface DataTableProps {
  rows: SaleRecord[];
  columns: ColumnDef[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedMonth: string | null;
}

function formatCellValue(value: string | number | null, type: string): string {
  if (value === null || value === undefined || value === "") return "-";
  if (type === "number") {
    const num = parseFloat(String(value));
    if (!isNaN(num)) {
      return num.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  }
  return String(value);
}

export function DataTable({ rows, columns, searchQuery, onSearchChange, selectedMonth }: DataTableProps) {
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((row) => {
      if (q) {
        const matches = Object.values(row).some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [rows, searchQuery]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      const an = parseFloat(String(av));
      const bn = parseFloat(String(bv));
      if (!isNaN(an) && !isNaN(bn)) {
        return sortDir === "asc" ? an - bn : bn - an;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv), "th")
        : String(bv).localeCompare(String(av), "th");
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(label: string) {
    if (sortCol === label) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(label);
      setSortDir("desc");
    }
    setPage(1);
  }

  return (
    <div className="glass-light rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-white font-semibold text-base flex items-center gap-2">
          <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
          รายการข้อมูล
          <span className="ml-1 text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
            {filtered.length} รายการ
          </span>
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-colors w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2.5 px-3 text-slate-400 font-medium text-xs w-10">#</th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="text-left py-2.5 px-3 text-slate-400 font-medium text-xs cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  onClick={() => handleSort(col.label)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortCol === col.label && (
                      <span className="text-blue-400">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-12 text-slate-500"
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-2.5 px-3 text-slate-500 text-xs">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="py-2.5 px-3 text-slate-200 whitespace-nowrap">
                      {col.type === "number" && row[col.label] !== null ? (
                        <span className="text-emerald-400 font-medium">
                          {formatCellValue(row[col.label], col.type)}
                        </span>
                      ) : (
                        formatCellValue(row[col.label], col.type)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <span className="text-xs text-slate-500">
            หน้า {page} / {totalPages} ({sorted.length} รายการ)
          </span>
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => setPage(1)} disabled={page === 1}>
              <ChevronsLeft className="w-3.5 h-3.5" />
            </PageBtn>
            <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </PageBtn>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <PageBtn key={p} onClick={() => setPage(p)} active={p === page}>
                  {p}
                </PageBtn>
              );
            })}
            <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              <ChevronRight className="w-3.5 h-3.5" />
            </PageBtn>
            <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>
              <ChevronsRight className="w-3.5 h-3.5" />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-7 h-7 rounded-lg text-xs font-medium transition-all flex items-center justify-center",
        active
          ? "bg-blue-600 text-white"
          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}
