"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface DesktopIconProps {
  iconSrc: string;
  label: string;
  link?: string;
  openInNewTab?: boolean;
  onOpen?: () => void;
  initialPosition?: { x: number; y: number };
  menuBarHeight?: number;
  mobileGridMode?: boolean;
}

const MOBILE_BREAKPOINT = 640;

export default function DesktopIcon({
  iconSrc,
  label,
  link,
  openInNewTab = true,
  onOpen,
  initialPosition = { x: 16, y: 16 },
  menuBarHeight = 30,
  mobileGridMode = false,
}: DesktopIconProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update position when initialPosition prop changes
  useEffect(() => {
    if (!isMobile) {
      setPosition(initialPosition);
    }
  }, [initialPosition, isMobile]);

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

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    // On mobile, always trigger action on tap (no drag check needed)
    if (isMobile) {
      triggerAction();
      return;
    }
    
    // Only open link if not dragged (position didn't change significantly)
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;
    const dragDistance = Math.sqrt(
      Math.pow(clientX - dragStartPosition.x, 2) +
        Math.pow(clientY - dragStartPosition.y, 2),
    );

    if (dragDistance < 5 && link) {
      triggerAction();
    }
  };

  const triggerAction = () => {
    if (onOpen) {
      onOpen();
    } else if (link) {
      if (openInNewTab) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = link;
      }
    }
  };

  useEffect(() => {
    // Skip drag handling on mobile
    if (isMobile) return;

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
            Math.pow(e.clientY - dragStartPosition.y, 2),
        );

        // If minimal drag, treat as click
        if (dragDistance < 5) {
          triggerAction();
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
  }, [
    isDragging,
    dragOffset,
    menuBarHeight,
    dragStartPosition,
    isMobile,
  ]);

  // Mobile: simple clickable layout (not absolute positioned)
  if (isMobile) {
    return (
      <div
        ref={iconRef}
        className="flex flex-col items-center select-none w-20 cursor-pointer active:opacity-70 transition-opacity"
        onClick={handleClick}
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
        <div className="pointer-events-none flex items-center justify-center min-w-[64px] w-full max-w-[80px] bg-white/50 text-[#262626] text-[20px] [font-family:var(--font-geneva),_sans-serif] text-center leading-[1] py-[2px]">
          {label}
        </div>
      </div>
    );
  }

  // Desktop: absolute positioned with drag support
  return (
    <div
      ref={iconRef}
      className="flex flex-col items-center group w-20 absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "pointer",
        // Smooth transition when position changes (except during dragging)
        transition: isDragging
          ? "none"
          : "left 150ms ease-out, top 150ms ease-out",
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
      <div className="pointer-events-none flex items-center justify-center min-w-[64px] w-full max-w-[80px] bg-white/50 text-[#262626] text-[22px] [font-family:var(--font-geneva),_sans-serif] text-center leading-[0.85] py-[0px] h-[18px]">
        {label}
      </div>
    </div>
  );
}
