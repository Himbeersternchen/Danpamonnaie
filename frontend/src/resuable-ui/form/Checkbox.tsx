import { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  color?: "blue" | "green" | "red" | "gray";
}

export function Checkbox({
  label,
  color = "blue",
  className = "",
  ...props
}: CheckboxProps) {
  const checkboxClasses = `h-4 w-4 text-${color}-600 focus:ring-${color}-500 border-gray-300 rounded ${className}`;

  if (label) {
    return (
      <div className="flex items-center">
        <input type="checkbox" className={checkboxClasses} {...props} />
        <label className="ml-3 text-sm text-gray-700">{label}</label>
      </div>
    );
  }

  return <input type="checkbox" className={checkboxClasses} {...props} />;
}
