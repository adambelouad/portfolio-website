"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface DesktopIconProps {
  iconSrc: string;
  label: string;
  initialPosition?: { x: number; y: number };
  menuBarHeight?: number;
}

export default function DesktopIcon({
  iconSrc,
  label,
  initialPosition = { x: 16, y: 16 },
  menuBarHeight = 30,
}: DesktopIconProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y - menuBarHeight,
        });
      }
    };

    const handleMouseUp = () => {
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
  }, [isDragging, dragOffset, menuBarHeight]);

  return (
    <div
      className="flex flex-col items-center group w-20 absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-center mb-1 rounded">
        <Image
          src={iconSrc}
          alt={label}
          width={50}
          height={50}
          draggable={false}
        />
      </div>
      <div
        className="pointer-events-none flex items-center justify-center min-w-[64px] w-full max-w-[80px] bg-white/50 text-[#262626] text-[22px] [font-family:var(--font-geneva),_Geneva,_'Geneva_CY',_sans-serif] text-center leading-[0.85] py-[0px] h-[18px]"
      >
        {label}
      </div>
    </div>
  );
}
