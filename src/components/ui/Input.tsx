import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-md border px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              error
                ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
            ${className}
          `}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              error ? "text-red-600" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
