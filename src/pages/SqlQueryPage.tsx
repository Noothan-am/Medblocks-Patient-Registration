import React, { useState } from "react";
import SqlQuery from "../components/SqlQuery";
import { initDatabase } from "../lib/db";
import { usePGliteContext } from "../context/PGliteContext";
import type { Results } from "@electric-sql/pglite";

interface QueryResult {
  rows: any[];
  rowCount: number;
  fields?: { name: string; dataTypeID: number }[];
}

const SqlQueryPage: React.FC = () => {
  const { isInitialized, error: dbError } = usePGliteContext();
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteQuery = async (query: string) => {
    if (!isInitialized) {
      setError("Database is not initialized. Please wait or refresh the page.");
      return;
    }

    setError(null);
    setQueryResult(null);
    setIsExecuting(true);

    try {
      const database = await initDatabase();
      const result = await database.query(query);

      // Format the result to include field information
      const formattedResult: QueryResult = {
        rows: result.rows,
        rowCount: (result as any).rowCount || result.rows.length,
        fields: (result as any).fields?.map((field: any) => ({
          name: field.name,
          dataTypeID: field.dataTypeID,
        })),
      };

      setQueryResult(formattedResult);
    } catch (err) {
      console.error("Query execution error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while executing the query"
      );
    } finally {
      setIsExecuting(false);
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h2 className="text-lg font-medium text-red-800">Database Error</h2>
            <p className="mt-2 text-sm text-red-700">{dbError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          SQL Query Interface
        </h1>

        <SqlQuery
          onExecuteQuery={handleExecuteQuery}
          queryResult={queryResult}
          error={error}
          isExecuting={isExecuting}
        />
      </div>
    </div>
  );
};

export default SqlQueryPage;
