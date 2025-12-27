"use client";

import Image from "next/image";

export default function PortfolioWindow() {
  return (
    <div className="-m-4 p-4 pt-8 sm:pt-12 min-h-full bg-[#DDDDDD] flex flex-col items-center justify-center">
      <Image
        src="/traffic-cone.png"
        alt="Under Construction"
        width={128}
        height={128}
        className="mb-4 w-20 h-20 sm:w-32 sm:h-32"
      />
      <p className="text-xl sm:text-2xl [font-family:var(--font-apple-garamond)] font-[400] text-center">
        under construction
      </p>
    </div>
  );
}
