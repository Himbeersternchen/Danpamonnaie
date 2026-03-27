import { PlotData } from "plotly.js";

export interface BoxDataBase {
  x: string[];
  y: number[];
  type: "box";
}

export interface BoxConfig {
  name?: string;
  marker?: {
    color?: string;
  };
  boxpoints?: string;
}

export interface BoxData extends BoxDataBase, BoxConfig {}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const BOX_PLOT_CONFIG = {
  name: "Daily Expenditure Frequency",
  marker: {
    color: "#3b82f6",
  },
  boxpoints: "outliers",
};

export function generateWeeklyExpenditureBoxData(): BoxDataBase {
  const x: string[] = [];
  const y: number[] = [];

  // Generate expenditure frequency data for each weekday
  WEEKDAYS.forEach((weekday) => {
    // Generate 15-30 data points per weekday for better box plot distribution
    const dataPointsPerDay = Math.floor(Math.random() * 16) + 15;

    // Base frequency varies by day (weekends typically higher)
    let baseFreq = 5; // Default weekday frequency
    if (weekday === "Friday") baseFreq = 8;
    if (weekday === "Saturday") baseFreq = 12;
    if (weekday === "Sunday") baseFreq = 10;

    for (let i = 0; i < dataPointsPerDay; i++) {
      x.push(weekday);
      // Expenditure frequency: base ± random variation (1-25 transactions)
      const frequency = Math.max(
        1,
        baseFreq + Math.floor(Math.random() * 21) - 10
      );
      y.push(frequency);
    }
  });

  return {
    x,
    y,
    type: "box",
  };
}

export const generateWeeklyExpenditureBoxChartData = (
  data: BoxDataBase = generateWeeklyExpenditureBoxData()
): Plotly.Data[] => {
  return [
    {
      x: data.x,
      y: data.y,
      type: data.type,
      ...BOX_PLOT_CONFIG,
    },
  ] as unknown as Partial<PlotData>[];
};
