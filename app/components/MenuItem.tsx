"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface MenuItemProps {
  label: string;
  items?: string[];
  icon?: ReactNode;
}

export default function MenuItem({ label, items, icon }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <span
        className={`text-[14px] h-[30px] flex items-center px-4 hover:bg-[#333399] hover:text-white transition-colors cursor-pointer ${
          isOpen ? "bg-[#333399] text-white" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        {label}
      </span>

      {/* Dropdown Menu */}
      {isOpen && items && items.length > 0 && (
        <div
          className="absolute top-[30px] left-0 bg-[#DDDDDD] min-w-[200px] z-50"
          style={{
            border: "1px solid #000",
            boxShadow: [
              "1px 1px 0 rgba(0,0,0,1)", // outer shadow for border effect
              "inset 1px 0 0 0 #fff", // inner left white
              "inset 0 1px 0 0 #fff", // inner top white
              "inset -1px 0 0 0 #BBBBBB", // inner right bbbbbb
              "inset 0 -1px 0 0 #BBBBBB", // inner bottom bbbbbb
            ].join(", "),
          }}
        >
          <div className="py-1">
            {items.map((item, index) => {
              // Check if item is a divider
              if (item === "---") {
                return (
                  <div key={index} className="h-[1px] bg-gray-500 my-1 mx-1" />
                );
              }
              return (
                <div
                  key={index}
                  className="px-3 py-[2px] hover:bg-[#333399] hover:text-white cursor-pointer text-[14px] h-[20px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
