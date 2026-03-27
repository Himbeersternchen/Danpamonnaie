import React from "react";
import Plot from "react-plotly.js";
import { useDanpaStore } from "../../../zustand/store";
import {
  CHART_NAMES,
  COMMON_CHART_CONFIG,
  COMMON_LAYOUT_CONFIG,
} from "../../constants/chart";

import {
  EXPENDITURE_LINE_CHART_CONFIG,
  generateExpenditureLineChartData,
  type LineChartDataBase,
  MEAN_LINE_CONFIG,
} from "../../services/chartsDummyDataGenerator/line/DailyExpenditureData";
import { WithDataLoader } from "./WithDataLoader";

interface LineChartProps {
  width: number;
  height: number;
  id: string;
  itemId: string | number;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const LineChart = React.memo(function ({
  width,
  height,
  id,
  itemId,
  title = CHART_NAMES.line,
  startDate: _startDate = "2024-05-01",
  endDate: _endDate = "2024-05-31",
}: LineChartProps) {
  // Find the item to check if it has custom data
  const item = useDanpaStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const globalData = useDanpaStore((state) => state.chartData.line);
  const globalLoading = useDanpaStore((state) => state.chartData.loading);
  const globalError = useDanpaStore((state) => state.chartData.error);

  // Use item-specific data if available, otherwise use global data
  const lineData: LineChartDataBase[] | null =
    item?.data !== undefined ? (item.data as LineChartDataBase[]) : globalData;
  const loading = item?.loading !== undefined ? item.loading : globalLoading;
  const error = item?.error !== undefined ? item.error : globalError;

  return (
    <WithDataLoader
      width={width}
      height={height}
      data={lineData}
      loading={loading}
      error={error}
    >
      {(lineData) => {
        const plotData =
          lineData && lineData.at(0) && lineData.at(-1)
            ? generateExpenditureLineChartData([
                { ...lineData.at(0)!, ...EXPENDITURE_LINE_CHART_CONFIG },
                { ...lineData.at(-1)!, ...MEAN_LINE_CONFIG },
              ])
            : generateExpenditureLineChartData();
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
