import React from "react";
import Plot from "react-plotly.js";
import { useDanpaStore } from "../../../zustand/store";
import {
  CHART_NAMES,
  COMMON_CHART_CONFIG,
  COMMON_LAYOUT_CONFIG,
} from "../../constants/chart";
import {
  type WaterfallData,
  generateWaterfallPlotData,
} from "../../services/chartsDummyDataGenerator/waterfall/bankBalanceData";
import { WithDataLoader } from "./WithDataLoader";

interface WaterfallChartProps {
  width: number;
  height: number;
  id: string;
  itemId: string | number;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const WaterfallChart = React.memo(function ({
  width,
  height,
  id,
  itemId,
  title = CHART_NAMES.waterfall,
  startDate: _startDate = "2024-05-01",
  endDate: _endDate = "2024-05-31",
}: WaterfallChartProps) {
  // Find the item to check if it has custom data
  const item = useDanpaStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const globalData = useDanpaStore((state) => state.chartData.waterfall);
  const globalLoading = useDanpaStore((state) => state.chartData.loading);
  const globalError = useDanpaStore((state) => state.chartData.error);

  // Use item-specific data if available, otherwise use global data
  const waterfallData: WaterfallData | null =
    item?.data !== undefined ? (item.data as WaterfallData) : globalData;
  const loading = item?.loading !== undefined ? item.loading : globalLoading;
  const error = item?.error !== undefined ? item.error : globalError;

  return (
    <WithDataLoader
      width={width}
      height={height}
      data={waterfallData}
      loading={loading}
      error={error}
    >
      {(waterfallData) => {
        const plotData = waterfallData
          ? generateWaterfallPlotData(waterfallData)
          : generateWaterfallPlotData();
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
