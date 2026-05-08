"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Users,
  BarChart2,
  Award,
  RefreshCw,
  AlertCircle,
  Database,
  Calendar,
  Star,
} from "lucide-react";
import { useGoogleSheet } from "@/hooks/useGoogleSheet";
import { KPICard } from "./KPICard";
import { SalesBarChart, SalesTrendChart, MonthlyShareChart } from "./SalesChart";
import { TopCustomersChart } from "./TopCustomersChart";
import { DataTable } from "./DataTable";
import { MonthFilter } from "./MonthFilter";
import type { DashboardStats } from "@/types";

/* ───────────────────────── helpers ───────────────────────── */

function formatBaht(v: number): string {
  if (v >= 1_000_000_000) return `฿${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `฿${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `฿${(v / 1_000).toFixed(1)}K`;
  return `฿${v.toLocaleString("th-TH")}`;
}

function applyMonthFilter(data: DashboardStats, selectedMonth: string | null): DashboardStats {
  if (!selectedMonth) return data;

  const filteredRows = data.allRecords.filter(
    (row) => row._monthIndex !== undefined &&
      data.monthlySales.find((m) => m.month === selectedMonth)?.monthIndex === row._monthIndex
  );

  const monthEntry = data.monthlySales.find((m) => m.month === selectedMonth);

  const filteredTotal = filteredRows.reduce((sum, row) => {
    const numVals = Object.entries(row)
      .filter(([k]) => k !== "_monthIndex")
      .map(([, v]) => parseFloat(String(v ?? "0").replace(/,/g, "")))
      .filter((n) => !isNaN(n) && n > 0);
    return sum + (numVals[0] ?? 0);
  }, 0);

  const uniqueCustomers = new Set(filteredRows.map((r) => String(r[data.columns[0]?.label ?? ""] ?? ""))).size;

  return {
    ...data,
    allRecords: filteredRows,
    monthlySales: monthEntry ? [monthEntry] : [],
    totalSales: filteredTotal,
    totalRecords: filteredRows.length,
    avgPerRecord: filteredRows.length > 0 ? filteredTotal / filteredRows.length : 0,
    uniqueCustomers,
  };
}

/* ───────────────────────── loading ───────────────────────── */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#070d1b] bg-grid flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: "0.8s", animationDirection: "reverse" }} />
          <Database className="absolute inset-0 m-auto w-5 h-5 text-blue-400" />
        </div>
        <p className="text-white font-semibold text-base mb-1">กำลังโหลดข้อมูล</p>
        <p className="text-slate-500 text-sm">ดึงข้อมูลจาก Google Sheet...</p>
      </div>
    </div>
  );
}

/* ───────────────────────── error ───────────────────────── */

function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  const lines = error.split("\n");
  return (
    <div className="min-h-screen bg-[#070d1b] bg-grid flex items-center justify-center p-6">
      <div className="glass-light rounded-2xl p-8 max-w-lg w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">โหลดข้อมูลไม่สำเร็จ</h2>
            <p className="text-slate-500 text-xs mt-0.5">กรุณาตรวจสอบการตั้งค่า Google Sheet</p>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 mb-5 space-y-1 border border-white/5">
          {lines.map((line, i) => (
            <p key={i} className={i === 0 ? "text-red-300 text-sm font-medium" : "text-slate-400 text-sm"}>
              {line}
            </p>
          ))}
        </div>

        <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-4 mb-5">
          <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">!</span>
            วิธีแก้ไข
          </p>
          <ol className="text-slate-300 text-xs space-y-1.5 list-none">
            {[
              "เปิด Google Sheet ของคุณ",
              <>คลิก <strong className="text-white">Share</strong> มุมขวาบน</>,
              <>เลือก <strong className="text-white">Anyone with the link</strong></>,
              <>ตั้งเป็น <strong className="text-white">Viewer</strong> แล้วบันทึก</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── countdown ring ───────────────────────── */

function CountdownRing({ seconds }: { seconds: number }) {
  const radius = 10;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - seconds / 30);
  return (
    <div className="relative w-8 h-8 flex-shrink-0" title={`อัพเดตใน ${seconds} วินาที`}>
      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle
          cx="14" cy="14" r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s linear" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-blue-400">
        {seconds}
      </span>
    </div>
  );
}

/* ───────────────────────── main dashboard ───────────────────────── */

export function Dashboard() {
  const { data, loading, error, lastUpdated, countdown, refresh } = useGoogleSheet();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const displayData = useMemo(
    () => (data ? applyMonthFilter(data, selectedMonth) : null),
    [data, selectedMonth]
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={refresh} />;
  if (!displayData || !data) return null;

  const maxSales = data.totalSales || 1;
  const progressPct = Math.min(100, (displayData.totalSales / maxSales) * 100);

  return (
    <div className="min-h-screen bg-[#070d1b] bg-grid">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#070d1b]/85 backdrop-blur-2xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <BarChart2 className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#070d1b]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                Sales Dashboard
              </h1>
              <p className="text-slate-500 text-xs">เงินติดล้อ · ปี 2569</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2.5">
            {/* Live badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/8 border border-green-500/15 rounded-full px-3 py-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-green-400 text-xs font-semibold">Live</span>
            </div>

            {/* Countdown */}
            <CountdownRing seconds={countdown} />

            {/* Last updated */}
            {lastUpdated && (
              <span className="text-slate-600 text-xs hidden lg:block">
                {lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}

            {/* Refresh btn */}
            <button
              onClick={refresh}
              className="p-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 text-slate-400 hover:text-white transition-all"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── Filter bar ── */}
        {data.monthlySales.filter((m) => m.monthIndex > 0).length > 0 && (
          <div className="glass rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
            <MonthFilter
              months={data.monthlySales}
              selectedMonth={selectedMonth}
              onSelect={setSelectedMonth}
            />
            {selectedMonth && (
              <p className="text-slate-500 text-xs">
                แสดงข้อมูลเดือน <span className="text-white font-semibold">{selectedMonth}</span>
                {" · "}{displayData.totalRecords} รายการ
              </p>
            )}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="ยอดขายรวม"
            value={formatBaht(displayData.totalSales)}
            subtitle={selectedMonth ? `เดือน ${selectedMonth}` : `ทั้งหมด ${data.monthlySales.filter(m => m.monthIndex > 0).length} เดือน`}
            icon={<TrendingUp className="w-4.5 h-4.5 text-blue-400" />}
            accentColor="bg-blue-500"
            glowClass="glow-blue"
            borderColor="border-blue-500/20"
            progress={progressPct}
          />
          <KPICard
            title="จำนวนรายการ"
            value={displayData.totalRecords.toLocaleString("th-TH")}
            subtitle="รายการทั้งหมด"
            icon={<BarChart2 className="w-4.5 h-4.5 text-purple-400" />}
            accentColor="bg-purple-500"
            glowClass="glow-purple"
            borderColor="border-purple-500/20"
            badge={selectedMonth ? selectedMonth : undefined}
          />
          <KPICard
            title="ค่าเฉลี่ย / รายการ"
            value={formatBaht(displayData.avgPerRecord)}
            subtitle="เฉลี่ยต่อรายการ"
            icon={<Calendar className="w-4.5 h-4.5 text-cyan-400" />}
            accentColor="bg-cyan-500"
            glowClass="glow-cyan"
            borderColor="border-cyan-500/20"
          />
          <KPICard
            title="ลูกค้า / เดือนนำ"
            value={displayData.topCustomer.length > 14
              ? displayData.topCustomer.slice(0, 14) + "…"
              : displayData.topCustomer}
            subtitle={`เดือนสูงสุด: ${displayData.topMonth}`}
            icon={<Award className="w-4.5 h-4.5 text-amber-400" />}
            accentColor="bg-amber-500"
            glowClass="glow-amber"
            borderColor="border-amber-500/20"
          />
        </div>

        {/* ── Charts Row 1: Bar + Area ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SalesBarChart data={data.monthlySales} selectedMonth={selectedMonth} />
          <SalesTrendChart data={data.monthlySales} />
        </div>

        {/* ── Charts Row 2: Donut + TopCustomers + Table ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <MonthlyShareChart data={data.monthlySales} />
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

        {/* ── Summary strip ── */}
        <div className="glass rounded-2xl px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-600" />
            Google Sheet · อัพเดตทุก 30 วินาที
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-slate-600" />
            {data.totalRecords.toLocaleString("th-TH")} รายการทั้งหมด
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            {data.uniqueCustomers.toLocaleString("th-TH")} ลูกค้า
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-slate-600" />
            เดือนยอดสูงสุด: {data.topMonth}
          </span>
          {lastUpdated && (
            <span className="ml-auto">
              อัพเดตล่าสุด{" "}
              {lastUpdated.toLocaleString("th-TH", {
                day: "2-digit", month: "short",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
              })}
            </span>
          )}
        </div>

      </main>
    </div>
  );
}
