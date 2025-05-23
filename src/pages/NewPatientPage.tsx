import React from "react";
import { useNavigate } from "react-router-dom";
import { PatientForm } from "../components/PatientForm";
import { db, type PatientInput, ValidationError } from "../lib/db";
import { usePGliteContext } from "../context/PGliteContext";
import { useTabSync } from "../context/TabSyncContext";
import { toast } from "react-hot-toast";

export const NewPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { isInitialized, isLoading, error } = usePGliteContext();
  const { broadcastEvent } = useTabSync();

  const handleSubmit = async (patient: PatientInput) => {
    if (!isInitialized) {
      throw new Error("Database not initialized");
    }
    try {
      const newPatient = await db.addPatient(patient);
      broadcastEvent({ type: "PATIENT_ADDED", data: { patient: newPatient } });
      toast.success("Patient registered successfully");
      navigate("/");
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Let the form component handle validation errors
      }
      console.error("Error registering patient:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to register patient"
      );
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
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
