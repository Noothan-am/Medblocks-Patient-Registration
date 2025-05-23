import React from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobile,
}) => {
  return (
    <div
      className={`bg-black text-white h-screen flex flex-col transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 ${
        isCollapsed ? "w-20" : "w-64"
      } ${isMobile && isCollapsed ? "-translate-x-full" : "translate-x-0"}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!isCollapsed && <div className="text-xl font-bold">MedBlocks</div>}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <nav className="mt-5 space-y-2">
          <Link
            to="/new"
            className={`flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {!isCollapsed && "Register Patients"}
            {isCollapsed && (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </Link>
          <Link
            to="/sql-query"
            className={`flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {!isCollapsed && "SQL Query"}
            {isCollapsed && (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2 1.5 3 3.5 3s3.5-1 3.5-3V7c0-2-1.5-3-3.5-3S4 5 4 7zm10 0v10c0 2 1.5 3 3.5 3s3.5-1 3.5-3V7c0-2-1.5-3-3.5-3S14 5 14 7z"
                />
              </svg>
            )}
          </Link>
          <Link
            to="/"
            className={`flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {!isCollapsed && "View Patients Details"}
            {isCollapsed && (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            )}
          </Link>
        </nav>
      </div>

      <div
        className={`flex items-center p-4 border-t border-gray-700 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        {!isCollapsed && (
          <>
            <div className="flex-shrink-0 mr-3">
              <img
                className="h-10 w-10 rounded-full"
                src="https://avatars.githubusercontent.com/u/0?s=64&v=4"
                alt="User Avatar"
              />
            </div>
            <div>
              <div className="text-lg font-medium leading-none text-white">
                MedBlocks
              </div>
              <div className="text-base font-medium leading-none text-gray-400">
                medblocks@gmail.com
              </div>
            </div>
          </>
        )}
        {isCollapsed && (
          <img
            className="h-10 w-10 rounded-full"
            src="https://avatars.githubusercontent.com/u/0?s=64&v=4"
            alt="User Avatar"
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
