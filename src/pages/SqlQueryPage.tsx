import { useState } from "react";
import { motion } from "framer-motion";
import { initDatabase } from "../lib/db";
import { usePGliteContext } from "../context/PGliteContext";
import type { Results } from "@electric-sql/pglite";

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
}

const SqlQueryPage = () => {
  const { isInitialized, error: dbError } = usePGliteContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuerySubmit = async () => {
    if (!isInitialized) {
      setError("Database is not initialized. Please wait or refresh the page.");
      return;
    }

    if (!query.trim()) {
      setError("Please enter a SQL query.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const database = await initDatabase();
      const result = (await database.query(query)) as Results<any> & {
        rowCount?: number;
      };

      // Extract column names from the first row or use field names
      const columns =
        result.fields?.map((field) => field.name) ||
        (result.rows[0] ? Object.keys(result.rows[0]) : []);

      setResults({
        columns,
        rows: result.rows,
        rowCount: result.rowCount ?? result.rows.length,
      });
    } catch (err) {
      console.error("Query execution error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while executing the query"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800">Database Error</h2>
            <p className="mt-2 text-sm text-red-700">{dbError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-6 px-8 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">SQL Query Editor</h1>
        <p className="text-gray-400 mt-1">
          Execute and manage your database queries
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Query Editor Section */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Query Editor
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQuerySubmit}
                disabled={isLoading || !isInitialized}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Executing...
                  </>
                ) : (
                  "Execute Query"
                )}
              </motion.button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM patients)"
              className="w-full h-48 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Query Results
                </h2>
                <span className="text-sm text-gray-500">
                  {results.rowCount} {results.rowCount === 1 ? "row" : "rows"}{" "}
                  returned
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {results.columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {results.columns.map((column) => (
                          <td
                            key={column}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row[column] === null ? (
                              <span className="text-gray-400">NULL</span>
                            ) : (
                              String(row[column])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!results && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center py-12 bg-gray-50 rounded-lg border border-gray-200"
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No results yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter a SQL query and click Execute to see the results.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Example queries:</p>
              <ul className="mt-2 space-y-1">
                <li className="font-mono">SELECT * FROM patients;</li>
                <li className="font-mono">
                  SELECT first_name, last_name FROM patients WHERE gender =
                  'female';
                </li>
                <li className="font-mono">
                  SELECT COUNT(*) as total_patients FROM patients;
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SqlQueryPage;
