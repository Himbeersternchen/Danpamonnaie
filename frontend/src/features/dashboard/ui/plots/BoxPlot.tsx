import React from "react";
import Plot from "react-plotly.js";
import { useDanpaStore } from "../../../zustand/store";
import {
  CHART_NAMES,
  COMMON_CHART_CONFIG,
  COMMON_LAYOUT_CONFIG,
} from "../../constants/chart";
import {
  type BoxDataBase,
  generateWeeklyExpenditureBoxChartData,
} from "../../services/chartsDummyDataGenerator/box/weeklyExpenditureData";
import { WithDataLoader } from "./WithDataLoader";

interface BoxPlotProps {
  width: number;
  height: number;
  id: string;
  itemId: string | number;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const BoxPlot = React.memo(function ({
  width,
  height,
  id,
  itemId,
  title = CHART_NAMES.boxplot,
  startDate: _startDate,
  endDate: _endDate,
}: BoxPlotProps) {
  // Find the item to check if it has custom data
  const item = useDanpaStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const globalData = useDanpaStore((state) => state.chartData.boxplot);
  const globalLoading = useDanpaStore((state) => state.chartData.loading);
  const globalError = useDanpaStore((state) => state.chartData.error);

  // Use item-specific data if available, otherwise use global data
  const boxData: BoxDataBase | null =
    item?.data !== undefined ? (item.data as BoxDataBase) : globalData;
  const loading = item?.loading !== undefined ? item.loading : globalLoading;
  const error = item?.error !== undefined ? item.error : globalError;

  return (
    <WithDataLoader
      width={width}
      height={height}
      data={boxData}
      loading={loading}
      error={error}
    >
      {(boxDataBase) => {
        const plotData = boxDataBase
          ? generateWeeklyExpenditureBoxChartData(boxDataBase)
          : generateWeeklyExpenditureBoxChartData();
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
