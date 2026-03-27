const MOBILE_BREAKPOINT = 1024;
export const MOBILE_CHART_WIDTH_PROPORTION = 0.95;

export const getProportionalChartWidth = (
  proportion: number,
  windowWidth?: number
) => {
  const currentWidth =
    windowWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
  return Math.floor(currentWidth * proportion);
};

export const WIDE_CHART_WIDTH_PROPOTION = 7 / 10;
export const MIDDLE_CHART_WIDTH_PROPOTION = WIDE_CHART_WIDTH_PROPOTION * 0.667;
export const NARROW_CHART_WIDTH_PROPOTION = WIDE_CHART_WIDTH_PROPOTION * 0.495;
export const SUPER_NARROW_CHART_WIDTH_PROPOTION =
  WIDE_CHART_WIDTH_PROPOTION * 0.333;

export const CHART_WIDTH_PROPORTIONS = {
  line: WIDE_CHART_WIDTH_PROPOTION,
  pie: SUPER_NARROW_CHART_WIDTH_PROPOTION,
  bar: NARROW_CHART_WIDTH_PROPOTION,
  sankey: MIDDLE_CHART_WIDTH_PROPOTION,
  waterfall: NARROW_CHART_WIDTH_PROPOTION,
  bubble: WIDE_CHART_WIDTH_PROPOTION,
  boxplot: NARROW_CHART_WIDTH_PROPOTION,
  histogram: NARROW_CHART_WIDTH_PROPOTION,
} as const;

export const DASHBOARD_CONFIG = {
  GRID_GAP: 4, // Tailwind gap-4
  INITIAL_ITEM_COUNT: 15,
  MIN_ITEM_WIDTH: 100,
  MAX_ADDITIONAL_WIDTH: 1000,
  MAX_WIDTH_PROPOTIONS: WIDE_CHART_WIDTH_PROPOTION,
  MOBILE_BREAKPOINT,
  INIT_HEIGHT: 350,
} as const;

export const DATE_HEIGHT_OFFSET = 10;
