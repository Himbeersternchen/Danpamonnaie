import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import useWindowWidth from "../../../../hooks/useWindowWidth";
import { useDanpaStore } from "../../../zustand/store";
import { DASHBOARD_CONFIG } from "../../constants/dashboard";
import { ChartControls } from "../components/ChartControls";
import { MobileControlsMenu } from "../components/MobileControlsMenu";
import { DashboardItem } from "../../types";
import { formatDateOnly } from "../../utils/date";
import { DateRangePickerRSuit } from "../components/DateRangePickerRSuit";
import { ResizableChart } from "../components/ResizableChart";
import { BarChart } from "../plots/BarChart";
import { BoxPlot } from "../plots/BoxPlot";
import { BubbleChart } from "../plots/BubbleChart";
import { Histogram } from "../plots/Histogram";
import { LineChart } from "../plots/LineChart";
import { PieChart } from "../plots/PieChart";
import { SankeyChart } from "../plots/SankeyChart";
import { WaterfallChart } from "../plots/WaterfallChart";

interface DraggableCellProps {
  item: DashboardItem;
}


function renderChart(item: DashboardItem, globalDateRange: [Date, Date]) {
  // Use individual chart date range if set, otherwise use global date range
  const effectiveDateRange = item.dateRange || globalDateRange;

  const commonProps = {
    width: item.width,
    height: item.height,
    id: `chart-${item.id}`,
    itemId: item.id,
    className: "rounded",
    startDate: formatDateOnly(effectiveDateRange[0]),
    endDate: formatDateOnly(effectiveDateRange[1]),
  };

  switch (item.type) {
    case "line":
      return <LineChart {...commonProps} />;
    case "pie":
      return <PieChart {...commonProps} />;
    case "bar":
      return <BarChart {...commonProps} />;
    case "sankey":
      return <SankeyChart {...commonProps} />;
    case "waterfall":
      return <WaterfallChart {...commonProps} />;
    case "bubble":
      return <BubbleChart {...commonProps} />;
    case "boxplot":
      return <BoxPlot {...commonProps} />;
    case "histogram":
      return <Histogram {...commonProps} />;
    default:
      return <LineChart {...commonProps} />;
  }
}

export function DraggableCell({ item }: DraggableCellProps) {
  const [isDatePickerExpanded, setIsDatePickerExpanded] = React.useState(false);
  const isMobile = useWindowWidth() < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const removeItem = useDanpaStore((state) => state.removeItem);
  const globalDateRange = useDanpaStore((state) => state.dateRange);
  const setItemDateRange = useDanpaStore((state) => state.setItemDateRange);
  const fetchItemData = useDanpaStore((state) => state.fetchItemData);
  const globalIsDemo = useDanpaStore(
    (state) => state.chartData.isDemo[item.type]
  );

  // Check if this chart is showing demo data
  const isDemo = item.isDemo ?? globalIsDemo;

  // Fetch data when item's date range changes
  React.useEffect(() => {
    if (item.dateRange) {
      fetchItemData(item.id, item.dateRange);
    }
  }, [item.dateRange, item.id, fetchItemData]);

  const handleItemDateChange = (dateRange: [Date, Date] | null) => {
    setItemDateRange(item.id, dateRange);
  };

  const style: React.CSSProperties | undefined = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-gray-400/30 transition-all duration-200 ${
        isDragging ? "opacity-0" : ""
      }`}
    >
      {isMobile ? (
        <MobileControlsMenu
          listeners={listeners}
          onDelete={() => removeItem(item.id)}
          onToggleDatePicker={() => setIsDatePickerExpanded((v) => !v)}
        />
      ) : (
        <div className="absolute top-2 left-2 z-5">
          <ChartControls
            listeners={listeners}
            onDelete={() => removeItem(item.id)}
            onToggleDatePicker={() => setIsDatePickerExpanded(!isDatePickerExpanded)}
          />
        </div>
      )}

      {isDemo && (
        <span className="absolute bottom-2 left-2 z-5 grid place-items-center h-8 bg-amber-500 text-white text-xs font-semibold px-2 rounded-lg">
          Demo
        </span>
      )}

      {isDatePickerExpanded && (
        <div className="absolute bottom-2 right-2 z-6">
          <DateRangePickerRSuit
            size="sm"
            showWeekNumbers
            value={item.dateRange || globalDateRange}
            onChange={handleItemDateChange}
          />
        </div>
      )}

      <ResizableChart item={item}>
        {renderChart(item, globalDateRange)}
      </ResizableChart>
    </div>
  );
}
