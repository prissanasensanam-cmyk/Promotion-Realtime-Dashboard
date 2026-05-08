"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { parseGvizResponse, buildDashboardStats } from "@/lib/parseGviz";
import type { DashboardStats } from "@/types";

const SHEET_ID = "1QWfJKOLL94rz_XQJjfC4wHdrhyuxkakno9pR-i_HqmE";
const SHEET_NAME = "ชีต1";
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
      // Cache-bust every fetch
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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
