"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SaleRecord, ColumnDef } from "@/types";
import clsx from "clsx";

const PAGE_SIZE = 15;
// Hidden system columns (added by parseGviz for internal use)
const HIDDEN_COLS = new Set(["_monthIndex"]);

interface DataTableProps {
  rows: SaleRecord[];
  columns: ColumnDef[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedMonth: string | null;
}

function formatCellValue(value: string | number | null, type: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "number") {
    const num = parseFloat(String(value));
    if (!isNaN(num)) {
      return num.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  }
  return String(value);
}

function isNumberLike(value: string | number | null): boolean {
  if (value === null || value === "") return false;
  const n = parseFloat(String(value).replace(/,/g, ""));
  return !isNaN(n) && n > 0;
}

export function DataTable({ rows, columns, searchQuery, onSearchChange, selectedMonth }: DataTableProps) {
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const visibleColumns = useMemo(
    () => columns.filter((c) => !HIDDEN_COLS.has(c.label)),
    [columns]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.entries(row).some(([k, v]) => !HIDDEN_COLS.has(k) && String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      const an = parseFloat(String(av).replace(/,/g, ""));
      const bn = parseFloat(String(bv).replace(/,/g, ""));
      if (!isNaN(an) && !isNaN(bn)) return sortDir === "asc" ? an - bn : bn - an;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv), "th")
        : String(bv).localeCompare(String(av), "th");
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSort(label: string) {
    if (sortCol === label) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(label);
      setSortDir("desc");
    }
    setPage(1);
  }

  function handleSearch(v: string) {
    onSearchChange(v);
    setPage(1);
  }

  // Page numbers window
  const pageNums = useMemo(() => {
    const w = 5;
    const half = Math.floor(w / 2);
    let start = Math.max(1, safePage - half);
    const end = Math.min(totalPages, start + w - 1);
    start = Math.max(1, end - w + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  return (
    <div className="glass-light rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
            รายการข้อมูล
          </h3>
          <span className="text-xs bg-white/8 text-slate-400 px-2 py-0.5 rounded-full border border-white/8">
            {filtered.length.toLocaleString("th-TH")} รายการ
          </span>
          {selectedMonth && (
            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
              {selectedMonth}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left py-2.5 px-3 text-slate-500 font-medium text-xs w-9">#</th>
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className="text-left py-2.5 px-3 text-slate-500 font-medium text-xs cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap select-none"
                  onClick={() => handleSort(col.label)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortCol === col.label ? (
                      sortDir === "asc"
                        ? <ArrowUp className="w-3 h-3 text-blue-400" />
                        : <ArrowDown className="w-3 h-3 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="text-center py-16 text-slate-600">
                  {searchQuery ? `ไม่พบ "${searchQuery}"` : "ไม่มีข้อมูล"}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/4 hover:bg-white/4 transition-colors"
                >
                  <td className="py-2.5 px-3 text-slate-600 text-xs">
                    {(safePage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  {visibleColumns.map((col) => {
                    const val = row[col.label];
                    const isNum = col.type === "number" || isNumberLike(val);
                    return (
                      <td key={col.id} className="py-2.5 px-3 whitespace-nowrap">
                        {isNum && val !== null ? (
                          <span className="text-emerald-400 font-medium text-xs">
                            {formatCellValue(val, "number")}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">
                            {formatCellValue(val, col.type)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/8 gap-2 flex-wrap">
          <span className="text-xs text-slate-600">
            หน้า {safePage}/{totalPages} · {sorted.length.toLocaleString("th-TH")} รายการ
          </span>
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => setPage(1)} disabled={safePage === 1} title="หน้าแรก">
              <ChevronsLeft className="w-3.5 h-3.5" />
            </PageBtn>
            <PageBtn onClick={() => setPage((p) => p - 1)} disabled={safePage === 1} title="ก่อนหน้า">
              <ChevronLeft className="w-3.5 h-3.5" />
            </PageBtn>
            {pageNums.map((p) => (
              <PageBtn key={p} onClick={() => setPage(p)} active={p === safePage}>
                {p}
              </PageBtn>
            ))}
            <PageBtn onClick={() => setPage((p) => p + 1)} disabled={safePage === totalPages} title="ถัดไป">
              <ChevronRight className="w-3.5 h-3.5" />
            </PageBtn>
            <PageBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages} title="หน้าสุดท้าย">
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
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "w-7 h-7 rounded-lg text-xs font-medium transition-all flex items-center justify-center flex-shrink-0",
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
          : "bg-white/5 text-slate-400 border border-white/8 hover:bg-white/10 hover:text-white hover:border-white/15 disabled:opacity-25 disabled:cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}
