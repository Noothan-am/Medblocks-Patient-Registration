import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { db } from "../lib/db";
import type { Patient } from "../lib/db";

interface PatientFormProps {
  onSubmit: (patient: Omit<Patient, "id" | "created_at">) => Promise<void>;
  initialData?: Partial<Patient>;
  submitLabel?: string;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  initialData = {},
  submitLabel = "Save",
}) => {
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    preferred_name: initialData.preferred_name || "",
    date_of_birth: initialData.date_of_birth || "",
    gender: initialData.gender || "",
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.preferred_name.trim()) {
      newErrors.preferred_name = "Preferred name is required";
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
        gender: "",
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
      setErrors({ submit: "Failed to submit form. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: "",
      last_name: "",
      preferred_name: "",
      date_of_birth: "",
      gender: "",
      email: "",
      phone: "",
      address: "",
      state: "",
      city: "",
      medical_history: "",
    });
    setErrors({});
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
    <div className="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First name*"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              placeholder="Enter first name"
              required
            />
            <Input
              label="Last name*"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              placeholder="Enter last name"
              required
            />
            <Input
              label="Preferred name*"
              name="preferred_name"
              value={formData.preferred_name}
              onChange={handleChange}
              error={errors.preferred_name}
              placeholder="Enter preferred name"
              required
            />
            <Input
              label="Date of birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              error={errors.date_of_birth}
              placeholder="Select date"
              required
            />
            <Select
              label="Gender*"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              required
              options={[
                { value: "", label: "Select gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ]}
            />
            <Input
              label="Phone*"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter phone"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter mail"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Address*"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter address"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                placeholder="San Francisco"
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="San Francisco"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 00.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                clipRule="evenodd"
              />
            </svg>
            Fill all fields that have asterisk.
          </div>
          <div className="flex space-x-4">
            <Button variant="secondary" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
        {errors.submit && (
          <p className="text-sm text-red-600 text-right mt-2">
            {errors.submit}
          </p>
        )}
      </form>
    </div>
  );
};
