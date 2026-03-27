import { Config, Layout, ModeBarDefaultButtons } from "plotly.js";
import { ChartType } from "../types";
import { WIDE_CHART_WIDTH_PROPOTION } from "./dashboard";

const CHART_CONFIG = {
  DEFAULT_HEIGHT: 300,
  DEFAULT_MARGIN: {
    l: 50,
    r: 50,
    b: 50,
    t: 50,
    pad: 4,
  },
  DISABLED_TOOLBAR_BUTTONS: [
    "resetScale2d",
    "zoomIn2d",
    "zoomOut2d",
    "autoScale2d",
    "lasso2d",
    "select2d",
  ] satisfies ModeBarDefaultButtons[],
};

export const COMMON_CHART_CONFIG = {
  modeBarButtonsToRemove: CHART_CONFIG.DISABLED_TOOLBAR_BUTTONS,
  displaylogo: false,
  setBackground: () => {},
} as const satisfies Partial<Config>;

export const COMMON_LAYOUT_CONFIG = {
  autosize: false,
  margin: CHART_CONFIG.DEFAULT_MARGIN,
} as const satisfies Partial<Layout>;

export const MIN_WIDTH = 200;
export const MIN_HEIGHT = 150;
export const MAX_WIDTH = WIDE_CHART_WIDTH_PROPOTION;
export const MAX_HEIGHT = 600;

export const CHART_NAMES: Record<ChartType, string> = {
  line: "Daily Transaction",
  pie: "Category",
  bar: "Expenditure amount on weekdays",
  sankey: "Expenditure Flow",
  waterfall: "Balance and Delta",
  bubble: "Bubble view of Expenditures",
  boxplot: "Payments distribution on weekdays",
  histogram: "Payments number on weekdays",
};
