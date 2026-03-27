import { PlotData } from "plotly.js";

export interface BarChartDataBase {
  x: string[];
  y: number[];
  type: "bar";
}

export interface BarChartConfig {
  marker?: {
    color?: string | string[];
    opacity?: number;
  };
  name?: string;
  hovertemplate?: string;
}

export interface BarChartData extends BarChartDataBase, BarChartConfig {}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WEEKDAY_COLORS = [
  "#6366f1", // Monday - indigo
  "#8b5cf6", // Tuesday - violet
  "#a855f7", // Wednesday - purple
  "#d946ef", // Thursday - fuchsia
  "#ec4899", // Friday - pink
  "#f97316", // Saturday - orange
  "#eab308", // Sunday - yellow
];

const BARCHART_NAME = "Weekday Expenditure";

export const BAR_CHART_CONFIG: BarChartConfig = {
  marker: {
    color: WEEKDAY_COLORS,
    opacity: 0.8,
  },
  name: BARCHART_NAME,
  hovertemplate:
    "%{x}<br>" + "Total Expenditure: $%{y:,.0f}<br>" + "<extra></extra>",
};

export function generateWeeklyExpenditureBarData(): BarChartDataBase {
  const expenditures: number[] = [];

  WEEKDAYS.forEach((_, index) => {
    // Base expenditure varies by day with realistic patterns
    let baseAmount = 150; // Default weekday amount

    // Weekend and Friday typically have higher spending
    if (index === 4) baseAmount = 220; // Friday
    if (index === 5) baseAmount = 280; // Saturday
    if (index === 6) baseAmount = 250; // Sunday

    // Add random variation ±50%
    const variation = (Math.random() - 0.5) * baseAmount;
    const totalExpenditure = Math.max(50, Math.round(baseAmount + variation));

    expenditures.push(totalExpenditure);
  });

  return {
    x: WEEKDAYS,
    y: expenditures,
    type: "bar",
  };
}

export const generateWeeklyExpenditureBarChartData = (
  data: BarChartDataBase = generateWeeklyExpenditureBarData()
): Plotly.Data[] => {
  return [
    {
      x: data.x,
      y: data.y,
      type: data.type,
      ...BAR_CHART_CONFIG,
    },
  ] as unknown as Partial<PlotData>[];
};
