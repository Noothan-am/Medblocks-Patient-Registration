import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
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
  submitLabel = "Register Patient",
}) => {
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    date_of_birth: initialData.date_of_birth || "",
    gender: initialData.gender || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
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
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
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
        date_of_birth: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        medical_history: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to submit form. Please try again." });
    } finally {
      setIsSubmitting(false);
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          error={errors.first_name}
          required
        />
        <Input
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          error={errors.last_name}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={handleChange}
          error={errors.date_of_birth}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`
              w-full rounded-md border px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                errors.gender
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
            `}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+1 (555) 555-5555"
        />
      </div>

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical History
        </label>
        <textarea
          name="medical_history"
          value={formData.medical_history}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        />
      </div>

      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
