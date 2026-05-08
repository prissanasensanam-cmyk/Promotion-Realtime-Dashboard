"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Users,
  BarChart2,
  Award,
  RefreshCw,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { useGoogleSheet } from "@/hooks/useGoogleSheet";
import { KPICard } from "./KPICard";
import { SalesBarChart, SalesTrendChart } from "./SalesChart";
import { TopCustomersChart } from "./TopCustomersChart";
import { DataTable } from "./DataTable";
import { MonthFilter } from "./MonthFilter";

function formatBaht(v: number): string {
  if (v >= 1_000_000) return `฿${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `฿${(v / 1_000).toFixed(1)}K`;
  return `฿${v.toLocaleString("th-TH")}`;
}

export function Dashboard() {
  const { data, loading, error, lastUpdated, refresh } = useGoogleSheet();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!selectedMonth) return data;

    const filteredRows = data.allRecords.filter((row) => {
      return Object.values(row).some((v) =>
        String(v ?? "").includes(selectedMonth)
      );
    });

    const filteredMonthly = data.monthlySales.filter(
      (m) => m.month === selectedMonth
    );

    const filteredCustomers = data.customerSales.filter((c) =>
      c.months.includes(selectedMonth)
    );

    const filteredTotal = filteredRows.reduce((sum, row) => {
      const numVals = Object.values(row)
        .map((v) => parseFloat(String(v ?? "0").replace(/,/g, "")))
        .filter((n) => !isNaN(n) && n > 0);
      return sum + (numVals[0] ?? 0);
    }, 0);

    return {
      ...data,
      allRecords: filteredRows,
      monthlySales: filteredMonthly,
      customerSales: filteredCustomers,
      totalSales: filteredTotal,
      totalRecords: filteredRows.length,
      avgPerRecord: filteredRows.length > 0 ? filteredTotal / filteredRows.length : 0,
    };
  }, [data, selectedMonth]);

  const displayData = filteredData ?? data;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">กำลังโหลดข้อมูลจาก Google Sheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const lines = error.split("\n");
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-light rounded-2xl p-8 max-w-lg w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-3">ไม่สามารถโหลดข้อมูลได้</h2>
          <div className="text-left bg-black/30 rounded-xl p-4 mb-6 space-y-1">
            {lines.map((line, i) => (
              <p key={i} className={i === 0 ? "text-red-300 text-sm font-medium" : "text-slate-400 text-sm"}>
                {line}
              </p>
            ))}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-amber-400 text-xs font-semibold mb-1">วิธีแก้ไข:</p>
            <ol className="text-slate-300 text-xs space-y-1 list-decimal list-inside">
              <li>เปิด Google Sheet ของคุณ</li>
              <li>คลิก <span className="text-white font-medium">Share</span> (มุมขวาบน)</li>
              <li>เลือก <span className="text-white font-medium">Anyone with the link</span></li>
              <li>ตั้งเป็น <span className="text-white font-medium">Viewer</span> แล้วบันทึก</li>
            </ol>
          </div>
          <button
            onClick={refresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!displayData) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                Dashboard ยอดขาย
              </h1>
              <p className="text-slate-400 text-xs">เงินติดล้อ · ปี 2569</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-green-400 text-xs font-medium">Live · 30s</span>
            </div>

            {lastUpdated && (
              <span className="text-slate-500 text-xs hidden md:block">
                อัพเดต{" "}
                {lastUpdated.toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}

            <button
              onClick={refresh}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Month Filter */}
        {data && data.monthlySales.length > 0 && (
          <div className="glass rounded-2xl px-4 py-3">
            <MonthFilter
              months={data.monthlySales}
              selectedMonth={selectedMonth}
              onSelect={setSelectedMonth}
            />
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="ยอดขายรวม"
            value={formatBaht(displayData.totalSales)}
            subtitle={selectedMonth ? `เดือน ${selectedMonth}` : "ทุกเดือน"}
            icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          />
          <KPICard
            title="จำนวนรายการ"
            value={displayData.totalRecords.toLocaleString("th-TH")}
            subtitle="รายการทั้งหมด"
            icon={<BarChart2 className="w-5 h-5 text-purple-400" />}
            gradient="bg-gradient-to-br from-purple-600 to-purple-800"
          />
          <KPICard
            title="เฉลี่ยต่อรายการ"
            value={formatBaht(displayData.avgPerRecord)}
            subtitle="ค่าเฉลี่ย"
            icon={<Wifi className="w-5 h-5 text-cyan-400" />}
            gradient="bg-gradient-to-br from-cyan-600 to-cyan-800"
          />
          <KPICard
            title="ยอดนำ"
            value={displayData.topCustomer.length > 16 ? displayData.topCustomer.slice(0, 16) + "…" : displayData.topCustomer}
            subtitle={`เดือนสูงสุด: ${displayData.topMonth}`}
            icon={<Award className="w-5 h-5 text-amber-400" />}
            gradient="bg-gradient-to-br from-amber-600 to-orange-700"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SalesBarChart
            data={displayData.monthlySales}
            selectedMonth={selectedMonth}
          />
          <SalesTrendChart data={displayData.monthlySales} />
        </div>

        {/* Charts Row 2 + Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1">
            <TopCustomersChart data={displayData.customerSales} />
          </div>
          <div className="xl:col-span-2">
            <DataTable
              rows={displayData.allRecords}
              columns={displayData.columns}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-white/5">
          <p className="text-slate-600 text-xs">
            ข้อมูลจาก Google Sheet · อัพเดตอัตโนมัติทุก 30 วินาที ·{" "}
            {displayData.totalRecords} รายการ
          </p>
        </footer>
      </main>
    </div>
  );
}
