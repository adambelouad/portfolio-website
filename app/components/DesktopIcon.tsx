"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface DesktopIconProps {
  iconSrc: string;
  label: string;
  link?: string;
  openInNewTab?: boolean;
  onOpen?: () => void;
  initialPosition?: { x: number; y: number };
  menuBarHeight?: number;
}

export default function DesktopIcon({
  iconSrc,
  label,
  link,
  openInNewTab = true,
  onOpen,
  initialPosition = { x: 16, y: 16 },
  menuBarHeight = 30,
}: DesktopIconProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  // Update position when initialPosition prop changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only open link if not dragged (position didn't change significantly)
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPosition.x, 2) +
      Math.pow(e.clientY - dragStartPosition.y, 2)
    );

    if (dragDistance < 5 && link) {
      if (openInNewTab) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = link;
      }
    }
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

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const dragDistance = Math.sqrt(
          Math.pow(e.clientX - dragStartPosition.x, 2) +
          Math.pow(e.clientY - dragStartPosition.y, 2)
        );

        // If minimal drag, treat as click
        if (dragDistance < 5) {
          if (onOpen) {
            // Use custom callback if provided
            onOpen();
          } else if (link) {
            // Otherwise use link behavior
            if (openInNewTab) {
              window.open(link, "_blank", "noopener,noreferrer");
            } else {
              window.location.href = link;
            }
          }
        }
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
  }, [isDragging, dragOffset, menuBarHeight, dragStartPosition, link, openInNewTab, onOpen]);

  return (
    <div
      className="flex flex-col items-center group w-20 absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "pointer",
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
