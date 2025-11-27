"use client";

export default function AboutWindow() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold border-b border-gray-300 pb-2">
        About Me
      </h1>

      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-24 h-24 bg-gray-200 border-2 border-gray-400 flex items-center justify-center text-gray-500">
            Photo
          </div>
          <div>
            <h2 className="font-bold text-lg">Adam Belouad</h2>
            <p className="text-sm text-gray-600">Software Developer</p>
            <p className="text-sm text-gray-600">San Francisco, CA</p>
          </div>
        </div>

        <div className="border-2 border-gray-400 p-4">
          <h3 className="font-bold mb-2">Bio</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I&apos;m a passionate software developer with expertise in building
            modern web applications. I love creating intuitive user experiences
            and solving complex technical challenges.
          </p>
        </div>

        <div className="border-2 border-gray-400 p-4">
          <h3 className="font-bold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              JavaScript
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              React
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Next.js
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Node.js
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Python
            </span>
          </div>
        </div>

        <div className="border-2 border-gray-400 p-4">
          <h3 className="font-bold mb-2">Experience</h3>
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-sm">Senior Developer</p>
              <p className="text-xs text-gray-600">Tech Company • 2022 - Present</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Software Engineer</p>
              <p className="text-xs text-gray-600">Startup Inc • 2020 - 2022</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

