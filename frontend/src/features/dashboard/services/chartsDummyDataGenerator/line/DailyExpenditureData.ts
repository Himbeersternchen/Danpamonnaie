import { PlotData } from "plotly.js";

export interface LineChartDataBase {
  x: string[];
  y: number[];
}

export interface LineChartConfig {
  mode: "lines" | "markers" | "lines+markers";
  name: string;
  line?: {
    color?: string;
    width?: number;
    dash?: string;
  };
}

export interface LineChartData extends LineChartDataBase, LineChartConfig {}

export const EXPENDITURE_LINE_CHART_CONFIG: LineChartConfig = {
  mode: "lines+markers",
  name: "Expenditure Amount",
  line: {
    color: "#3b82f6",
    width: 2,
  },
};

export const MEAN_LINE_CONFIG: LineChartConfig = {
  mode: "lines",
  name: "Mean",
  line: {
    color: "#ef4444",
    width: 2,
    dash: "dash",
  },
};

export function generateExpenditureLineData(): LineChartDataBase[] {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = currentDate.getDate();

  // Generate daily balance data for the current month up to today
  const days: string[] = [];
  const expenditures: number[] = [];

  for (let day = 1; day <= Math.min(currentDay, daysInMonth); day++) {
    days.push(String(day));

    // Generate daily balance change (-$200 to +$200)
    const dailyChange = Math.floor(Math.random() * 400) - 200;

    expenditures.push(dailyChange);
  }

  // Calculate mean change
  const meanBalance =
    expenditures.reduce((sum, expenditure) => sum + expenditure, 0) /
    expenditures.length;

  // Create bank balance line
  const expenditureLine: LineChartDataBase = {
    x: days,
    y: expenditures,
  };

  // Create mean line (horizontal line)
  const meanLine: LineChartDataBase = {
    x: [String(1), String(Math.min(currentDay, daysInMonth))],
    y: [meanBalance, meanBalance],
  };

  return [expenditureLine, meanLine];
}

export const generateExpenditureLineChartData = (
  data: LineChartDataBase[] = generateExpenditureLineData()
): Plotly.Data[] => {
  return data.map((line) => ({
    x: line.x,
    y: line.y,
    type: "scatter",
  })) as unknown as Partial<PlotData>[];
};
