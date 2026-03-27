import React from "react";
import Plot from "react-plotly.js";
import { useDanpaStore } from "../../../zustand/store";
import {
  CHART_NAMES,
  COMMON_CHART_CONFIG,
  COMMON_LAYOUT_CONFIG,
} from "../../constants/chart";
import {
  type PieChartData,
  generateTransactionTypesPieChartData,
} from "../../services/chartsDummyDataGenerator/pie/bankingData";
import { WithDataLoader } from "./WithDataLoader";

interface PieChartProps {
  width: number;
  height: number;
  id: string;
  itemId: string | number;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const PieChart = React.memo(function ({
  width,
  height,
  id,
  itemId,
  title = CHART_NAMES.pie,
  startDate: _startDate = "2024-05-01",
  endDate: _endDate = "2024-05-31",
}: PieChartProps) {
  // Find the item to check if it has custom data
  const item = useDanpaStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const globalData = useDanpaStore((state) => state.chartData.pie);
  const globalLoading = useDanpaStore((state) => state.chartData.loading);
  const globalError = useDanpaStore((state) => state.chartData.error);

  // Use item-specific data if available, otherwise use global data
  const pieData: PieChartData | null =
    item?.data !== undefined ? (item.data as PieChartData) : globalData;
  const loading = item?.loading !== undefined ? item.loading : globalLoading;
  const error = item?.error !== undefined ? item.error : globalError;

  return (
    <WithDataLoader
      width={width}
      height={height}
      data={pieData}
      loading={loading}
      error={error}
    >
      {(pieData) => {
        const plotData = pieData
          ? generateTransactionTypesPieChartData(pieData)
          : generateTransactionTypesPieChartData();

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
