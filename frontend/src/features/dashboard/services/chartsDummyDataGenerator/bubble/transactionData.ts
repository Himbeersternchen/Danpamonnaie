import { PlotData } from "plotly.js";

export interface BubbleChartDataBase {
  x: number[];
  y: number[];
  size: number[];
  text: string[];
  color: string[];
}

export interface BubbleChartConfig {
  mode: "markers";
  type: "scatter";
  marker: {
    size: number[];
    color: string[];
    colorscale?: string;
    showscale?: boolean;
    sizemode: "diameter";
    sizeref: number;
    opacity: number;
  };
  hovertemplate?: string;
}

export interface BubbleChartData
  extends BubbleChartDataBase, BubbleChartConfig {}

const MERCHANT_CATEGORIES = [
  "Grocery Stores",
  "Gas Stations",
  "Restaurants",
  "Online Shopping",
  "Subscriptions",
  "Bills/Utilities",
  "Healthcare",
  "Transportation",
  "Entertainment",
  "Clothing",
];

const CATEGORY_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
  "#6b7280", // gray
];

export const getBubbleChartConfig = (
  size: number[],
  color: string[]
): BubbleChartConfig => ({
  mode: "markers",
  type: "scatter",
  marker: {
    size,
    color,
    sizemode: "diameter",
    sizeref: (2.0 * Math.max(...size)) / 40 ** 2, // Scale bubbles appropriately
    opacity: 0.7,
  },
  hovertemplate: "%{text}<extra></extra>",
});

export function generateTransactionBubbleData(): BubbleChartDataBase {
  const dataPoints = Math.floor(Math.random() * 30) + 20; // 20-49 transactions

  const x: number[] = []; // Expenditure Amount
  const y: number[] = []; // Median Expenditure
  const size: number[] = []; // Expenditure Frequency
  const color: string[] = []; // Merchant Category Color
  const text: string[] = []; // Hover text

  for (let i = 0; i < dataPoints; i++) {
    // Expenditure amount: $10 - $2000
    const amount = Math.floor(Math.random() * 1990) + 10;
    x.push(amount);

    // Median expenditure: $50 - $800 monthly
    const median = Math.floor(Math.random() * 750) + 50;
    y.push(median);

    // Expenditure frequency: 1 - 50 transactions
    const frequency = Math.floor(Math.random() * 50) + 1;
    size.push(frequency);

    // Random merchant category
    const categoryIndex = Math.floor(
      Math.random() * MERCHANT_CATEGORIES.length
    );
    const category = MERCHANT_CATEGORIES[categoryIndex];
    color.push(CATEGORY_COLORS[categoryIndex]);

    // Hover text
    text.push(
      `Amount: $${amount}<br>` +
        `Median: $${median}/month<br>` +
        `Frequency: ${frequency} transactions<br>` +
        `Category: ${category}`
    );
  }

  return {
    x,
    y,
    size,
    text,
    color,
  };
}

export const generateTransactionBubbleChartData = (
  data: BubbleChartDataBase = generateTransactionBubbleData()
): Plotly.Data[] => {
  return [
    {
      x: data.x,
      y: data.y,
      text: data.text,
      ...getBubbleChartConfig(data.size, data.color),
    },
  ] as unknown as Partial<PlotData>[];
};
