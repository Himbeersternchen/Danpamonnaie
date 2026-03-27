import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface FlexProps extends Styling {
  children: ReactNode;
  direction?: "row" | "col";
  justify?: "start" | "center" | "between" | "around" | "evenly" | "end";
  align?: "start" | "center" | "end" | "stretch";
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
}

export function Flex({
  children,
  direction = "row",
  justify,
  align,
  gap,
  className = "",
}: FlexProps) {
  const classes = [
    "flex",
    direction === "col" ? "flex-col" : "flex-row",
    justify ? `justify-${justify}` : "",
    align ? `items-${align}` : "",
    gap ? `gap-${gap}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
