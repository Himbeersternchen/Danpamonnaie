import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface StackProps extends Styling {
  children: ReactNode;
  spacing?: 1 | 2 | 3 | 4 | 6 | 8;
  direction?: "vertical" | "horizontal";
}

export function Stack({
  children,
  spacing = 3,
  direction = "vertical",
  className = "",
}: StackProps) {
  const classes =
    direction === "vertical"
      ? `space-y-${spacing}`
      : `space-x-${spacing}` + ` ${className}`;

  return <div className={classes}>{children}</div>;
}
