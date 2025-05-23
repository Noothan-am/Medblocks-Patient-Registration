import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Patient } from "../lib/db";
import { db } from "../lib/db";
import { usePGliteContext } from "../context/PGliteContext";
import { useTabSync } from "../context/TabSyncContext";

interface PatientListProps {
  onPatientDelete?: (patientId: number) => void;
}

interface PatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (patientId: number) => void;
}

const PatientModal: React.FC<PatientModalProps> = ({
  patient,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Gradient Header with pattern */}
          <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-8 py-6">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "30px 30px",
                }}
              />
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-2xl font-medium text-white">
                    {patient.first_name[0]}
                    {patient.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  {patient.preferred_name && (
                    <p className="text-sm text-white/80">
                      Preferred name: {patient.preferred_name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Date of Birth
                      </label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Gender
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 text-white capitalize">
                          {patient.gender}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {patient.email || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {patient.phone || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Street Address
                    </label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {patient.address || (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        City
                      </label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {patient.city || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        State
                      </label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {patient.state || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History Section */}
              {patient.medical_history && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Medical History
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {patient.medical_history}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this patient?"
                  )
                ) {
                  onDelete?.(patient.id);
                  onClose();
                }
              }}
              className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 border-0 shadow-sm"
            >
              Delete Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PatientList: React.FC<PatientListProps> = ({
  onPatientDelete,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { broadcastEvent } = useTabSync();
  const { isInitialized } = usePGliteContext();

  const loadPatients = async () => {
    if (!isInitialized) return;

    try {
      const data = await db.getPatients();
      setPatients(data);
    } catch (err) {
      console.error("Error loading patients:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load patients. Please try again.";
      toast.error(errorMessage);
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
  }, []);

  const handleDelete = async (patientId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this patient? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await db.deletePatient(patientId);
      await loadPatients();
      broadcastEvent({ type: "PATIENT_DELETED", data: { patientId } });
      onPatientDelete?.(patientId);
      toast.success("Patient deleted successfully");
    } catch (err) {
      console.error("Error deleting patient:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete patient. Please try again.";
      toast.error(errorMessage);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchQuery)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Patient Registry
            </h2>
          </div>
          <div className="w-full sm:w-72">
            <Input
              type="search"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-gray-200 focus:border-black focus:ring-black"
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery
                  ? "No patients found"
                  : "No patients registered yet"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Get started by registering a new patient"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {patient.first_name[0]}
                              {patient.last_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {patient.email || "No email"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(patient.id);
                          }}
                          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 border-0 shadow-sm"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Patient Modal */}
      <PatientModal
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onDelete={handleDelete}
      />
    </div>
  );
};
