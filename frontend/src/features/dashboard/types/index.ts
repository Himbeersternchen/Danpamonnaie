export type UniqueIdentifier = string | number;

export interface BaseItem {
  width: number;
  height: number;
}

export type ChartType =
  | "line"
  | "pie"
  | "bar"
  | "sankey"
  | "waterfall"
  | "bubble"
  | "boxplot"
  | "histogram";

export interface DashboardItem extends BaseItem {
  id: UniqueIdentifier;
  type: ChartType;
  dateRange?: [Date, Date];
  // Per-item data state for individual date ranges
  data?: unknown;
  loading?: boolean;
  error?: string | null;
  isDemo?: boolean;
}

export interface ChartConfig {
  title: string;
  width: number;
  height: number;
  margin: {
    l: number;
    r: number;
    b: number;
    t: number;
    pad: number;
  };
}

export interface RowRange {
  startIndex: number;
  endIndex: number;
}
