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
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Use refs to track current values for mouseup handler (avoids stale closure)
  const positionRef = useRef(position);
  positionRef.current = position;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  
  // Track if position has been manually set (dragged)
  const hasBeenDragged = useRef(false);

  // Update position when initialPosition prop changes (only if never dragged in this session)
  useEffect(() => {
    if (!isDragging && !hasBeenDragged.current) {
      const needsUpdate = position.x !== initialPosition.x || position.y !== initialPosition.y;
      if (needsUpdate) {
        setPosition(initialPosition);
      }
    }
  }, [initialPosition.x, initialPosition.y, isDragging, position.x, position.y]);

  // Update size when initialSize prop changes
  useEffect(() => {
    if (!isResizing) {
      setSize(initialSize);
    }
  }, [initialSize.width, initialSize.height, isResizing]);

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
      className="absolute shadow-lg select-none flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-1 cursor-grab active:cursor-grabbing shrink-0"
        style={{
          height: "19px",
          background: "linear-gradient(180deg, #6699FF 0%, #3366CC 100%)",
          borderTop: "1px solid #99BBFF",
          borderLeft: "1px solid #000",
          borderRight: "1px solid #000",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Close button */}
        <div className="flex gap-1">
          <div
            className="w-3 h-3 bg-white border border-black cursor-pointer hover:bg-gray-200"
            onClick={onClose}
          ></div>
        </div>

        <div className="flex-1 text-center text-white font-bold" style={{ fontSize: "11px" }}>
          {title}
        </div>

        <div className="w-3"></div>
      </div>

      {/* Window Content */}
      <div
        className="bg-white border-l border-r border-b border-black p-4 overflow-auto flex-1"
      >
        {children}
      </div>

      {/* Resize Handle (bottom-right corner) */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: `
            linear-gradient(135deg, 
              transparent 0%, transparent 30%,
              #888 30%, #888 35%,
              transparent 35%, transparent 45%,
              #888 45%, #888 50%,
              transparent 50%, transparent 60%,
              #888 60%, #888 65%,
              transparent 65%, transparent 100%
            )
          `,
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}

