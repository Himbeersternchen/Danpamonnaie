import { UniqueIdentifier } from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid";
import {
  CHART_WIDTH_PROPORTIONS,
  DASHBOARD_CONFIG,
  MOBILE_CHART_WIDTH_PROPORTION,
  getProportionalChartWidth,
} from "../constants/dashboard";
import { ChartType, DashboardItem } from "../types";

const isMobile =
  typeof window !== "undefined" &&
  window.innerWidth < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;

function getChartWidth(type: ChartType): number {
  if (isMobile) {
    return Math.floor(window.innerWidth * MOBILE_CHART_WIDTH_PROPORTION);
  }
  return getProportionalChartWidth(CHART_WIDTH_PROPORTIONS[type]);
}

const CHART_TYPES: ChartType[] = [
  "sankey",
  "pie",
  "line",
  "bar",
  "waterfall",
  "boxplot",
  "histogram",
  "bubble",
];

export function generateDashboardItems(): DashboardItem[] {
  return CHART_TYPES.map((type) => ({
    id: uuidv4(),
    type,
    width: getChartWidth(type),
    height: DASHBOARD_CONFIG.INIT_HEIGHT,
  }));
}

export function generateDashboardItem(
  type: ChartType,
  id: UniqueIdentifier
): DashboardItem {
  return {
    id,
    type,
    width: getChartWidth(type),
    height: DASHBOARD_CONFIG.INIT_HEIGHT,
  };
}
