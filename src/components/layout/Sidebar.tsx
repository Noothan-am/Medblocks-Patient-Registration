import React from "react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <div className="bg-black text-white h-screen w-64 flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        MedBlocks
      </div>
      <div className="flex-grow overflow-y-auto">
        <nav className="mt-5 space-y-2">
          <Link
            to="/new"
            className="flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Register Patients
          </Link>
          <Link
            to="/sql-query"
            className="flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            SQL Query
          </Link>
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            View Patients Details
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
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
          <svg
            className="ml-auto h-5 w-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
