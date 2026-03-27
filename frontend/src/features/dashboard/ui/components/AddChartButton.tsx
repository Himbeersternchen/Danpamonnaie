import { useEffect, useRef, useState } from "react";
import useWindowWidth from "../../../../hooks/useWindowWidth";
import { useDanpaStore } from "../../../zustand/store";
import { DASHBOARD_CONFIG } from "../../constants/dashboard";
import { ChartType } from "../../types";

interface AddChartButtonProps {
  onAddChart: (type: ChartType) => void;
}

export function AddChartButton({ onAddChart }: AddChartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const chartTypes = useDanpaStore((state) => state.chartTypes);
  const isMobile = useWindowWidth() < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleChartSelect = (type: ChartType) => {
    onAddChart(type);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={popupRef}>
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-56">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-700 px-3 py-2 border-b border-gray-100">
              Add Chart
            </h3>
            <div className="mt-1">
              {chartTypes.map((chart) => (
                <button
                  key={chart.type}
                  onClick={() => handleChartSelect(chart.type)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 hover:scale-105 rounded-lg transition-all duration-150"
                >
                  <span className="text-lg">{chart.icon}</span>
                  <span className="font-medium">{chart.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isMobile ? "w-9 h-9" : "w-14 h-14"} bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 active:scale-100 transition-all duration-200 flex items-center justify-center`}
      >
        <svg
          className={`${isMobile ? "w-4 h-4" : "w-6 h-6"} transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>
    </div>
  );
}
