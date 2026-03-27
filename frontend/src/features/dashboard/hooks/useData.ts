/**
 * This file previously contained individual data fetching hooks (useLineData, useBarData, etc.)
 * These have been removed as data fetching is now centralized in the Zustand store.
 *
 * Data fetching is handled by:
 * - fetchAllChartData() for global data in slice.tsx
 * - fetchItemData() for individual chart data in slice.tsx
 *
 * Charts read data directly from the store instead of using hooks.
 */

// This file is kept for future custom hooks if needed
export {};
