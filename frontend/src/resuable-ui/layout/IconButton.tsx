import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ReactNode } from "react";

interface DragButtonProps {
  listeners?: SyntheticListenerMap;
  icon?: ReactNode;
  tooltip?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function IconButton({
  listeners,
  icon,
  tooltip = "drag me",
  onClick,
}: DragButtonProps) {
  return (
    <button
      {...listeners}
      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-110 transition-all duration-200 group"
      title={tooltip}
      onClick={onClick}
    >
      {icon}
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {tooltip}
      </span>
    </button>
  );
}
