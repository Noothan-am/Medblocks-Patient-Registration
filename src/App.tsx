import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PageLayout } from "./components/layout/PageLayout";
import { HomePage } from "./pages/HomePage";
import { NewPatientPage } from "./pages/NewPatientPage";
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
            </Routes>
          </PageLayout>
        </Router>
      </TabSyncProvider>
    </PGliteProvider>
  );
}

export default App;
