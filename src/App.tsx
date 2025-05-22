import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PageLayout } from "./components/layout/PageLayout";
import { HomePage } from "./pages/HomePage";
import { NewPatientPage } from "./pages/NewPatientPage";
import SqlQueryPage from "./pages/SqlQueryPage";
import { PGliteProvider } from "./context/PGliteContext";
import { TabSyncProvider } from "./context/TabSyncContext";

function App() {
  return (
    <PGliteProvider>
      <TabSyncProvider>
        <Router>
          <PageLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/new" element={<NewPatientPage />} />
              <Route path="/sql-query" element={<SqlQueryPage />} />
            </Routes>
          </PageLayout>
        </Router>
      </TabSyncProvider>
    </PGliteProvider>
  );
}

export default App;
