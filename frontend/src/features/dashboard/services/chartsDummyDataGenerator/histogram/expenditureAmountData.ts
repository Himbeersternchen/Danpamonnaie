import { PlotData } from "plotly.js";

export interface HistogramDataBase {
  x: number[];
  type: "histogram";
}

export interface HistogramChartConfig {
  nbinsx?: number;
  marker?: {
    color?: string;
    opacity?: number;
  };
  name?: string;
  hovertemplate?: string;
}
export interface HistogramData
  extends HistogramDataBase, HistogramChartConfig {}

export const HISTOGRAM_CHART_CONFIG: HistogramChartConfig = {
  nbinsx: 20, // Number of bins for the histogram
  marker: {
    color: "#3b82f6",
    opacity: 0.7,
  },
  name: "Expenditure Distribution",
  hovertemplate:
    "Amount Range: $%{x}<br>" +
    "Frequency: %{y} transactions<br>" +
    "<extra></extra>",
};

export function generateExpenditureAmountHistogramData(): HistogramDataBase {
  const expenditures: number[] = [];
  const totalTransactions = Math.floor(Math.random() * 200) + 100; // 100-299 transactions

  // Generate expenditure amounts with realistic distribution
  for (let i = 0; i < totalTransactions; i++) {
    // Create a realistic spending distribution with more small amounts
    const random = Math.random();
    let amount: number;

    if (random < 0.4) {
      // 40% small purchases: $1-$50
      amount = Math.floor(Math.random() * 50) + 1;
    } else if (random < 0.7) {
      // 30% medium purchases: $50-$200
      amount = Math.floor(Math.random() * 150) + 50;
    } else if (random < 0.9) {
      // 20% larger purchases: $200-$500
      amount = Math.floor(Math.random() * 300) + 200;
    } else {
      // 10% major purchases: $500-$2000
      amount = Math.floor(Math.random() * 1500) + 500;
    }

    expenditures.push(amount);
  }

  return {
    x: expenditures,
    type: "histogram",
  };
}

export const generateExpenditureAmountHistogramChartData = (
  data: HistogramDataBase = generateExpenditureAmountHistogramData()
): Plotly.Data[] => {
  return [
    {
      x: data.x,
      type: data.type,
      ...HISTOGRAM_CHART_CONFIG,
    },
  ] as unknown as Partial<PlotData>[];
};
