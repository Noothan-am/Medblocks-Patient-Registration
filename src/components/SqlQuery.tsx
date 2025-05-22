import React, { useState } from "react";

interface SqlQueryProps {
  onExecuteQuery?: (query: string) => void;
}

const SqlQuery: React.FC<SqlQueryProps> = ({ onExecuteQuery }) => {
  const [query, setQuery] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const handleExecute = () => {
    if (!query.trim()) return;
    setIsExecuting(true);
    onExecuteQuery?.(query);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          SQL Query Editor
        </h2>

        <div className="mb-4">
          <label
            htmlFor="sqlQuery"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter your SQL query:
          </label>
          <textarea
            id="sqlQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="SELECT * FROM patients WHERE..."
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting || !query.trim()}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isExecuting || !query.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isExecuting ? "Executing..." : "Execute Query"}
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Query Results
          </h3>
          <div className="bg-gray-50 rounded-md border border-gray-200 p-4 min-h-[200px]">
            <div className="text-gray-500 text-sm">
              <p>Query results will appear here...</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Note: Please ensure your SQL query is properly formatted and safe to
            execute.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SqlQuery;
