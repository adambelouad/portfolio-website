"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 640;

export default function ResumeWindow() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile: show a simple view with download button (PDF embeds don't work on mobile)
  if (isMobile) {
    return (
      <div className="-m-4 p-6 bg-[#DDDDDD] flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <p className="text-center text-gray-700 [font-family:var(--font-apple-garamond)] text-lg">
          Tap below to view or download resume
        </p>
        <a
          href="/belouad-adam-resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-base bg-[#DDDDDD] border-2 border-[#262626] hover:bg-[#CCCCCC] active:bg-[#BBBBBB] transition-colors [font-family:var(--font-charcoal)] inline-flex items-center gap-2"
          style={{ boxShadow: "inset 2px 2px 0 #FFFFFF, inset -2px -2px 0 #808080" }}
        >
          Open Resume
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
            <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    );
  }

  // Desktop: show embedded PDF
  return (
    <div className="-m-4 bg-[#DDDDDD]">
      {/* Header */}
      <div className="flex items-center justify-end p-2 px-3 bg-[#CCCCCC] border-b border-[#999]">
        <a
          href="/belouad-adam-resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm bg-[#DDDDDD] border border-[#262626] hover:bg-[#CCCCCC] active:bg-[#BBBBBB] transition-colors [font-family:var(--font-charcoal)] inline-flex items-center gap-1"
          style={{ boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080" }}
        >
          Open in New Tab
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
            <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
      
      {/* PDF viewer - fixed height to allow proper scrolling */}
      <embed
        src="/belouad-adam-resume.pdf#toolbar=0&view=FitH"
        type="application/pdf"
        className="w-full"
        style={{ height: '1100px' }}
      />
    </div>
  );
}

