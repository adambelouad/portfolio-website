"use client";

export default function AboutWindow() {
  return (
    <div className="-m-4 p-4 min-h-screen space-y-4 bg-[#DDDDDD] select-text selection:bg-[#99F] selection:text-2626262">
      <h1 className="text-4xl [font-family:var(--font-apple-garamond)] font-[700] border-b border-gray-600 pb-2 ">
        About Me
      </h1>
      <p className="text-xl text-gray-600 [font-family:var(--font-apple-garamond)] font-[400]">Hi! My name is Adam, and I am currently studying Computer Science and Architecture at Princeton Univeristy. I am interested in the future of human–computer interaction, design, and the intersection of urban design and technology.</p>
      <p className="text-xl text-gray-600 [font-family:var(--font-apple-garamond)] font-[400]">Feel free to reach out at adam@belouad.com :)</p>
    </div>
  );
}