import React from "react";
import Plot from "react-plotly.js";
import { useDanpaStore } from "../../../zustand/store";
import {
  CHART_NAMES,
  COMMON_CHART_CONFIG,
  COMMON_LAYOUT_CONFIG,
} from "../../constants/chart";
import type { BarChartDataBase } from "../../services/chartsDummyDataGenerator/bar/weeklyExpenditureData";
import { generateWeeklyExpenditureBarChartData } from "../../services/chartsDummyDataGenerator/bar/weeklyExpenditureData";
import { WithDataLoader } from "./WithDataLoader";

interface BarChartProps {
  width: number;
  height: number;
  id: string;
  itemId: string | number;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const BarChart = React.memo(function ({
  width,
  height,
  id,
  itemId,
  title = CHART_NAMES.bar,
  startDate: _startDate = "2024-05-01",
  endDate: _endDate = "2024-05-31",
}: BarChartProps) {
  // Find the item to check if it has custom data
  const item = useDanpaStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const globalData = useDanpaStore((state) => state.chartData.bar);
  const globalLoading = useDanpaStore((state) => state.chartData.loading);
  const globalError = useDanpaStore((state) => state.chartData.error);

  // Use item-specific data if available, otherwise use global data
  const barData: BarChartDataBase | null =
    item?.data !== undefined ? (item.data as BarChartDataBase) : globalData;
  const loading = item?.loading !== undefined ? item.loading : globalLoading;
  const error = item?.error !== undefined ? item.error : globalError;

  return (
    <WithDataLoader
      width={width}
      height={height}
      data={barData}
      loading={loading}
      error={error}
    >
      {() => {
        const plotData = globalData
          ? generateWeeklyExpenditureBarChartData(globalData)
          : generateWeeklyExpenditureBarChartData();

        return (
          <Plot
            divId={id}
            data={plotData}
            layout={{
              title: { text: title },
              width,
              height,
              ...COMMON_LAYOUT_CONFIG,
            }}
            config={COMMON_CHART_CONFIG}
          />
        );
      }}
    </WithDataLoader>
  );
});
