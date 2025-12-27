"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";

interface WindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  zIndex?: number;
  onClose: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onFocus?: () => void;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

export default function Window({
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  zIndex = 50,
  onClose,
  onPositionChange,
  onSizeChange,
  onFocus,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use refs to track current values for mouseup handler (avoids stale closure)
  const positionRef = useRef(position);
  positionRef.current = position;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  // Track if position has been manually set (dragged)
  const hasBeenDragged = useRef(false);
  // Track if size has been manually changed (resized)
  const hasBeenResized = useRef(false);

  // Animate in on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);


  // Update position when initialPosition prop changes (only if never dragged in this session)
  useEffect(() => {
    if (!isDragging && !hasBeenDragged.current) {
      const needsUpdate =
        position.x !== initialPosition.x || position.y !== initialPosition.y;
      if (needsUpdate) {
        setPosition(initialPosition);
      }
    }
  }, [
    initialPosition.x,
    initialPosition.y,
    isDragging,
    position.x,
    position.y,
  ]);

  // Update size when initialSize prop changes (only if never manually resized)
  useEffect(() => {
    if (!isResizing && !hasBeenResized.current) {
      const needsUpdate =
        size.width !== initialSize.width || size.height !== initialSize.height;
      if (needsUpdate) {
        setSize(initialSize);
      }
    }
  }, [
    initialSize.width,
    initialSize.height,
    isResizing,
    size.width,
    size.height,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        hasBeenDragged.current = true;
        onPositionChange?.(positionRef.current);
      }
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
        const newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        hasBeenResized.current = true;
        onSizeChange?.(sizeRef.current);
      }
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, onSizeChange]);

  return (
    <div
      className={`absolute select-none flex flex-col bg-[#CCCCCC] border border-[#262626] box-border p-[5px] ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } ${isDragging || isResizing ? "" : "transition-[opacity,transform] duration-150 ease-out"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex,
        boxShadow:
          "inset 1px 0 0 #BBBBBB, inset 0 1px 0 #BBBBBB, inset -1px 0 0 #8A8A8A, inset 0 -1px 0 #8A8A8A",
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="flex items-center h-7 bg-[#CCCCCC] cursor-grab active:cursor-grabbing shrink-0"
        onMouseDown={handleMouseDown}
      >
        {/* Close button */}
        <div className="flex items-center gap-1 shrink-0 ">
          <WindowButton
          onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onClose()}
          />
        </div>

        {/* Striped title area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden h-[18px] bg-[#DDDDDD] mx-1.5">
          {/* Horizontal stripes */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, #999999 2px, #999999 3px)`,
            }}
          />
          {/* Left edge highlight */}
          <div className="absolute left-0 top-0 w-px h-full bg-[#EEEEEE]" />
          {/* Right edge shadow */}
          <div className="absolute right-0 top-0 w-px h-full bg-[#C5C5C5]" />
          {/* Title text */}
          <span className="relative z-10 px-3 text-sm font-bold text-[#262626] bg-[#CCCCCC]">
            {title}
          </span>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <WindowButton onMouseDown={(e) => e.stopPropagation()} />
          <WindowButton onMouseDown={(e) => e.stopPropagation()} />
        </div>
          </div>

      {/* Content area with scrollbars */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Content row */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Window Content with native styled scrollbar */}
          <div
            ref={contentRef}
            className="retro-scrollbar bg-white overflow-y-auto overflow-x-hidden flex-1 min-w-0 relative border border-[#262626] shadow-[-1px_0_0_#8A8A8A,0_-1px_0_#8A8A8A]"
          >
            <div className="p-4">{children}</div>
        </div>
      </div>

        {/* Bottom scrollbar + resize corner row */}
        <div className="h-[17px] flex shrink-0">
          {/* Bottom scrollbar - decorative, no functionality */}
          <div className="flex-1 bg-[#AAAAAA] flex border-t border-l border-[#262626]">
            {/* Empty scroll track */}
            <div className="flex-1 bg-[#AAAAAA]" />

            {/* Arrow buttons at right */}
            <div className="flex flex-row">
              {/* Scroll left button */}
              <div 
                className="w-[17px] bg-[#DDD] border border-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#CCC] active:bg-[#BBB]"
                style={{ boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 8 5" fill="none" className="rotate-90">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.5 3.5L3.5 3.5L3.5 3L3 3L3 2.5L2.5 2.5L2.5 2L2 2L2 1.5L1.5 1.5L1.5 1L6.5 1L6.5 1.5L6 1.5L6 2L5.5 2L5.5 2.5L5 2.5L5 3L4.5 3L4.5 3.5Z" fill="#262626"/>
                </svg>
      </div>
              {/* Scroll right button */}
              <div 
                className="w-[17px] bg-[#DDD] border border-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#CCC] active:bg-[#BBB]"
                style={{ boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 8 5" fill="none" className="-rotate-90">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.5 3.5L3.5 3.5L3.5 3L3 3L3 2.5L2.5 2.5L2.5 2L2 2L2 1.5L1.5 1.5L1.5 1L6.5 1L6.5 1.5L6 1.5L6 2L5.5 2L5.5 2.5L5 2.5L5 3L4.5 3L4.5 3.5Z" fill="#262626"/>
                </svg>
              </div>
        </div>
      </div>

          {/* Resize corner */}
          <div
            className="w-[17px] h-[17px] bg-[#CCCCCC] cursor-se-resize flex items-center justify-center border-l border-t border-[#262626]"
            onMouseDown={handleResizeMouseDown}
          >
            <Image
              src="/resize-icon.png"
              alt="Resize"
              width={11}
              height={11}
              className="pointer-events-none"
          />
        </div>
        </div>
      </div>
    </div>
  );
}

// Reusable window button component (close, zoom, minimize)
function WindowButton({
  onClick,
  onMouseDown,
}: {
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="relative cursor-pointer shrink-0 w-5 h-5"
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Outer highlight - top edge */}
      <div className="absolute top-px left-px right-0.5 h-px bg-[#808080]" />
      {/* Outer highlight - left edge */}
      <div className="absolute top-px left-px bottom-0.5 w-px bg-[#808080]" />
      {/* Outer shadow - bottom edge */}
      <div className="absolute bottom-px left-px right-px h-px bg-white" />
      {/* Outer shadow - right edge */}
      <div className="absolute top-px right-px bottom-px w-px bg-white" />
      {/* Inner border - top edge */}
      <div className="absolute top-0.5 left-0.5 right-[3px] h-px bg-[#262626]" />
      {/* Inner border - left edge */}
      <div className="absolute top-0.5 left-0.5 bottom-[3px] w-px bg-[#262626]" />
      {/* Inner border - bottom edge */}
      <div className="absolute bottom-0.5 left-0.5 right-0.5 h-px bg-[#262626]" />
      {/* Inner border - right edge */}
      <div className="absolute top-0.5 right-0.5 bottom-0.5 w-px bg-[#262626]" />
      {/* Innermost highlight - top edge */}
      <div className="absolute top-[3px] left-[3px] right-1 h-px bg-[#DFDFDF] z-[2]" />
      {/* Innermost highlight - left edge */}
      <div className="absolute top-[3px] left-[3px] bottom-1 w-px bg-[#DFDFDF] z-[2]" />
      {/* Innermost shadow - bottom edge */}
      <div className="absolute bottom-[3px] left-1 right-[3px] h-px bg-[#808080] z-[2]" />
      {/* Innermost shadow - right edge */}
      <div className="absolute top-1 right-[3px] bottom-[3px] w-px bg-[#808080] z-[2]" />
      {/* Center fill with gradient */}
      <div className="absolute top-[3px] left-[3px] right-[3px] bottom-[3px] bg-gradient-to-b from-[#CCCCCC] to-[#AAAAAA]" />
    </div>
  );
}