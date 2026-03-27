import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface NavProps extends Styling {
  children: ReactNode;
}

export function Nav({ children, className = "" }: NavProps) {
  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      {children}
    </nav>
  );
}
