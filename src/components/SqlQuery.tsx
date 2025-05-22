import React, { useState } from "react";

interface QueryResult {
  rows: any[];
  rowCount: number;
  fields?: { name: string; dataTypeID: number }[];
}

interface SqlQueryProps {
  onExecuteQuery: (query: string) => void;
  queryResult: QueryResult | null;
  error: string | null;
  isExecuting: boolean;
}

const SqlQuery: React.FC<SqlQueryProps> = ({
  onExecuteQuery,
  queryResult,
  error,
  isExecuting,
}) => {
  const [query, setQuery] = useState<string>("");

  const handleExecute = () => {
    if (!query.trim()) return;
    onExecuteQuery(query);
  };

  const renderResults = () => {
    if (!queryResult) return null;

    if (queryResult.rows.length === 0) {
      return (
        <div className="text-gray-500 text-sm">
          Query executed successfully. No rows returned.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {queryResult.fields?.map((field) => (
                <th
                  key={field.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queryResult.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {queryResult.fields?.map((field) => (
                  <td
                    key={`${rowIndex}-${field.name}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {row[field.name]?.toString() ?? "null"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-sm text-gray-500">
          {queryResult.rowCount} row{queryResult.rowCount !== 1 ? "s" : ""}{" "}
          returned
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          SQL Query Editor
        </h2>

        {/* Query Input Area */}
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

        {/* Execute Button */}
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

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results Area */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Query Results
          </h3>
          <div className="bg-gray-50 rounded-md border border-gray-200 p-4 min-h-[200px]">
            {renderResults()}
          </div>
        </div>

        {/* Query Status */}
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
