import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { db, type PatientInput, ValidationError } from "../lib/db";

interface PatientFormProps {
  onSubmit: (patient: PatientInput) => Promise<void>;
  initialData?: Partial<PatientInput>;
  submitLabel?: string;
}

type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  initialData = {},
  submitLabel = "Save",
}) => {
  const [formData, setFormData] = useState<PatientInput>({
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    preferred_name: initialData.preferred_name || "",
    date_of_birth: initialData.date_of_birth || "",
    gender: (initialData.gender as Gender) || "prefer_not_to_say",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    state: initialData.state || "",
    city: initialData.city || "",
    medical_history: initialData.medical_history || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.length > 100) {
      newErrors.first_name = "First name must be 100 characters or less";
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.length > 100) {
      newErrors.last_name = "Last name must be 100 characters or less";
    }

    if (formData.preferred_name && formData.preferred_name.length > 100) {
      newErrors.preferred_name =
        "Preferred name must be 100 characters or less";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);

      if (isNaN(dob.getTime())) {
        newErrors.date_of_birth = "Invalid date format";
      } else if (dob > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      } else if (dob < minDate) {
        newErrors.date_of_birth =
          "Date of birth cannot be more than 120 years ago";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    } else if (
      !["male", "female", "other", "prefer_not_to_say"].includes(
        formData.gender
      )
    ) {
      newErrors.gender = "Invalid gender value";
    }

    // Email validation
    if (formData.email) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone =
          "Invalid phone number format. Must be a valid international number";
      }
    }

    // Address validation
    if (formData.address && formData.address.length > 200) {
      newErrors.address = "Address must be 200 characters or less";
    }

    if (formData.state && formData.state.length > 100) {
      newErrors.state = "State must be 100 characters or less";
    }

    if (formData.city && formData.city.length > 100) {
      newErrors.city = "City must be 100 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        first_name: "",
        last_name: "",
        preferred_name: "",
        date_of_birth: "",
        gender: "prefer_not_to_say",
        email: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        medical_history: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "Failed to submit form. Please try again.";

      if (error instanceof ValidationError) {
        errorMessage = error.message;
        // Map validation error to specific field if possible
        if (error.message.includes("email")) {
          setErrors((prev) => ({ ...prev, email: error.message }));
        } else if (error.message.includes("phone")) {
          setErrors((prev) => ({ ...prev, phone: error.message }));
        } else if (error.message.includes("date of birth")) {
          setErrors((prev) => ({ ...prev, date_of_birth: error.message }));
        } else if (error.message.includes("gender")) {
          setErrors((prev) => ({ ...prev, gender: error.message }));
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      Object.keys(formData).some(
        (key) => formData[key as keyof typeof formData]
      )
    ) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost."
        )
      ) {
        setFormData({
          first_name: "",
          last_name: "",
          preferred_name: "",
          date_of_birth: "",
          gender: "prefer_not_to_say",
          email: "",
          phone: "",
          address: "",
          state: "",
          city: "",
          medical_history: "",
        });
        setErrors({});
        toast.success("Form cleared");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-black text-white">
            <h2 className="text-2xl font-bold tracking-tight">
              Patient Registration
            </h2>
            <p className="mt-1 text-gray-300">
              Please fill in the patient's information below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Basic details about the patient
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Input
                    label="First name*"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    placeholder="Enter first name"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    label="Last name*"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    placeholder="Enter last name"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    label="Preferred name*"
                    name="preferred_name"
                    value={formData.preferred_name}
                    onChange={handleChange}
                    error={errors.preferred_name}
                    placeholder="Enter preferred name"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    label="Date of birth*"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    error={errors.date_of_birth}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <Select
                    label="Gender*"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    error={errors.gender}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                    options={[
                      { value: "", label: "Select gender" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                      {
                        value: "prefer_not_to_say",
                        label: "Prefer not to say",
                      },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    label="Phone*"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="Enter phone number"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter email address"
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Address Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Patient's current address details
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <Input
                    label="Address*"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="Enter street address"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      error={errors.state}
                      placeholder="Enter state"
                      className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                      placeholder="Enter city"
                      className="bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Medical History
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Important medical information
                </p>
              </div>

              <div className="space-y-1">
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  placeholder="Enter medical history"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200 resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
