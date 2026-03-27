import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface PageProps extends Styling {
  children: ReactNode;
  background?: "gray-50" | "white" | "gray-100";
  minHeight?: "screen" | "auto";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Page({
  children,
  background = "gray-50",
  minHeight = "screen",
  padding = "lg",
  className = "",
}: PageProps) {
  const classes = [
    minHeight === "screen" ? "min-h-screen" : "",
    background ? `bg-${background}` : "",
    padding === "lg"
      ? "py-8"
      : padding === "md"
        ? "py-4"
        : padding === "sm"
          ? "py-2"
          : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
