import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Patient } from "../lib/db";
import { db } from "../lib/db";
import { usePGliteContext } from "../context/PGliteContext";
import { useTabSync } from "../context/TabSyncContext";

interface PatientListProps {
  onPatientDelete?: (patientId: number) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onPatientDelete,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    isInitialized,
    isLoading: isDbLoading,
    error: dbError,
  } = usePGliteContext();
  const { broadcastEvent, isConnected, connectedTabs } = useTabSync();

  const loadPatients = async () => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      const data = await db.getPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error("Error loading patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadPatients();
    }
  }, [isInitialized]);

  // Listen for tab sync events
  useEffect(() => {
    const handleTabSync = (event: CustomEvent) => {
      const { type } = event.detail;
      if (
        type === "PATIENT_ADDED" ||
        type === "PATIENT_DELETED" ||
        type === "PATIENTS_UPDATED"
      ) {
        loadPatients();
      }
    };

    window.addEventListener("tabSync", handleTabSync as EventListener);
    return () => {
      window.removeEventListener("tabSync", handleTabSync as EventListener);
    };
  }, [isInitialized]);

  const handleDelete = async (patientId: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      await db.deletePatient(patientId);
      await loadPatients();
      broadcastEvent({ type: "PATIENT_DELETED", data: { patientId } });
      onPatientDelete?.(patientId);
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient. Please try again.");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    );
  });

  if (isDbLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{dbError}</p>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Patients</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>
              {connectedTabs === 1
                ? "Single tab mode"
                : `${connectedTabs} tabs connected`}
            </span>
          </div>
        </div>
        <Input
          type="search"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm
            ? "No patients found matching your search."
            : "No patients registered yet."}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                    <div className="text-sm text-gray-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {patient.gender}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
