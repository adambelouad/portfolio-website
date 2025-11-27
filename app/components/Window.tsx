"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface WindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  onClose: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export default function Window({
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  onClose,
  onPositionChange,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Use ref to track current position for mouseup handler (avoids stale closure)
  const positionRef = useRef(position);
  positionRef.current = position;
  
  // Track if position has been manually set (dragged)
  const hasBeenDragged = useRef(false);

  // Update position when initialPosition prop changes (only if never dragged in this session)
  useEffect(() => {
    // Only update from prop if we haven't dragged yet and not currently dragging
    if (!isDragging && !hasBeenDragged.current) {
      const needsUpdate = position.x !== initialPosition.x || position.y !== initialPosition.y;
      if (needsUpdate) {
        setPosition(initialPosition);
      }
    }
  }, [initialPosition.x, initialPosition.y, isDragging, position.x, position.y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
        // Mark as dragged so initialPosition prop won't override
        hasBeenDragged.current = true;
        // Report final position when drag ends (use ref for current value)
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

  return (
    <div
      className="absolute z-50 shadow-lg select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "600px",
        minHeight: "400px",
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-1 cursor-grab active:cursor-grabbing"
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
        className="bg-white border-l border-r border-b border-black p-4 overflow-auto"
        style={{
          minHeight: "380px",
          maxHeight: "600px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

