import React from "react";
import { useNavigate } from "react-router-dom";
import { PatientForm } from "../components/PatientForm";
import type { Patient } from "../lib/db";
import { db } from "../lib/db";

export const NewPatientPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (patient: Omit<Patient, "id" | "created_at">) => {
    await db.addPatient(patient);
    navigate("/");
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Register New Patient</h1>
      <PatientForm onSubmit={handleSubmit} />
    </>
  );
};
