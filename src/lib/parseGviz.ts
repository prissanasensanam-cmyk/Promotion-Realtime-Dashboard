import type { ParsedSheet, ColumnDef, SaleRecord, MonthlySales, CustomerSales, DashboardStats } from "@/types";

const THAI_MONTHS: Record<string, number> = {
  "มกราคม": 1, "ม.ค.": 1, "มค": 1, "jan": 1, "january": 1,
  "กุมภาพันธ์": 2, "ก.พ.": 2, "กพ": 2, "feb": 2, "february": 2,
  "มีนาคม": 3, "มี.ค.": 3, "มีค": 3, "mar": 3, "march": 3,
  "เมษายน": 4, "เม.ย.": 4, "เมย": 4, "apr": 4, "april": 4,
  "พฤษภาคม": 5, "พ.ค.": 5, "พค": 5, "may": 5,
  "มิถุนายน": 6, "มิ.ย.": 6, "มิย": 6, "jun": 6, "june": 6,
  "กรกฎาคม": 7, "ก.ค.": 7, "กค": 7, "jul": 7, "july": 7,
  "สิงหาคม": 8, "ส.ค.": 8, "สค": 8, "aug": 8, "august": 8,
  "กันยายน": 9, "ก.ย.": 9, "กย": 9, "sep": 9, "september": 9,
  "ตุลาคม": 10, "ต.ค.": 10, "ตค": 10, "oct": 10, "october": 10,
  "พฤศจิกายน": 11, "พ.ย.": 11, "พย": 11, "nov": 11, "november": 11,
  "ธันวาคม": 12, "ธ.ค.": 12, "ธค": 12, "dec": 12, "december": 12,
};

const THAI_MONTHS_SHORT: Record<number, string> = {
  1: "ม.ค.", 2: "ก.พ.", 3: "มี.ค.", 4: "เม.ย.",
  5: "พ.ค.", 6: "มิ.ย.", 7: "ก.ค.", 8: "ส.ค.",
  9: "ก.ย.", 10: "ต.ค.", 11: "พ.ย.", 12: "ธ.ค.",
};

export function parseGvizResponse(rawText: string): ParsedSheet {
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Invalid gviz response format");
  }

  const jsonStr = rawText.slice(jsonStart, jsonEnd + 1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = JSON.parse(jsonStr) as any;

  const table = data.table;
  if (!table) throw new Error("No table data found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef[] = (table.cols || []).map((col: any, idx: number) => ({
    id: col.id || `col_${idx}`,
    label: col.label || col.id || `Column ${idx + 1}`,
    type: col.type || "string",
  }));

  const validColumns = columns.filter((c) => c.label && c.label.trim() !== "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: SaleRecord[] = (table.rows || []).map((row: any) => {
    const record: SaleRecord = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (row.c || []).forEach((cell: any, idx: number) => {
      const col = columns[idx];
      if (!col || !col.label || col.label.trim() === "") return;
      // gviz returns Date as {v: "Date(2025,0,15)"} — prefer formatted value
      if (col.type === "date" && cell?.f) {
        record[col.label] = cell.f;
      } else {
        record[col.label] = cell?.v ?? null;
      }
    });
    return record;
  }).filter((row: SaleRecord) => {
    return Object.values(row).some((v) => v !== null && v !== "");
  });

  return { columns: validColumns, rows };
}

function detectSalesColumn(columns: ColumnDef[]): string | null {
  const salesKeywords = ["ยอดขาย", "ยอด", "จำนวนเงิน", "มูลค่า", "sales", "amount", "value", "total", "เงิน", "บาท", "ราคา"];
  for (const kw of salesKeywords) {
    const col = columns.find((c) => c.label.toLowerCase().includes(kw.toLowerCase()));
    if (col) return col.label;
  }
  const numCol = columns.find((c) => c.type === "number");
  if (numCol) return numCol.label;
  return null;
}

function detectCustomerColumn(columns: ColumnDef[]): string | null {
  const customerKeywords = ["ลูกค้า", "ชื่อ", "ผู้กู้", "customer", "name", "client", "สาขา", "ทีม", "พนักงาน", "เอเจนต์", "ตัวแทน"];
  for (const kw of customerKeywords) {
    const col = columns.find((c) => c.label.toLowerCase().includes(kw.toLowerCase()));
    if (col) return col.label;
  }
  return columns[0]?.label ?? null;
}

function detectMonthColumn(columns: ColumnDef[]): string | null {
  const monthKeywords = ["เดือน", "month", "วันที่", "date", "ประจำเดือน", "งวด"];
  for (const kw of monthKeywords) {
    const col = columns.find((c) => c.label.toLowerCase().includes(kw.toLowerCase()));
    if (col) return col.label;
  }
  return null;
}

export function parseMonthValue(value: string | number | null): number {
  if (!value) return 0;
  const str = String(value).trim().toLowerCase();

  for (const [key, num] of Object.entries(THAI_MONTHS)) {
    if (str === key.toLowerCase() || str.includes(key.toLowerCase())) {
      return num;
    }
  }

  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;

  // Date string: YYYY-MM-DD
  const dateMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) return parseInt(dateMatch[2], 10);

  // Date string: DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = str.match(/(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/);
  if (slashMatch) {
    const m = parseInt(slashMatch[2], 10);
    if (m >= 1 && m <= 12) return m;
    // try first segment as month
    const m2 = parseInt(slashMatch[1], 10);
    if (m2 >= 1 && m2 <= 12) return m2;
  }

  return 0;
}

export function buildDashboardStats(sheet: ParsedSheet): DashboardStats {
  const { columns, rows } = sheet;

  const salesCol = detectSalesColumn(columns);
  const customerCol = detectCustomerColumn(columns);
  const monthCol = detectMonthColumn(columns);

  let totalSales = 0;
  const monthlyMap: Record<number, { total: number; count: number; label: string }> = {};
  const customerMap: Record<string, { total: number; count: number; months: Set<string> }> = {};

  // Enrich each row with a hidden _monthIndex for reliable month filtering
  const enrichedRows: SaleRecord[] = rows.map((row) => {
    const monthRaw = monthCol ? row[monthCol] : null;
    const monthNum = parseMonthValue(monthRaw);
    return { ...row, _monthIndex: monthNum };
  });

  for (const row of enrichedRows) {
    const salesVal = salesCol ? parseFloat(String(row[salesCol] ?? 0).replace(/,/g, "")) || 0 : 0;
    const customer = customerCol ? String(row[customerCol] ?? "ไม่ระบุ").trim() : "ไม่ระบุ";
    const monthNum = typeof row._monthIndex === "number" ? row._monthIndex : 0;
    const monthLabel = THAI_MONTHS_SHORT[monthNum] || (monthNum > 0 ? `เดือน ${monthNum}` : "ไม่ระบุ");

    totalSales += salesVal;

    if (monthNum > 0) {
      if (!monthlyMap[monthNum]) {
        monthlyMap[monthNum] = { total: 0, count: 0, label: monthLabel };
      }
      monthlyMap[monthNum].total += salesVal;
      monthlyMap[monthNum].count += 1;
    } else {
      if (!monthlyMap[0]) {
        monthlyMap[0] = { total: 0, count: 0, label: "ไม่ระบุ" };
      }
      monthlyMap[0].total += salesVal;
      monthlyMap[0].count += 1;
    }

    if (customer) {
      if (!customerMap[customer]) {
        customerMap[customer] = { total: 0, count: 0, months: new Set() };
      }
      customerMap[customer].total += salesVal;
      customerMap[customer].count += 1;
      if (monthLabel !== "ไม่ระบุ") customerMap[customer].months.add(monthLabel);
    }
  }

  const monthlySales: MonthlySales[] = Object.entries(monthlyMap)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([idx, data]) => ({
      monthIndex: parseInt(idx),
      month: data.label,
      total: data.total,
      count: data.count,
    }));

  const customerSales: CustomerSales[] = Object.entries(customerMap)
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([customer, data]) => ({
      customer,
      total: data.total,
      count: data.count,
      months: Array.from(data.months),
    }));

  const topMonthEntry = monthlySales
    .filter((m) => m.monthIndex > 0)
    .sort((a, b) => b.total - a.total)[0];

  const topMonth = topMonthEntry?.month ?? "-";
  const topCustomer = customerSales[0]?.customer ?? "-";
  const avgPerRecord = rows.length > 0 ? totalSales / rows.length : 0;
  const uniqueCustomers = Object.keys(customerMap).length;

  return {
    totalSales,
    totalRecords: rows.length,
    avgPerRecord,
    topMonth,
    topCustomer,
    uniqueCustomers,
    monthlySales,
    customerSales,
    allRecords: enrichedRows,
    columns,
  };
}
