import React from "react";
import Plot from "react-plotly.js";
import useWindowWidth from "../../../../hooks/useWindowWidth";
import { useDanpaStore } from "../../../zustand/store";
import {
  CHART_NAMES,
  COMMON_CHART_CONFIG,
  COMMON_LAYOUT_CONFIG,
} from "../../constants/chart";
import { DASHBOARD_CONFIG } from "../../constants/dashboard";
import {
  type ExpenditureSankeyData,
  generateMobileSankyPlotData,
  generateSankyPlotData,
} from "../../services/chartsDummyDataGenerator/sankey/expenditureData";
import { WithDataLoader } from "./WithDataLoader";

interface SankeyChartProps {
  width: number;
  height: number;
  id: string;
  itemId: string | number;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const SankeyChart = React.memo(function ({
  width,
  height,
  id,
  itemId,
  title = CHART_NAMES.sankey,
  startDate: _startDate = "2024-05-01",
  endDate: _endDate = "2024-05-31",
}: SankeyChartProps) {
  const isMobile = useWindowWidth() < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;
  const isTouchDevice = navigator.maxTouchPoints > 0;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastTouchPosRef = React.useRef<{ clientX: number; clientY: number } | null>(null);
  // True for 2 seconds after touchend — window during which onUnhover re-shows tooltip.
  const touchWindowRef = React.useRef(false);

  React.useEffect(() => {
    if (!isTouchDevice) return;
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => { touchWindowRef.current = false; };
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      lastTouchPosRef.current = { clientX: touch.clientX, clientY: touch.clientY };
      touchWindowRef.current = true;
      setTimeout(() => { touchWindowRef.current = false; }, 2000);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isTouchDevice]);

  // When Plotly fires onUnhover (from click.basic calling unhover), re-dispatch
  // mousemove so nodeHoverFollow() calls Fx.loneHover() and re-renders the tooltip.
  // mousemove (not mouseover) avoids triggering the drag handler's unhover error.
  const handleUnhover = React.useCallback(() => {
    if (!isTouchDevice || !touchWindowRef.current || !lastTouchPosRef.current) return;
    const { clientX, clientY } = lastTouchPosRef.current;
    const container = containerRef.current;
    if (!container) return;
    setTimeout(() => {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el || !container.contains(el)) return;
      el.dispatchEvent(
        new MouseEvent("mousemove", { bubbles: true, clientX, clientY, cancelable: true })
      );
    }, 0);
  }, [isTouchDevice]);

  // Find the item to check if it has custom data
  const item = useDanpaStore((state) =>
    state.items.find((i) => i.id === itemId)
  );
  const globalData = useDanpaStore((state) => state.chartData.sankey);
  const globalLoading = useDanpaStore((state) => state.chartData.loading);
  const globalError = useDanpaStore((state) => state.chartData.error);

  // Use item-specific data if available, otherwise use global data
  const sankeyData: ExpenditureSankeyData | null =
    item?.data !== undefined
      ? (item.data as ExpenditureSankeyData)
      : globalData;
  const loading = item?.loading !== undefined ? item.loading : globalLoading;
  const error = item?.error !== undefined ? item.error : globalError;

  return (
    <WithDataLoader
      width={width}
      height={height}
      data={sankeyData}
      loading={loading}
      error={error}
    >
      {(sankeyData) => {
        const plotData = isMobile
          ? generateMobileSankyPlotData(sankeyData ?? undefined)
          : sankeyData
            ? generateSankyPlotData(sankeyData)
            : generateSankyPlotData();

        return (
          <div
            ref={containerRef}
            className="relative"
            style={isTouchDevice ? { touchAction: "none" } : undefined}
            onContextMenu={
              isTouchDevice ? (e) => e.preventDefault() : undefined
            }
          >
            <Plot
              divId={id}
              data={plotData}
              layout={{
                title: { text: title },
                width,
                height,
                ...COMMON_LAYOUT_CONFIG,
              }}
              config={{ ...COMMON_CHART_CONFIG }}
              onUnhover={isTouchDevice ? handleUnhover : undefined}
            />
          </div>
        );
      }}
    </WithDataLoader>
  );
});
