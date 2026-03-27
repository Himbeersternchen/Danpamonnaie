import { ChartType, DashboardItem, UniqueIdentifier } from ".";
import { BarChartDataBase } from "../services/chartsDummyDataGenerator/bar/weeklyExpenditureData";
import { BoxDataBase } from "../services/chartsDummyDataGenerator/box/weeklyExpenditureData";
import { BubbleChartDataBase } from "../services/chartsDummyDataGenerator/bubble/transactionData";
import { HistogramDataBase } from "../services/chartsDummyDataGenerator/histogram/expenditureAmountData";
import { LineChartDataBase } from "../services/chartsDummyDataGenerator/line/DailyExpenditureData";
import { PieChartData } from "../services/chartsDummyDataGenerator/pie/bankingData";
import { ExpenditureSankeyData } from "../services/chartsDummyDataGenerator/sankey/expenditureData";
import { WaterfallData } from "../services/chartsDummyDataGenerator/waterfall/bankBalanceData";

export interface ValidDateRangeState {
  data: {
    min_date: string | null;
    max_date: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

export interface ChartDataState {
  line: LineChartDataBase[] | null;
  bar: BarChartDataBase | null;
  pie: PieChartData | null;
  sankey: ExpenditureSankeyData | null;
  waterfall: WaterfallData | null;
  bubble: BubbleChartDataBase | null;
  boxplot: BoxDataBase | null;
  histogram: HistogramDataBase | null;
  loading: boolean;
  error: string | null;
  // Track which charts are showing demo data due to API errors
  isDemo: Record<ChartType, boolean>;
}

export interface DashboardSlice {
  items: DashboardItem[];
  chartTypes: { type: ChartType; label: string; icon: string }[];
  dateRange: [Date, Date];
  validDateRange: ValidDateRangeState;
  chartData: ChartDataState;
  swapItems: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
  addItem: (type: ChartType) => void;
  removeItem: (id: UniqueIdentifier) => void;
  updateItem: (id: UniqueIdentifier, updatedItem: DashboardItem) => void;
  getItemsLength: () => number;
  setDateRange: (dateRange: [Date, Date]) => void;
  setItemDateRange: (
    id: UniqueIdentifier,
    dateRange: [Date, Date] | null
  ) => void;
  fetchValidDateRange: () => Promise<void>;
  fetchAllChartData: (dateRange: [Date, Date]) => Promise<void>;
  fetchItemData: (
    id: UniqueIdentifier,
    dateRange: [Date, Date]
  ) => Promise<void>;
}
