import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface ContainerProps extends Styling {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
}

export function Container({
  children,
  maxWidth = "7xl",
  className = "",
}: ContainerProps) {
  const maxWidthClass = `max-w-${maxWidth}`;

  return (
    <div className={`${maxWidthClass} mx-auto w-[95%] sm:w-full lg:px-16 ${className}`}>
      {children}
    </div>
  );
}
