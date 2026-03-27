import React, { useRef, useState } from "react";
import useWindowWidth from "../../../../hooks/useWindowWidth";
import { useDanpaStore } from "../../../zustand/store";
import {
  MAX_HEIGHT,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
} from "../../constants/chart";
import {
  DATE_HEIGHT_OFFSET,
  DASHBOARD_CONFIG,
  MOBILE_CHART_WIDTH_PROPORTION,
} from "../../constants/dashboard";
import { DashboardItem } from "../../types";

interface ResizableChartProps {
  item: DashboardItem;
  children: React.ReactNode;
}

type ResizeDirection = "both" | "width" | "height";

export function ResizableChart({ item, children }: ResizableChartProps) {
  const updateItem = useDanpaStore((state) => state.updateItem);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const isMobile = useWindowWidth() < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;
  const isTouchDevice = navigator.maxTouchPoints > 0;
  const maxWidthProportion = isMobile ? MOBILE_CHART_WIDTH_PROPORTION : MAX_WIDTH;

  const applyResize = (clientX: number, clientY: number, direction: ResizeDirection) => {
    let newWidth = startSize.current.width;
    let newHeight = startSize.current.height;

    if (direction === "both" || direction === "width") {
      const deltaX = clientX - startPos.current.x;
      newWidth = Math.min(
        maxWidthProportion * window.innerWidth,
        Math.max(MIN_WIDTH, startSize.current.width + deltaX)
      );
    }

    if (direction === "both" || direction === "height") {
      const deltaY = clientY - startPos.current.y;
      newHeight = Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, startSize.current.height + deltaY)
      );
    }

    updateItem(item.id, { ...item, width: newWidth, height: newHeight });
  };

  const createResizeHandler = (direction: ResizeDirection) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { width: item.width, height: item.height };

      const handleMouseMove = (e: MouseEvent) => {
        applyResize(e.clientX, e.clientY, direction);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
  };

  const createTouchResizeHandler = (direction: ResizeDirection) => {
    return (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      setIsResizing(true);
      startPos.current = { x: touch.clientX, y: touch.clientY };
      startSize.current = { width: item.width, height: item.height };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        applyResize(touch.clientX, touch.clientY, direction);
      };

      const handleTouchEnd = () => {
        setIsResizing(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    };
  };

  return (
    <div
      ref={resizeRef}
      className="relative group"
      style={{ width: item.width, height: item.height + DATE_HEIGHT_OFFSET }}
    >
      {children}

      {/* Resize Handle - Bottom Right Corner */}
      <div
        className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group-hover:opacity-60 hover:opacity-100 transition-opacity duration-200 ${
          isResizing ? "opacity-100" : isTouchDevice ? "opacity-20" : "opacity-0"
        }`}
        onMouseDown={createResizeHandler("both")}
        onTouchStart={createTouchResizeHandler("both")}
        style={{
          background:
            "linear-gradient(-45deg, transparent 30%, #374151 30%, #374151 70%, transparent 70%)",
        }}
      />

      {/* Resize Handle - Right Edge */}
      <div
        className={`absolute top-0 right-0 w-3 h-full cursor-e-resize group-hover:opacity-30 hover:opacity-60 transition-opacity duration-200 ${
          isResizing ? "opacity-60" : isTouchDevice ? "opacity-10" : "opacity-0"
        }`}
        onMouseDown={createResizeHandler("width")}
        onTouchStart={createTouchResizeHandler("width")}
        style={{ backgroundColor: isResizing ? "#374151" : "transparent" }}
      />

      {/* Resize Handle - Bottom Edge */}
      <div
        className={`absolute bottom-0 left-0 w-full h-3 cursor-s-resize group-hover:opacity-30 hover:opacity-60 transition-opacity duration-200 ${
          isResizing ? "opacity-60" : isTouchDevice ? "opacity-10" : "opacity-0"
        }`}
        onMouseDown={createResizeHandler("height")}
        onTouchStart={createTouchResizeHandler("height")}
        style={{ backgroundColor: isResizing ? "#374151" : "transparent" }}
      />
    </div>
  );
}
