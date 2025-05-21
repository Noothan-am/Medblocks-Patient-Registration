import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Patient } from "../lib/db";
import { db } from "../lib/db";

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

  const loadPatients = async () => {
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
    loadPatients();
  }, []);

  const handleDelete = async (patientId: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      await db.deletePatient(patientId);
      await loadPatients();
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
        <Button variant="secondary" onClick={loadPatients} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Patients</h2>
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
