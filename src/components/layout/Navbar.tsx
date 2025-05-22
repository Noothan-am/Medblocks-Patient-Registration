import React from "react";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900"
            >
              Patient Registration
            </Link>
            <Link
              to="/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add Patient
            </Link>
            <Link
              to="/sql-query"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              SQL Query
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
