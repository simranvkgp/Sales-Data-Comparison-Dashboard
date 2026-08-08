export interface SalesRecord {
  productName: string;
  quantity: number;
  salesAmount: number;
  date?: string;
  category?: string;
  orderId?: string;
  customer?: string;
  region?: string;
  salesperson?: string;
  discount?: number;
  cost?: number;
  profit?: number;
  [key: string]: any;
}

export interface FileData {
  fileName: string;
  label: string;
  records: SalesRecord[];
  originalData: any[];
  columnMapping: ColumnMapping;
  dataQualityIssues: DataQualityIssue[];
}

export interface ColumnMapping {
  productName?: string;
  quantity?: string;
  salesAmount?: string;
  date?: string;
  category?: string;
  orderId?: string;
  customer?: string;
  region?: string;
  salesperson?: string;
  discount?: string;
  cost?: string;
  profit?: string;
  [key: string]: string | undefined;
}

export interface DataQualityIssue {
  type: 'missingProduct' | 'invalidQuantity' | 'invalidAmount' | 'invalidDate' | 'duplicate' | 'empty';
  count: number;
  details: string[];
}

export interface DashboardState {
  files: FileData[];
  filters: FilterState;
  selectedPeriods: string[];
}

export interface FilterState {
  periods: string[];
  products: string[];
  categories: string[];
  dateRange: {
    from?: string;
    to?: string;
  };
}

export interface ComparisonMetrics {
  totalSales: number;
  totalOrders: number;
  totalQuantity: number;
  averageOrderValue: number;
  totalProfit?: number;
  profitMargin?: number;
}

export interface PeriodComparison {
  period: string;
  sales: number;
  orders: number;
  quantity: number;
  aov: number;
  profit?: number;
}

export interface ProductComparison {
  productName: string;
  periods: {
    [key: string]: {
      quantity: number;
      sales: number;
    };
  };
  totalQuantity: number;
  totalSales: number;
  growth: number;
}

export interface TopProduct {
  rank: number;
  productName: string;
  quantity: number;
  sales: number;
  growth: number;
}

export interface SalesInsight {
  icon: string;
  title: string;
  description: string;
}
