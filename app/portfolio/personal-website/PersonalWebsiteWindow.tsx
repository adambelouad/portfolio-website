"use client";

export default function PersonalWebsiteWindow() {
  return (
    <div className="-m-4 p-4 min-h-screen space-y-3 sm:space-y-4 bg-[#DDDDDD] select-text selection:bg-[#99F] selection:text-2626262">
      <h1 className="text-2xl sm:text-4xl [font-family:var(--font-apple-garamond)] font-[700] border-b border-gray-600 pb-2">
        Personal Website
      </h1>
      <p className="text-base sm:text-xl text-gray-600 [font-family:var(--font-apple-garamond)] font-[400] leading-relaxed">
        you're alread on it! my personal website is inspired by macOS 9 and was coded in React!
      </p>
    </div>
  );
}