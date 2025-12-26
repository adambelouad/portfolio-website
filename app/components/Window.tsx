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
  const [scrollInfo, setScrollInfo] = useState({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
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

  // Update scroll info when content changes or window resizes
  const updateScrollInfo = () => {
    if (contentRef.current) {
      setScrollInfo({
        scrollTop: contentRef.current.scrollTop,
        scrollHeight: contentRef.current.scrollHeight,
        clientHeight: contentRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    updateScrollInfo();
    
    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      updateScrollInfo();
    });
    
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [children]);

  // Also update scroll info when window size changes
  useEffect(() => {
    updateScrollInfo();
  }, [size]);

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
        {/* Content + Right scrollbar row */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Window Content */}
      <div
            ref={contentRef}
            className="bg-white overflow-auto flex-1 min-w-0 relative border border-[#262626] shadow-[-1px_0_0_#8A8A8A,0_-1px_0_#8A8A8A] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setScrollInfo({
                scrollTop: target.scrollTop,
                scrollHeight: target.scrollHeight,
                clientHeight: target.clientHeight,
              });
        }}
      >
        <div className="p-4">{children}</div>
      </div>

          {/* Right scrollbar */}
          <div className="w-[15px] bg-[#AAAAAA] flex flex-col border-l border-[#262626]">
            {/* Scroll track with thumb */}
            <div 
              className="flex-1 relative bg-[#AAAAAA] cursor-pointer"
              onClick={(e) => {
                // Click on track to scroll to that position
                if (contentRef.current && scrollInfo.scrollHeight > scrollInfo.clientHeight) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickY = e.clientY - rect.top;
                  const trackHeight = rect.height;
                  const scrollRatio = clickY / trackHeight;
                  const maxScroll = scrollInfo.scrollHeight - scrollInfo.clientHeight;
                  contentRef.current.scrollTop = scrollRatio * maxScroll;
                }
              }}
            >
              {/* Scrollbar thumb */}
              {scrollInfo.scrollHeight > scrollInfo.clientHeight && (
                <div 
                  className="absolute left-0 right-0 bg-[#8888CC] border border-[#262626] cursor-grab active:cursor-grabbing"
        style={{
                    top: `${(scrollInfo.scrollTop / (scrollInfo.scrollHeight - scrollInfo.clientHeight)) * (100 - (scrollInfo.clientHeight / scrollInfo.scrollHeight) * 100)}%`,
                    height: `${Math.max(15, (scrollInfo.clientHeight / scrollInfo.scrollHeight) * 100)}%`,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startY = e.clientY;
                    const startScrollTop = scrollInfo.scrollTop;
                    const trackHeight = e.currentTarget.parentElement?.clientHeight || 1;
                    const thumbHeight = e.currentTarget.clientHeight;
                    const scrollableTrack = trackHeight - thumbHeight;
                    const scrollableHeight = scrollInfo.scrollHeight - scrollInfo.clientHeight;
                    
                    const handleMouseMove = (moveE: MouseEvent) => {
                      const deltaY = moveE.clientY - startY;
                      const scrollDelta = (deltaY / scrollableTrack) * scrollableHeight;
                      if (contentRef.current) {
                        contentRef.current.scrollTop = Math.max(0, Math.min(scrollableHeight, startScrollTop + scrollDelta));
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  {/* Thumb grip lines */}
                  <div className="absolute inset-x-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                    <div className="h-px bg-white opacity-80" />
                    <div className="h-px bg-[#262626] opacity-30" />
                    <div className="h-px bg-white opacity-80" />
                    <div className="h-px bg-[#262626] opacity-30" />
                    <div className="h-px bg-white opacity-80" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Arrow buttons at bottom */}
            <div className="flex flex-col">
              {/* Scroll up button */}
              <div 
                className="h-[15px] bg-[#CCCCCC] border-t border-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#BBBBBB] active:bg-[#999999]"
                onClick={() => {
                  if (contentRef.current) {
                    contentRef.current.scrollTop -= 30;
                  }
                }}
              >
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-[#262626]" />
              </div>
              {/* Scroll down button */}
              <div 
                className="h-[15px] bg-[#CCCCCC] border-t border-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#BBBBBB] active:bg-[#999999]"
                onClick={() => {
                  if (contentRef.current) {
                    contentRef.current.scrollTop += 30;
                  }
                }}
              >
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-[#262626]" />
              </div>
            </div>
        </div>
      </div>

        {/* Bottom scrollbar + resize corner row */}
        <div className="h-[15px] flex">
          {/* Bottom scrollbar - just track, no thumb */}
          <div className="flex-1 bg-[#AAAAAA] flex border-t border-[#262626]">
            {/* Empty scroll track */}
            <div className="flex-1 bg-[#AAAAAA]" />

            {/* Arrow buttons at right */}
            <div className="flex flex-row">
              {/* Scroll left button */}
              <div className="w-[15px] bg-[#CCCCCC] border-l border-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#BBBBBB]">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#262626]" />
              </div>
              {/* Scroll right button */}
              <div className="w-[15px] bg-[#CCCCCC] border-l border-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#BBBBBB]">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-[#262626]" />
              </div>
            </div>
        </div>

          {/* Resize corner */}
          <div
            className="w-[15px] h-[15px] bg-[#CCCCCC] cursor-se-resize flex items-center justify-center border-l border-t border-[#262626]"
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