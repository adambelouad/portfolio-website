"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { portfolioItems, PortfolioItem } from "./portfolioData";

const MOBILE_BREAKPOINT = 640;

// Mac OS 9 style list row component based on Figma designs
function ListRow({
  item,
  isSelected,
  selectedColumn,
  onClick,
  onOpenWindow,
  isMobile,
}: {
  item: PortfolioItem;
  isSelected: boolean;
  selectedColumn: string;
  onClick: () => void;
  onOpenWindow?: (windowId: string) => void;
  isMobile: boolean;
}) {
  const handleDoubleClick = () => {
    if (item.windowId && onOpenWindow) {
      onOpenWindow(item.windowId);
    } else {
      window.open(item.link, "_blank");
    }
  };

  // On mobile, single tap opens the item
  const handleClick = () => {
    onClick();
    if (isMobile) {
      if (item.windowId && onOpenWindow) {
        onOpenWindow(item.windowId);
      } else if (item.link) {
        window.open(item.link, "_blank");
      }
    }
  };

  // Helper to get cell background color based on column selection and row selection
  const getCellBg = (column: string) => {
    if (isSelected) return "bg-[#339]";
    if (selectedColumn === column) return "bg-[#ddd]";
    return "bg-[#eee]";
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={isMobile ? undefined : handleDoubleClick}
      className={`
        flex flex-row w-full cursor-pointer select-none border-b border-white
        ${isSelected ? "bg-[#339]" : ""}
      `}
    >
      {/* Name cell with icon */}
      <div
        className={`
          flex-1 min-w-0 sm:min-w-[280px] flex gap-2 sm:gap-[12px] items-center pl-2 sm:pl-[10px] pr-1 sm:pr-[8px] py-[8px]
          ${getCellBg("name")}
        `}
      >
        {/* Icon with padding */}
        <div className="shrink-0 w-[32px] h-[32px] relative">
          <Image
            src={item.icon}
            alt={item.name}
            fill
            className="object-contain"
          />
        </div>
        {/* Name text */}
        <span
          onClick={(e) => {
            if (!isMobile) {
              e.stopPropagation();
              if (item.windowId && onOpenWindow) {
                onOpenWindow(item.windowId);
              } else if (item.link) {
                window.open(item.link, "_blank");
              }
            }
          }}
          className={`
            [font-family:var(--font-geneva)] text-[18px] sm:text-[22px] leading-tight cursor-pointer
            ${isSelected ? "bg-[#339]" : ""}
          `}
          style={isSelected ? { color: "white" } : { color: "#262626" }}
        >
          {item.name}
        </span>
      </div>

      {/* Date Modified cell */}
      <div
        className={`
          w-[90px] sm:w-[240px] shrink-0 flex items-center px-1 sm:px-[8px] py-[8px]
          ${getCellBg("date")}
        `}
      >
        <p
          className="[font-family:var(--font-geneva)] text-[18px] sm:text-[22px] leading-tight sm:whitespace-nowrap"
          style={isSelected ? { color: "white" } : { color: "black" }}
        >
          {item.dateModified}
        </p>
      </div>

      {/* Kind cell */}
      <div
        className={`
          w-[70px] sm:w-[120px] shrink-0 flex items-center px-1 sm:px-[8px] py-[8px]
          ${getCellBg("kind")}
        `}
      >
        <p
          className="[font-family:var(--font-geneva)] text-[18px] sm:text-[22px] leading-tight"
          style={isSelected ? { color: "white" } : { color: "black" }}
        >
          {item.kind}
        </p>
      </div>

      {/* Size cell */}
      <div
        className={`
          w-[50px] sm:w-[100px] shrink-0 flex items-center justify-end px-1 sm:px-[8px] py-[8px]
          ${getCellBg("size")}
        `}
      >
        <p
          className="[font-family:var(--font-geneva)] text-[18px] sm:text-[22px] leading-normal whitespace-nowrap"
          style={isSelected ? { color: "white" } : { color: "black" }}
        >
          {item.size}
        </p>
      </div>

      {/* Empty cell */}
      <div
        className={`
          w-[30px] sm:w-[40px] shrink-0 py-[8px]
          ${getCellBg("empty")}
        `}
      />
    </div>
  );
}

// Mac OS 9 style column list header component based on Figma designs
function ColumnHeader({
  label,
  isSelected = false,
  hasIconSpace = false,
  alignRight = false,
  onClick,
  className = "",
}: {
  label: string;
  isSelected?: boolean;
  hasIconSpace?: boolean;
  alignRight?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center py-[0px] px-1 sm:px-[8px]
        border border-solid border-[#484848]
        [font-family:var(--font-geneva)] text-[16px] sm:text-[20px] text-[#262626]
        cursor-pointer select-none
        ${hasIconSpace ? "pl-2 sm:pl-[10px]" : ""}
        ${alignRight ? "justify-end" : ""}
        ${isSelected 
          ? "bg-[#999] shadow-[inset_-2px_0px_0px_0px_rgba(255,255,255,0.2),inset_0px_-2px_0px_0px_rgba(255,255,255,0.2),inset_2px_0px_0px_0px_rgba(38,38,38,0.6),inset_0px_2px_0px_0px_rgba(38,38,38,0.6)]" 
          : "bg-[#ccc] shadow-[inset_-2px_0px_0px_0px_#808080,inset_0px_-2px_0px_0px_#808080,inset_2px_0px_0px_0px_white,inset_0px_2px_0px_0px_white]"
        }
        ${className}
      `}
    >
      <p className="leading-normal">{label || "\u00A0"}</p>
    </div>
  );
}

export default function PortfolioWindow({
  onOpenWindow,
}: {
  onOpenWindow?: (windowId: string) => void;
}) {
  const [selectedColumn, setSelectedColumn] = useState("name");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [dateSortOrder, setDateSortOrder] = useState<"newest" | "oldest">("newest");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parse date string to Date object for sorting
  const parseDate = (dateString: string): Date => {
    // Format: "Sat, Dec 27, 2024, 2:30 PM"
    return new Date(dateString);
  };

  // Sort portfolio items based on date sort order
  const sortedItems = [...portfolioItems].sort((a, b) => {
    const dateA = parseDate(a.dateModified);
    const dateB = parseDate(b.dateModified);
    if (dateSortOrder === "newest") {
      return dateB.getTime() - dateA.getTime(); // Newest first
    } else {
      return dateA.getTime() - dateB.getTime(); // Oldest first
    }
  });

  const handleDateHeaderClick = () => {
    setSelectedColumn("date");
    // Toggle sort order
    setDateSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  return (
    <div className="-m-4 p-0 bg-white flex flex-col">
      {/* Mac OS 9 Column List Header Row */}
      <div className="flex flex-row w-full">
        <ColumnHeader
          label="Name"
          isSelected={selectedColumn === "name"}
          hasIconSpace={true}
          onClick={() => setSelectedColumn("name")}
          className="flex-1 min-w-0 sm:min-w-[280px]"
        />
        <ColumnHeader
          label={isMobile ? "Date" : "Date Modified"}
          isSelected={selectedColumn === "date"}
          onClick={handleDateHeaderClick}
          className="w-[90px] sm:w-[240px] shrink-0"
        />
        <ColumnHeader
          label="Kind"
          isSelected={selectedColumn === "kind"}
          onClick={() => setSelectedColumn("kind")}
          className="w-[70px] sm:w-[120px] shrink-0"
        />
        <ColumnHeader
          label="Size"
          isSelected={selectedColumn === "size"}
          alignRight={true}
          onClick={() => setSelectedColumn("size")}
          className="w-[50px] sm:w-[100px] shrink-0"
        />
        
        {/* Final column with reorder button */}
        <div
          onClick={() => setSelectedColumn("empty")}
          className={`
            relative flex gap-[10px] items-center justify-center px-[3px] py-[4px]
            border border-solid border-[#484848]
            cursor-pointer select-none w-[30px] sm:w-[40px] shrink-0
            ${selectedColumn === "empty"
              ? "bg-[#999] shadow-[inset_-2px_0px_0px_0px_rgba(255,255,255,0.2),inset_0px_-2px_0px_0px_rgba(255,255,255,0.2),inset_2px_0px_0px_0px_rgba(38,38,38,0.6),inset_0px_2px_0px_0px_rgba(38,38,38,0.6)]" 
              : "bg-[#ccc] shadow-[inset_-2px_0px_0px_0px_#808080,inset_0px_-2px_0px_0px_#808080,inset_2px_0px_0px_0px_white,inset_0px_2px_0px_0px_white]"
            }
          `}
        >
          <ReorderButton />
        </div>
      </div>

      {/* List rows */}
      <div className="flex-1 flex flex-col">
        {sortedItems.map((item) => (
          <ListRow
            key={item.id}
            item={item}
            isSelected={selectedRow === item.id}
            selectedColumn={selectedColumn}
            onClick={() => setSelectedRow(item.id)}
            onOpenWindow={onOpenWindow}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

// Mac OS 9 reorder button (sort arrow) 
function ReorderButton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-[9px] w-[10px] ${className}`}>
      {/* Triangle made of horizontal lines pointing up */}
      <div className="absolute bg-[#262626] h-px left-px top-[7px] w-[8px] shadow-[0px_0px_0px_1px_rgba(38,38,38,0.05),0px_0px_0px_0.5px_rgba(38,38,38,0.2)]" />
      <div className="absolute bg-[#262626] h-px left-[2px] top-[5px] w-[6px] shadow-[0px_0px_0px_1px_rgba(38,38,38,0.05),0px_0px_0px_0.5px_rgba(38,38,38,0.2)]" />
      <div className="absolute bg-[#262626] h-px left-[3px] top-[3px] w-[4px] shadow-[0px_0px_0px_1px_rgba(38,38,38,0.05),0px_0px_0px_0.5px_rgba(38,38,38,0.2)]" />
      <div className="absolute bg-[#262626] h-px left-[4px] top-px w-[2px] shadow-[0px_0px_0px_1px_rgba(38,38,38,0.05),0px_0px_0px_0.5px_rgba(38,38,38,0.2)]" />
    </div>
  );
}