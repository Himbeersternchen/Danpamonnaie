import { SankeyNode } from "plotly.js/lib/sankey";

export interface ExpenditureNode {
  id: string;
  label: string;
  value: number;
}

export interface ExpenditureLink {
  source: number;
  target: number;
  value: number;
}

export interface ExpenditureSankeyData {
  nodes: ExpenditureNode[];
  links: ExpenditureLink[];
}

const PAYMENT_TERMS = [
  "Cash",
  "Credit Card",
  "Bank Transfer",
  "Check",
  "Digital Wallet",
];
const TRANSACTION_PURPOSES = [
  "Groceries",
  "Utilities",
  "Rent",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Insurance",
  "Restaurants",
  "Clothing",
  "Internet",
  "Phone",
  "Gas",
  "Electricity",
  "Water",
  "Car Maintenance",
  "Public Transport",
  "Movies",
  "Books",
  "Gym Membership",
  "Doctor Visits",
  "Pharmacy",
  "School Supplies",
  "Online Courses",
  "Life Insurance",
  "Car Insurance",
  "Home Insurance",
  "Shopping",
  "Travel",
  "Subscriptions",
];
const CATEGORIES = ["Essential", "Lifestyle", "Investment", "Emergency"];

export function generateExpenditureDummyDataForSanky(): ExpenditureSankeyData {
  const nodes: ExpenditureNode[] = [];
  const links: ExpenditureLink[] = [];

  // Stage 1: Total Expenditure (single node, index 0)
  nodes.push({
    id: "total",
    label: "Total Expenditure",
    value: 5000,
  });

  // Stage 2: Payment Terms (indices 1-5)
  const paymentStartIndex = 1;
  PAYMENT_TERMS.forEach((term, index) => {
    const value = Math.floor(Math.random() * 800) + 300;
    nodes.push({
      id: `payment_${index}`,
      label: term,
      value,
    });

    // Link from total (stage 1) to payment term (stage 2)
    links.push({
      source: 0,
      target: paymentStartIndex + index,
      value: value,
    });
  });

  // Stage 3: Transaction Purposes (indices 6-13)
  const purposeStartIndex = paymentStartIndex + PAYMENT_TERMS.length;
  TRANSACTION_PURPOSES.forEach((purpose, index) => {
    const value = Math.floor(Math.random() * 400) + 100;
    nodes.push({
      id: `purpose_${index}`,
      label: purpose,
      value,
    });

    // Link from random payment term (stage 2) to purpose (stage 3)
    const randomPaymentIndex =
      paymentStartIndex + Math.floor(Math.random() * PAYMENT_TERMS.length);
    links.push({
      source: randomPaymentIndex,
      target: purposeStartIndex + index,
      value: value,
    });
  });

  // Stage 4: Categories (indices 14-17)
  const categoryStartIndex = purposeStartIndex + TRANSACTION_PURPOSES.length;
  CATEGORIES.forEach((category, index) => {
    const value = Math.floor(Math.random() * 300) + 100;
    nodes.push({
      id: `category_${index}`,
      label: category,
      value,
    });

    // Link from 2-3 random purposes (stage 3) to category (stage 4)
    const numConnections = Math.floor(Math.random() * 2) + 2; // 2-3 connections
    const selectedPurposes = Array.from(
      { length: numConnections },
      () =>
        purposeStartIndex +
        Math.floor(Math.random() * TRANSACTION_PURPOSES.length)
    );

    selectedPurposes.forEach((purposeIndex) => {
      links.push({
        source: purposeIndex,
        target: categoryStartIndex + index,
        value: Math.floor(Math.random() * 150) + 50,
      });
    });
  });

  return { nodes, links };
}

// Mobile version: only shows the last 2 stages of the Sankey flow (e.g. Purpose → Category)
// Uses BFS depth assignment to detect the deepest 2 levels — no reliance on node.id
export const generateMobileSankyPlotData = (
  expenditureData: ExpenditureSankeyData = generateExpenditureDummyDataForSanky()
): Plotly.Data[] => {
  const { nodes, links } = expenditureData;

  // BFS: assign max depth to each node
  const sourceSet = new Set(links.map((l) => l.source));
  const targetSet = new Set(links.map((l) => l.target));
  const depth = new Map<number, number>();
  nodes.forEach((_, i) => {
    if (sourceSet.has(i) && !targetSet.has(i)) depth.set(i, 0);
  });
  let changed = true;
  while (changed) {
    changed = false;
    links.forEach((l) => {
      const srcDepth = depth.get(l.source);
      if (srcDepth !== undefined) {
        const newDepth = srcDepth + 1;
        if ((depth.get(l.target) ?? -1) < newDepth) {
          depth.set(l.target, newDepth);
          changed = true;
        }
      }
    });
  }

  // Keep only nodes at maxDepth and maxDepth-1
  let maxDepth = 0;
  depth.forEach((d) => { if (d > maxDepth) maxDepth = d; });
  const keepIndices = new Set<number>();
  depth.forEach((d, i) => { if (d >= maxDepth - 1) keepIndices.add(i); });

  // Determine which kept indices are leaf nodes (for coloring)
  const leafIndices = new Set<number>();
  nodes.forEach((_, i) => {
    if (targetSet.has(i) && !sourceSet.has(i)) leafIndices.add(i);
  });

  // Build old-index → new-index mapping
  const indexMap = new Map<number, number>();
  let newIndex = 0;
  nodes.forEach((_, i) => {
    if (keepIndices.has(i)) indexMap.set(i, newIndex++);
  });

  // Preserve original indices for coloring
  const keptOriginalIndices: number[] = [];
  nodes.forEach((_, i) => {
    if (keepIndices.has(i)) keptOriginalIndices.push(i);
  });

  const filteredNodes = keptOriginalIndices.map((i) => nodes[i]);
  const filteredLinks = links
    .filter((l) => keepIndices.has(l.source) && keepIndices.has(l.target))
    .map((l) => ({
      source: indexMap.get(l.source)!,
      target: indexMap.get(l.target)!,
      value: l.value,
    }));

  return [
    {
      type: "sankey",
      node: {
        pad: 10,
        thickness: 20,
        line: { color: "black", width: 0.5 },
        label: filteredNodes.map((n) => n.label),
        color: keptOriginalIndices.map((i) =>
          leafIndices.has(i) ? "#f59e0b" : "#10b981"
        ),
        align: "left",
      } as unknown as Partial<SankeyNode>,
      link: {
        source: filteredLinks.map((l) => l.source),
        target: filteredLinks.map((l) => l.target),
        value: filteredLinks.map((l) => l.value),
      },
    },
  ];
};

export const generateSankyPlotData = (
  expenditureData: ExpenditureSankeyData = generateExpenditureDummyDataForSanky()
): Plotly.Data[] => {
  return [
    {
      type: "sankey",
      node: {
        pad: 10,
        thickness: 20,
        line: { color: "black", width: 0.5 },
        label: expenditureData.nodes.map((node) => node.label),
        color: expenditureData.nodes.map((_, index) => {
          if (index === 0) return "#ef4444"; // Total - red
          if (index >= 1 && index <= 5) return "#3b82f6"; // Payment terms - blue
          if (index >= 6 && index <= 35) return "#10b981"; // Purposes - green (30 items)
          return "#f59e0b"; // Categories - orange
        }),
        align: "left", // does not exist in type declaration yet
      } as unknown as Partial<SankeyNode>, // type incomplete
      link: {
        source: expenditureData.links.map((link) => link.source),
        target: expenditureData.links.map((link) => link.target),
        value: expenditureData.links.map((link) => link.value),
      },
    },
  ];
};
