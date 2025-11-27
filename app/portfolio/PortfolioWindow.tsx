"use client";

export default function PortfolioWindow() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold border-b border-gray-300 pb-2">
        My Portfolio
      </h1>

      <div className="space-y-3">
        <div className="border-2 border-gray-400 p-4 hover:border-[#333399] transition-colors">
          <h3 className="font-bold text-lg">Project 1</h3>
          <p className="text-sm text-gray-700 mb-2">
            A comprehensive web application built with modern technologies.
            Features include user authentication, real-time updates, and
            responsive design.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              React
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Next.js
            </span>
          </div>
        </div>

        <div className="border-2 border-gray-400 p-4 hover:border-[#333399] transition-colors">
          <h3 className="font-bold text-lg">Project 2</h3>
          <p className="text-sm text-gray-700 mb-2">
            An innovative mobile-first application that solves real-world
            problems. Built with performance and user experience in mind.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Node.js
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Express
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              MongoDB
            </span>
          </div>
        </div>

        <div className="border-2 border-gray-400 p-4 hover:border-[#333399] transition-colors">
          <h3 className="font-bold text-lg">Project 3</h3>
          <p className="text-sm text-gray-700 mb-2">
            A data visualization dashboard that transforms complex data into
            intuitive, actionable insights for business decisions.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              D3.js
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              Python
            </span>
            <span className="px-3 py-1 bg-gray-200 text-xs border border-gray-400">
              FastAPI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

