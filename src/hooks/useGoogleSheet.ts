"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { parseGvizResponse, buildDashboardStats } from "@/lib/parseGviz";
import type { DashboardStats } from "@/types";

const SHEET_ID = "1QWfJKOLL94rz_XQJjfC4wHdrhyuxkakno9pR-i_HqmE";
const SHEET_NAME = "Sheet1";
const REFRESH_INTERVAL = 30_000; // 30 seconds

export interface SheetState {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useGoogleSheet(): SheetState {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      // credentials: "omit" — ห้าม browser ส่ง Google auth cookies
      // เพราะ gviz จะ 403 ถ้า authenticated user ไม่มีสิทธิ์ access sheet
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&t=${Date.now()}`;
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            'Google Sheet ยังไม่ได้เปิดเป็น Public\n\nกรุณาเปิด Google Sheet → Share → "Anyone with the link" → Viewer แล้วลองใหม่'
          );
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      const sheet = parseGvizResponse(text);
      const stats = buildDashboardStats(sheet);
      setData(stats);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    intervalRef.current = setInterval(() => void fetchData(), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
}
