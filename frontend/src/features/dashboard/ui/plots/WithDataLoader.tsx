import React from "react";

interface WithDataLoaderProps<T> {
  width: number;
  height: number;
  data: T | null;
  loading: boolean;
  error: string | null;
  children: (data: T | null) => React.ReactNode;
}

/**
 * WithDataLoader: Pure UI component for handling loading/error states
 * Data should be provided from the central store, not fetched here
 */
export function WithDataLoader<T>({
  width,
  height,
  data,
  loading,
  error,
  children,
}: WithDataLoaderProps<T>) {
  if (loading) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center bg-gray-50"
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center bg-red-50 text-red-600"
      >
        Error: {error}
      </div>
    );
  }

  return <>{children(data)}</>;
}
