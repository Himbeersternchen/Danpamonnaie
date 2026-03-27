import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Styling } from "../types/common-types";

interface NavLinkProps extends Styling {
  to: string;
  children: ReactNode;
  isActive?: boolean;
}

export function NavLink({
  to,
  children,
  isActive = false,
  className = "",
}: NavLinkProps) {
  const baseClasses =
    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  const activeClasses =
    "border-gray-900 text-gray-900 bg-gray-100 transition-colors duration-200";
  const inactiveClasses =
    "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-900";

  const classes = `${baseClasses} ${
    isActive ? activeClasses : inactiveClasses
  } ${className}`;

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}
