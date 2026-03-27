import { arraySwap } from "@dnd-kit/sortable";
import { AxiosError } from "axios";
import { v4 } from "uuid";
import { StateCreator } from "zustand";
import { DanpaState } from "../../zustand/stateTypes";
import { CHART_NAMES } from "../constants/chart";
import { fetchBarData } from "../services/api/barApi";
import { fetchBoxData } from "../services/api/boxAPI";
import { fetchBubbleData } from "../services/api/bubbleApi";
import { fetchHistogramData } from "../services/api/histogramApi";
import { fetchLineData } from "../services/api/lineApi";
import { fetchPieData } from "../services/api/pieApi";
import { fetchSankeyData } from "../services/api/sankeyApi";
import { fetchValidDateRange } from "../services/api/validDateRangeApi";
import { fetchWaterfallData } from "../services/api/waterfallApi";
import { generateWeeklyExpenditureBarData } from "../services/chartsDummyDataGenerator/bar/weeklyExpenditureData";
import { generateWeeklyExpenditureBoxData } from "../services/chartsDummyDataGenerator/box/weeklyExpenditureData";
import { generateTransactionBubbleData } from "../services/chartsDummyDataGenerator/bubble/transactionData";
import { generateExpenditureAmountHistogramData } from "../services/chartsDummyDataGenerator/histogram/expenditureAmountData";
import { generateExpenditureLineData } from "../services/chartsDummyDataGenerator/line/DailyExpenditureData";
import { generateMerchantCategoriesPieData } from "../services/chartsDummyDataGenerator/pie/bankingData";
import { generateExpenditureDummyDataForSanky } from "../services/chartsDummyDataGenerator/sankey/expenditureData";
import { generateBankBalanceWaterfallData } from "../services/chartsDummyDataGenerator/waterfall/bankBalanceData";
import {
  generateDashboardItem,
  generateDashboardItems,
} from "../services/dashboardData";
import { DashboardSlice } from "../types/state";
import { formatDateOnly, getLastMonthDateRange } from "../utils/date";

export const createDashboardSlice: StateCreator<
  DanpaState,
  [],
  [],
  DashboardSlice
> = (set, get) => ({
  items: generateDashboardItems(),

  dateRange: getLastMonthDateRange(),

  validDateRange: {
    data: null,
    loading: false,
    error: null,
  },

  chartData: {
    line: null,
    bar: null,
    pie: null,
    sankey: null,
    waterfall: null,
    bubble: null,
    boxplot: null,
    histogram: null,
    loading: false,
    error: null,
    isDemo: {
      line: false,
      bar: false,
      pie: false,
      sankey: false,
      waterfall: false,
      bubble: false,
      boxplot: false,
      histogram: false,
    },
  },

  chartTypes: [
    { type: "line", label: CHART_NAMES.line, icon: "📈" },
    { type: "bar", label: CHART_NAMES.bar, icon: "📊" },
    { type: "pie", label: CHART_NAMES.pie, icon: "🥧" },
    { type: "bubble", label: CHART_NAMES.bubble, icon: "🫧" },
    { type: "boxplot", label: CHART_NAMES.boxplot, icon: "📦" },
    { type: "histogram", label: CHART_NAMES.histogram, icon: "📊" },
    { type: "sankey", label: CHART_NAMES.sankey, icon: "🌊" },
    { type: "waterfall", label: CHART_NAMES.waterfall, icon: "💧" },
  ],

  swapItems: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.items.findIndex((item) => item.id === activeId);
      const newIndex = state.items.findIndex((item) => item.id === overId);
      const newItems = arraySwap(state.items, oldIndex, newIndex);
      return { ...state, items: newItems };
    }),

  addItem: (type) =>
    set({
      ...get(),
      items: [...get().items, generateDashboardItem(type, v4())],
    }),

  removeItem: (id) =>
    set({ ...get(), items: get().items.filter((item) => item.id !== id) }),

  updateItem: (id, updatedItem) =>
    set({
      ...get(),
      items: get().items.map((item) => (item.id === id ? updatedItem : item)),
    }),

  getItemsLength: () => get().items.length,

  setDateRange: (dateRange) =>
    set({
      ...get(),
      dateRange,
      // Clear all items' custom data when global date range changes
      // so they fall back to using the new global data
      items: get().items.map((item) => ({
        ...item,
        data: undefined,
        loading: undefined,
        error: undefined,
      })),
    }),

  setItemDateRange: (id, dateRange) =>
    set({
      ...get(),
      items: get().items.map((item) =>
        item.id === id
          ? {
              ...item,
              dateRange: dateRange || undefined,
              // Clear item data when resetting to global date range
              data: dateRange ? item.data : undefined,
              loading: dateRange ? item.loading : undefined,
              error: dateRange ? item.error : undefined,
            }
          : item
      ),
    }),

  fetchValidDateRange: async () => {
    set({
      ...get(),
      validDateRange: { ...get().validDateRange, loading: true, error: null },
    });

    try {
      set({
        ...get(),
        validDateRange: {
          ...get().validDateRange,
          loading: true,
          error: null,
        },
      });
      const data = await fetchValidDateRange(
        get().selectedAccountId ?? undefined
      );

      let newDateRange = get().dateRange;
      if (data?.min_date && data?.max_date) {
        const minDate = new Date(data.min_date + "T00:00:00");
        const maxDate = new Date(data.max_date + "T00:00:00");

        // First day of the calendar month that max_date belongs to
        const firstDayOfMaxMonth = new Date(
          maxDate.getFullYear(),
          maxDate.getMonth(),
          1
        );

        if (minDate < firstDayOfMaxMonth) {
          // Valid range spans more than the current month → default to [1st of month, max]
          newDateRange = [firstDayOfMaxMonth, maxDate];
        } else {
          // All data fits within the current month → show everything
          newDateRange = [minDate, maxDate];
        }
      }

      set({
        ...get(),
        validDateRange: { data, loading: false, error: null },
        dateRange: newDateRange,
      });
    } catch (error) {
      set({
        ...get(),
        validDateRange: {
          ...get().validDateRange,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch valid date range",
        },
      });
    }
  },

  fetchAllChartData: async (dateRange: [Date, Date]) => {
    const selectedAccountId = get().selectedAccountId;

    if (!selectedAccountId) {
      const isInitializing =
        !get().hasCheckedAuth ||
        get().isCheckingAuth ||
        get().bankAccountsLoading;
      if (isInitializing) {
        set({
          ...get(),
          chartData: { ...get().chartData, loading: true, error: null },
        });
        return;
      }
      if (get().isAuthenticated) {
        set({
          ...get(),
          chartData: {
            ...get().chartData,
            loading: false,
            error: "No bank account selected.",
          },
        });
        return;
      }
      // Not authenticated: fall through to fetch — APIs will fail and dummy data will be used
    }

    const start = formatDateOnly(dateRange[0]);
    const end = formatDateOnly(dateRange[1]);
    const params = {
      start,
      end,
      ...(selectedAccountId ? { acc_id: selectedAccountId } : {}),
    };

    set({
      ...get(),
      chartData: { ...get().chartData, loading: true, error: null },
    });

    try {
      // Fetch all data in parallel with individual error handling
      const results = await Promise.allSettled([
        fetchLineData(params),
        fetchBarData(params),
        fetchPieData(params),
        fetchSankeyData(params),
        fetchWaterfallData(params),
        fetchBubbleData(params),
        fetchBoxData(params),
        fetchHistogramData(params),
      ]);

      // Process each result: use dummy data for auth errors or network errors
      // Returns { data, isDemo } where isDemo is true if dummy data was used
      const processResult = <T,>(
        result: PromiseSettledResult<T>,
        dummyGenerator: () => T
      ): { data: T | null; isDemo: boolean } => {
        if (result.status === "fulfilled") {
          return { data: result.value, isDemo: false };
        }
        // For other errors, return null to let charts display error
        return { data: dummyGenerator(), isDemo: true };
      };

      const lineResult = processResult(results[0], generateExpenditureLineData);
      const barResult = processResult(
        results[1],
        generateWeeklyExpenditureBarData
      );
      const pieResult = processResult(
        results[2],
        generateMerchantCategoriesPieData
      );
      const sankeyResult = processResult(
        results[3],
        generateExpenditureDummyDataForSanky
      );
      const waterfallResult = processResult(
        results[4],
        generateBankBalanceWaterfallData
      );
      const bubbleResult = processResult(
        results[5],
        generateTransactionBubbleData
      );
      const boxResult = processResult(
        results[6],
        generateWeeklyExpenditureBoxData
      );
      const histogramResult = processResult(
        results[7],
        generateExpenditureAmountHistogramData
      );

      set({
        ...get(),
        chartData: {
          line: lineResult.data,
          bar: barResult.data,
          pie: pieResult.data,
          sankey: sankeyResult.data,
          waterfall: waterfallResult.data,
          bubble: bubbleResult.data,
          boxplot: boxResult.data,
          histogram: histogramResult.data,
          loading: false,
          error: null,
          isDemo: {
            line: lineResult.isDemo,
            bar: barResult.isDemo,
            pie: pieResult.isDemo,
            sankey: sankeyResult.isDemo,
            waterfall: waterfallResult.isDemo,
            bubble: bubbleResult.isDemo,
            boxplot: boxResult.isDemo,
            histogram: histogramResult.isDemo,
          },
        },
      });
    } catch (error) {
      // This should rarely happen as we use Promise.allSettled
      set({
        ...get(),
        chartData: {
          ...get().chartData,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch chart data",
        },
      });
    }
  },

  fetchItemData: async (id: string | number, dateRange: [Date, Date]) => {
    const item = get().items.find((item) => item.id === id);
    if (!item) return;

    const selectedAccountId = get().selectedAccountId;
    if (!selectedAccountId) {
      const isInitializing =
        !get().hasCheckedAuth ||
        get().isCheckingAuth ||
        get().bankAccountsLoading;
      if (isInitializing) {
        set({
          ...get(),
          items: get().items.map((i) =>
            i.id === id ? { ...i, loading: true, error: null } : i
          ),
        });
        return;
      }
      if (get().isAuthenticated) {
        set({
          ...get(),
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, loading: false, error: "No bank account selected." }
              : i
          ),
        });
        return;
      }
      // Not authenticated: fall through to fetch — APIs will fail and dummy data will be used
    }

    const start = formatDateOnly(dateRange[0]);
    const end = formatDateOnly(dateRange[1]);
    const params = {
      start,
      end,
      ...(selectedAccountId ? { acc_id: selectedAccountId } : {}),
    };

    // Set loading state for this specific item
    set({
      ...get(),
      items: get().items.map((i) =>
        i.id === id ? { ...i, loading: true, error: null } : i
      ),
    });

    // Helper to fetch data and track if demo data is used
    const fetchWithDemoFallback = async <T,>(
      fetchFn: () => Promise<T>,
      dummyGenerator: () => T
    ): Promise<{ data: T; isDemo: boolean }> => {
      try {
        const data = await fetchFn();
        return { data, isDemo: false };
      } catch (error) {
        if (error instanceof AxiosError) {
          return { data: dummyGenerator(), isDemo: true };
        }
        throw error;
      }
    };

    try {
      let result: { data: unknown; isDemo: boolean } = {
        data: null,
        isDemo: false,
      };

      // Fetch data based on chart type
      switch (item.type) {
        case "line":
          result = await fetchWithDemoFallback(
            () => fetchLineData(params),
            generateExpenditureLineData
          );
          break;
        case "bar":
          result = await fetchWithDemoFallback(
            () => fetchBarData(params),
            generateWeeklyExpenditureBarData
          );
          break;
        case "pie":
          result = await fetchWithDemoFallback(
            () => fetchPieData(params),
            generateMerchantCategoriesPieData
          );
          break;
        case "sankey":
          result = await fetchWithDemoFallback(
            () => fetchSankeyData(params),
            generateExpenditureDummyDataForSanky
          );
          break;
        case "waterfall":
          result = await fetchWithDemoFallback(
            () => fetchWaterfallData(params),
            generateBankBalanceWaterfallData
          );
          break;
        case "bubble":
          result = await fetchWithDemoFallback(
            () => fetchBubbleData(params),
            generateTransactionBubbleData
          );
          break;
        case "boxplot":
          result = await fetchWithDemoFallback(
            () => fetchBoxData(params),
            generateWeeklyExpenditureBoxData
          );
          break;
        case "histogram":
          result = await fetchWithDemoFallback(
            () => fetchHistogramData(params),
            generateExpenditureAmountHistogramData
          );
          break;
      }

      // Update item with fetched data
      set({
        ...get(),
        items: get().items.map((i) =>
          i.id === id
            ? {
                ...i,
                data: result.data,
                loading: false,
                error: null,
                isDemo: result.isDemo,
              }
            : i
        ),
      });
    } catch (error) {
      // Update item with error
      set({
        ...get(),
        items: get().items.map((i) =>
          i.id === id
            ? {
                ...i,
                data: null,
                loading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch data",
                isDemo: false,
              }
            : i
        ),
      });
    }
  },
});
