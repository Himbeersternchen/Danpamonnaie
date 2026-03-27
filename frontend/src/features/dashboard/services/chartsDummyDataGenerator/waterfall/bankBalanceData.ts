import { PlotData } from "plotly.js";

export interface WaterfallData {
  type: "waterfall";
  x: string[];
  y: number[];
  text: string[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function generateBankBalanceWaterfallData(): WaterfallData {
  const startingBalance = Math.floor(Math.random() * 5000) + 3000; // $3000-$8000
  const months = MONTHS.slice(0, Math.floor(Math.random() * 6) + 6); // 6-12 months

  const x: string[] = ["Starting Balance"];
  const y: number[] = [startingBalance];
  const text: string[] = [`$${startingBalance.toLocaleString()}`];

  let runningTotal = startingBalance;

  // Generate monthly changes
  for (let i = 0; i < months.length; i++) {
    const change = Math.floor(Math.random() * 2000) - 1000; // -$1000 to +$1000
    x.push(months[i]);
    y.push(change);
    text.push(
      change >= 0
        ? `+$${change.toLocaleString()}`
        : `-$${Math.abs(change).toLocaleString()}`
    );
    runningTotal += change;
  }

  // Add ending balance
  x.push("Ending Balance");
  y.push(0); // Waterfall chart calculates totals automatically
  text.push(`$${runningTotal.toLocaleString()}`);

  return {
    type: "waterfall",
    x,
    y,
    text,
  };
}

export const generateWaterfallPlotData = (
  data: WaterfallData = generateBankBalanceWaterfallData()
): Plotly.Data[] => {
  return [
    {
      type: data.type,
      x: data.x,
      textposition: "outside",
      text: data.text,
      y: data.y,
      connector: { line: { color: "rgb(63, 63, 63)" } },
      decreasing: { marker: { color: "#ef4444" } },
      increasing: { marker: { color: "#10b981" } },
      totals: { marker: { color: "#3b82f6" } },
    },
  ] as unknown as Partial<PlotData>[]; // type incomplete
};
