import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface GridProps extends Styling {
  children: ReactNode;
  direction?: "row" | "col";
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
}

export function Grid({
  children,
  direction = "col",
  gap = 4,
  className = "",
}: GridProps) {
  const classes = [
    "flex",
    direction === "col" ? "flex-col" : "flex-row",
    direction === "row" ? "flex-1" : "",
    gap ? `gap-${gap}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
