import React from "react";
import { useNavigate } from "react-router-dom";
import { PatientForm } from "../components/PatientForm";
import type { Patient } from "../lib/db";
import { db } from "../lib/db";
import { usePGliteContext } from "../context/PGliteContext";

export const NewPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { isInitialized, isLoading, error } = usePGliteContext();

  const handleSubmit = async (patient: Omit<Patient, "id" | "created_at">) => {
    if (!isInitialized) {
      throw new Error("Database not initialized");
    }
    await db.addPatient(patient);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Register New Patient</h1>
      <PatientForm onSubmit={handleSubmit} />
    </>
  );
};
