import { JSX, ReactNode } from "react";
import { Styling } from "../types/common-types";

interface HeadingProps extends Styling {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "gray-900" | "gray-700" | "gray-600";
}

export function Heading({
  children,
  level = 1,
  size = "xl",
  weight = "bold",
  color = "gray-900",
  className = "",
}: HeadingProps) {
  const Tag: keyof JSX.IntrinsicElements = `h${level}`;
  const classes = `text-${size} font-${weight} text-${color} ${className}`;

  return <Tag className={classes}>{children}</Tag>;
}
