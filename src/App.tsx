import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#333",
                color: "#fff",
              },
              success: {
                duration: 3000,
                style: {
                  background: "#059669",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "#DC2626",
                },
              },
            }}
          />
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
