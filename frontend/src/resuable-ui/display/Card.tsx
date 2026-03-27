import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface CardProps extends Styling {
  children: ReactNode;
  shadow?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg";
  background?: "white" | "gray-50" | "gray-100";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  shadow = "md",
  rounded = "lg",
  background = "white",
  padding = "md",
  className = "",
}: CardProps) {
  const classes = [
    background ? `bg-${background}` : "",
    shadow !== "none" ? `shadow${shadow !== "md" ? `-${shadow}` : ""}` : "",
    rounded !== "none" ? `rounded${rounded !== "md" ? `-${rounded}` : ""}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const paddingClasses =
    padding === "lg"
      ? "px-4 py-5 sm:p-6"
      : padding === "md"
        ? "p-4"
        : padding === "sm"
          ? "p-2"
          : "";

  return (
    <div className={classes}>
      {padding !== "none" && <div className={paddingClasses}>{children}</div>}
      {padding === "none" && children}
    </div>
  );
}
