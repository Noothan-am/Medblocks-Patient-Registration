import React from "react";
import SqlQuery from "../components/SqlQuery";

const SqlQueryPage: React.FC = () => {
  const handleExecuteQuery = (query: string) => {
    // This is where you'll implement the actual query execution logic
    console.log("Executing query:", query);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          SQL Query Interface
        </h1>
        <SqlQuery onExecuteQuery={handleExecuteQuery} />
      </div>
    </div>
  );
};

export default SqlQueryPage;
