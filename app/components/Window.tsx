"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

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
    // Small delay to ensure the initial render happens first, then animate in
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
      className="absolute select-none flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex,
        background: "#CCCCCC",
        border: "1px solid #262626",
        boxSizing: "border-box",
        outline: "1px solid #BBBBBB",
        outlineOffset: "-2px",
        boxShadow:
          "inset -2px -2px 0 rgba(38,38,38,0.4), inset 2px 2px 0 rgba(38,38,38,0.1)",
        // Smooth entrance animation
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.95)",
        transition:
          isDragging || isResizing
            ? "none"
            : "opacity 150ms ease-out, transform 150ms ease-out",
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="flex items-center px-2 cursor-grab active:cursor-grabbing shrink-0"
        style={{
          height: "28px",
          background: "#CCCCCC",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Close button */}
        <div
          className="relative cursor-pointer shrink-0"
          style={{ width: "20px", height: "20px", marginRight: "6px" }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          {/* Outer black border */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              //border: "1px solid #000000",
            }}
          />
          {/* White highlight - top edge */}
          <div
            style={{
              position: "absolute",
              top: "1px",
              left: "1px",
              right: "2px",
              height: "1px",
              background: "#808080",
            }}
          />
          {/* White highlight - left edge */}
          <div
            style={{
              position: "absolute",
              top: "1px",
              left: "1px",
              bottom: "2px",
              width: "1px",
              background: "#808080",
            }}
          />
          {/* Dark shadow - bottom edge */}
          <div
            style={{
              position: "absolute",
              bottom: "1px",
              left: "1px",
              right: "1px",
              height: "1px",
              background: "#FFFFFF",
            }}
          />
          {/* Dark shadow - right edge */}
          <div
            style={{
              position: "absolute",
              top: "1px",
              right: "1px",
              bottom: "1px",
              width: "1px",
              background: "#FFFFFF",
            }}
          />
          {/* 2nd inner: solid #262626 border */}
          {/* Top edge */}
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: "2px",
              right: "3px",
              height: "1px",
              background: "#262626",
            }}
          />
          {/* Left edge */}
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: "2px",
              bottom: "3px",
              width: "1px",
              background: "#262626",
            }}
          />
          {/* Bottom edge */}
          <div
            style={{
              position: "absolute",
              bottom: "2px",
              left: "2px",
              right: "2px",
              height: "1px",
              background: "#262626",
            }}
          />
          {/* Right edge */}
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              bottom: "2px",
              width: "1px",
              background: "#262626",
            }}
          />

          {/* 3rd inner: top/left light grey, bottom/right dark grey */}
          {/* Top edge (light grey) */}
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              right: "4px",
              height: "1px",
              background: "#DFDFDF",
              zIndex: 2,
            }}
          />
          {/* Left edge (light grey) */}
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              bottom: "4px",
              width: "1px",
              background: "#DFDFDF",
              zIndex: 2,
            }}
          />
          {/* Bottom edge (dark grey) */}
          <div
            style={{
              position: "absolute",
              bottom: "3px",
              left: "4px",
              right: "3px",
              height: "1px",
              background: "#808080",
              zIndex: 2,
            }}
          />
          {/* Right edge (dark grey) */}
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "3px",
              bottom: "3px",
              width: "1px",
              background: "#808080",
              zIndex: 2,
            }}
          />
          {/* Center fill with gradient */}
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              right: "3px",
              bottom: "3px",
              background: "linear-gradient(180deg, #CCCCCC 0%, #AAAAAA 100%)",
            }}
          />
        </div>

        {/* Striped title area */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{
            height: "18px",
            background: "#DDDDDD",
            marginRight: "6px",
          }}
        >
          {/* Horizontal stripes */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent 2px,
                #999999 2px,
                #999999 3px
              )`,
            }}
          />
          {/* Left edge highlight */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "1px",
              height: "100%",
              background: "#EEEEEE",
            }}
          />
          {/* Right edge shadow */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "1px",
              height: "100%",
              background: "#C5C5C5",
            }}
          />
          {/* Title text */}
          <span
            className="relative z-10 px-3"
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#262626",
              background: "#DDDDDD",
              textShadow: "none",
            }}
          >
            {title}
          </span>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Zoom/Maximize button */}
          <div
            className="relative cursor-pointer"
            style={{ width: "20px", height: "20px" }}
          >
            {/* White highlight - top edge */}
            <div
              style={{
                position: "absolute",
                top: "1px",
                left: "1px",
                right: "2px",
                height: "1px",
                background: "#808080",
              }}
            />
            {/* White highlight - left edge */}
            <div
              style={{
                position: "absolute",
                top: "1px",
                left: "1px",
                bottom: "2px",
                width: "1px",
                background: "#808080",
              }}
            />
            {/* Dark shadow - bottom edge */}
            <div
              style={{
                position: "absolute",
                bottom: "1px",
                left: "1px",
                right: "1px",
                height: "1px",
                background: "#FFFFFF",
              }}
            />
            {/* Dark shadow - right edge */}
            <div
              style={{
                position: "absolute",
                top: "1px",
                right: "1px",
                bottom: "1px",
                width: "1px",
                background: "#FFFFFF",
              }}
            />
            {/* 2nd inner: solid #262626 border */}
            {/* Top edge */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "2px",
                right: "3px",
                height: "1px",
                background: "#262626",
              }}
            />
            {/* Left edge */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "2px",
                bottom: "3px",
                width: "1px",
                background: "#262626",
              }}
            />
            {/* Bottom edge */}
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "2px",
                right: "2px",
                height: "1px",
                background: "#262626",
              }}
            />
            {/* Right edge */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                bottom: "2px",
                width: "1px",
                background: "#262626",
              }}
            />

            {/* 3rd inner: top/left light grey, bottom/right dark grey */}
            {/* Top edge (light grey) */}
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: "3px",
                right: "4px",
                height: "1px",
                background: "#DFDFDF",
                zIndex: 2,
              }}
            />
            {/* Left edge (light grey) */}
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: "3px",
                bottom: "4px",
                width: "1px",
                background: "#DFDFDF",
                zIndex: 2,
              }}
            />
            {/* Bottom edge (dark grey) */}
            <div
              style={{
                position: "absolute",
                bottom: "3px",
                left: "4px",
                right: "3px",
                height: "1px",
                background: "#808080",
                zIndex: 2,
              }}
            />
            {/* Right edge (dark grey) */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "3px",
                bottom: "3px",
                width: "1px",
                background: "#808080",
                zIndex: 2,
              }}
            />
            <div
              className="absolute top-[3px] left-[3px] right-[3px] bottom-[3px]"
              style={{
                background: "linear-gradient(180deg, #CCCCCC 0%, #AAAAAA 100%)",
              }}
            />
          </div>

          {/* Minimize/Collapse button */}
          <div
            className="relative cursor-pointer"
            style={{ width: "20px", height: "20px" }}
          >
            {/* White highlight - top edge */}
            <div
              style={{
                position: "absolute",
                top: "1px",
                left: "1px",
                right: "2px",
                height: "1px",
                background: "#808080",
              }}
            />
            {/* White highlight - left edge */}
            <div
              style={{
                position: "absolute",
                top: "1px",
                left: "1px",
                bottom: "2px",
                width: "1px",
                background: "#808080",
              }}
            />
            {/* Dark shadow - bottom edge */}
            <div
              style={{
                position: "absolute",
                bottom: "1px",
                left: "1px",
                right: "1px",
                height: "1px",
                background: "#FFFFFF",
              }}
            />
            {/* Dark shadow - right edge */}
            <div
              style={{
                position: "absolute",
                top: "1px",
                right: "1px",
                bottom: "1px",
                width: "1px",
                background: "#FFFFFF",
              }}
            />
            {/* 2nd inner: solid #262626 border */}
            {/* Top edge */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "2px",
                right: "3px",
                height: "1px",
                background: "#262626",
              }}
            />
            {/* Left edge */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "2px",
                bottom: "3px",
                width: "1px",
                background: "#262626",
              }}
            />
            {/* Bottom edge */}
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "2px",
                right: "2px",
                height: "1px",
                background: "#262626",
              }}
            />
            {/* Right edge */}
            <div
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                bottom: "2px",
                width: "1px",
                background: "#262626",
              }}
            />

            {/* 3rd inner: top/left light grey, bottom/right dark grey */}
            {/* Top edge (light grey) */}
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: "3px",
                right: "4px",
                height: "1px",
                background: "#DFDFDF",
                zIndex: 2,
              }}
            />
            {/* Left edge (light grey) */}
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: "3px",
                bottom: "4px",
                width: "1px",
                background: "#DFDFDF",
                zIndex: 2,
              }}
            />
            {/* Bottom edge (dark grey) */}
            <div
              style={{
                position: "absolute",
                bottom: "3px",
                left: "4px",
                right: "3px",
                height: "1px",
                background: "#808080",
                zIndex: 2,
              }}
            />
            {/* Right edge (dark grey) */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "3px",
                bottom: "3px",
                width: "1px",
                background: "#808080",
                zIndex: 2,
              }}
            />
            <div
              className="absolute top-[3px] left-[3px] right-[3px] bottom-[3px]"
              style={{
                background: "linear-gradient(180deg, #CCCCCC 0%, #AAAAAA 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Secondary bar (path bar style) */}
      <div
        style={{
          height: "28px",
          background: "#DDDDDD",
          borderTop: "1px solid #262626",
          borderBottom: "1px solid #262626",
          boxShadow:
            "inset 0 2px 0 white, inset 2px 0 0 white, inset 0 -2px 0 rgba(38,38,38,0.4), inset -2px 0 0 rgba(38,38,38,0.4)",
        }}
      />

      {/* Window Content */}
      <div
        className="bg-white overflow-auto flex-1 relative"
        style={{
          boxShadow: "inset 1px 0 0 #262626",
        }}
      >
        <div className="p-4">{children}</div>
      </div>

      {/* Bottom bar with scrollbar area */}
      <div
        className="flex shrink-0"
        style={{
          height: "20px",
          background: "#EEEEEE",
          borderTop: "1px solid #262626",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Horizontal scrollbar track */}
        <div className="flex-1" />

        {/* Resize grip area */}
        <div
          className="cursor-se-resize relative"
          style={{ width: "20px", height: "20px", zIndex: 20 }}
          onMouseDown={handleResizeMouseDown}
        >
          {/* Diagonal grip lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div
                style={{
                  position: "absolute",
                  width: "2px",
                  height: "2px",
                  background: "white",
                  bottom: `${3 + i * 2}px`,
                  right: `${3 + i * 2}px`,
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "2px",
                  height: "2px",
                  background: "#808080",
                  bottom: `${2 + i * 2}px`,
                  right: `${2 + i * 2}px`,
                  opacity: 0.8,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right scrollbar track */}
      <div
        className="absolute right-0 top-[57px]"
        style={{
          width: "20px",
          bottom: "21px",
          background: "#EEEEEE",
          borderLeft: "1px solid #262626",
          pointerEvents: "auto",
        }}
      >
        {/* Scroll up button */}
        <div
          style={{
            height: "20px",
            borderBottom: "1px solid #262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "8px solid #262626",
              opacity: 0.4,
            }}
          />
        </div>

        {/* Scroll track */}
        <div className="flex-1" />

        {/* Scroll down button */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "20px",
            borderTop: "1px solid #262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "8px solid #262626",
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    </div>
  );
}