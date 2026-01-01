"use client";

export default function ResumeWindow() {
  return (
    <div className="-m-4 bg-[#DDDDDD]">
      {/* Header */}
      <div className="flex items-center justify-end p-2 px-3 bg-[#CCCCCC] border-b border-[#999]">
        <a
          href="/belouad-adam-resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm bg-[#DDDDDD] border border-[#262626] hover:bg-[#CCCCCC] active:bg-[#BBBBBB] transition-colors [font-family:var(--font-charcoal)]"
          style={{ boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080" }}
        >
          Open in New Tab ↗
        </a>
      </div>
      
      {/* PDF viewer - fixed height to allow proper scrolling */}
      <embed
        src="/belouad-adam-resume.pdf#toolbar=0&view=FitH"
        type="application/pdf"
        className="w-full"
        style={{ height: '800px' }}
      />
    </div>
  );
}

