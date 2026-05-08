export interface SaleRecord {
  [key: string]: string | number | null;
}

export interface ParsedSheet {
  columns: ColumnDef[];
  rows: SaleRecord[];
}

export interface ColumnDef {
  id: string;
  label: string;
  type: string;
}

export interface MonthlySales {
  month: string;
  monthIndex: number;
  total: number;
  count: number;
}

export interface CustomerSales {
  customer: string;
  total: number;
  count: number;
  months: string[];
}

export interface DashboardStats {
  totalSales: number;
  totalRecords: number;
  avgPerRecord: number;
  topMonth: string;
  topCustomer: string;
  monthlySales: MonthlySales[];
  customerSales: CustomerSales[];
  allRecords: SaleRecord[];
  columns: ColumnDef[];
}
