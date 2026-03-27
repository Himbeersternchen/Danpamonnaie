import { PlotData } from "plotly.js";

export interface PieChartData {
  values: number[];
  labels: string[];
  type: "pie";
}

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
  "Home Improvement",
  "Insurance",
];

const TRANSACTION_TYPES = [
  "Debit Card",
  "ACH/Direct Deposit",
  "Wire Transfer",
  "Check",
  "ATM Withdrawal",
  "Mobile Payment",
  "Online Transfer",
  "Automatic Payment",
];

export function generateMerchantCategoriesPieData(): PieChartData {
  const categories = MERCHANT_CATEGORIES.slice(
    0,
    Math.floor(Math.random() * 4) + 6
  ); // 6-9 categories
  const values = categories.map(() => Math.floor(Math.random() * 800) + 200); // $200-$1000

  return {
    values,
    labels: categories,
    type: "pie",
  };
}

export function generateTransactionTypesPieData(): PieChartData {
  const types = TRANSACTION_TYPES.slice(0, Math.floor(Math.random() * 3) + 5); // 5-7 types
  const values = types.map(() => Math.floor(Math.random() * 800) + 200); // $200-$1000

  return {
    values,
    labels: types,
    type: "pie",
  };
}

export const generateMerchantCategoriesPieChartData = (
  data: PieChartData = generateMerchantCategoriesPieData()
): Plotly.Data[] => {
  return [
    {
      values: data.values,
      labels: data.labels,
      type: data.type,
    },
  ] as unknown as Partial<PlotData>[];
};

export const generateTransactionTypesPieChartData = (
  data: PieChartData = generateTransactionTypesPieData()
): Plotly.Data[] => {
  return [
    {
      values: data.values,
      labels: data.labels,
      type: data.type,
    },
  ] as unknown as Partial<PlotData>[];
};
