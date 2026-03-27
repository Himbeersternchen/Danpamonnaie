import { ButtonHTMLAttributes, ReactNode } from "react";
import { Styling } from "../types/common-types";

interface ButtonProps extends Styling, ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex justify-center items-center font-medium rounded-md focus:outline-none transition-all duration-200 ease-out hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const variantClasses = {
    primary:
      "text-white bg-gray-900 hover:bg-gray-800 shadow-md hover:shadow-xl",
    secondary:
      "text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm hover:shadow-md border border-gray-300",
    danger: "text-white bg-red-800 hover:bg-red-700 shadow-md hover:shadow-xl",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
