import React from "react";
import { ChartControls, ChartControlsProps } from "./ChartControls";

export function MobileControlsMenu({ listeners, onDelete, onToggleDatePicker }: ChartControlsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 z-4" onClick={() => setOpen(false)} />}

      <div
        className="absolute top-2 left-2 z-5 h-8 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dot — disappears instantly on open, appears after controls fully collapse on close */}
        <button
          className={`absolute w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center transition-opacity ${
            open ? "opacity-0 pointer-events-none duration-0" : "opacity-100 duration-0 delay-300"
          }`}
          onClick={() => setOpen(true)}
        >
          <span className="text-gray-600 text-xs font-bold leading-none">···</span>
        </button>

        {/* Controls — expand left-to-right, collapse right-to-left */}
        <div className={`flex gap-1 overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-w-[120px]" : "max-w-0 pointer-events-none"}`}>
          <ChartControls listeners={listeners} onDelete={onDelete} onToggleDatePicker={onToggleDatePicker} />
        </div>
      </div>
    </>
  );
}
