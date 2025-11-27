"use client";

import Image from "next/image";
import Clock from "./components/Clock";
import MenuItem from "./components/MenuItem";

export default function Home() {
  // Define menu items with their dropdown options
  const menuItems = [
    {
      label: "Portfolio",
      items: ["Projects", "Gallery", "Case Studies", "---", "View All"],
    },
    {
      label: "About",
      items: ["About Me", "Experience", "Skills", "---", "Resume"],
    },
    {
      label: "Contact",
      items: ["Email", "LinkedIn", "GitHub"],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[url('/quantum-foam-background.png')] bg-cover bg-center bg-no-repeat">
      {/* Top Header Bar */}
      <div className="w-full h-[30px] bg-[#DDDDDD] relative border-b-[1px] border-b-[#BBBBBB] after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[-2px] after:h-[1px] after:bg-[#262626] flex flex-row items-center justify-between">
        {/* Left Side of Top Header Bar */}
        <div className="flex h-full items-center justify-start">
          <div className="flex h-[30px] items-center px-4 hover:bg-[#333399] hover:text-white transition-colors cursor-pointer">
            <Image
              src="/apple-logo.png"
              alt="Apple Logo"
              width={18}
              height={18}
            />
          </div>
          <div className="flex h-[30px]">
            {menuItems.map((menu, index) => (
              <MenuItem key={index} label={menu.label} items={menu.items} />
            ))}
          </div>
        </div>

        {/* Right Side of Top Header Bar */}
        <div className="flex h-full items-center justify-end">
          <Clock />
          <Image
            src="/menu-bar-resizer.png"
            alt="Menu Bar Resizer"
            width={10}
            height={10}
            className="cursor-pointer"
          />
          <div className="relative flex h-[30px] items-center">
            <MenuItem
              label="Finder"
              icon={
                <Image
                  src="/finder.png"
                  alt="Finder Icon"
                  width={20}
                  height={15}
                  className="mr-1"
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
