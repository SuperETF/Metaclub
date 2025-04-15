// src/components/common/InputField.tsx
import React from "react";

interface InputFieldProps {
  label: string;
  field: string;
  value: string;
  type?: string;
  error?: string;
  onChange: (field: string, value: string) => void;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  field,
  value,
  type = "text",
  error,
  onChange,
  focusedField,
  setFocusedField,
}) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <div
      className={`rounded-lg border ${
        focusedField === field
          ? "border-blue-500 ring-1 ring-blue-500"
          : error && value
          ? "border-red-500"
          : "border-gray-300"
      }`}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
        placeholder={`${label} 입력`}
        className="w-full px-4 py-3 text-sm rounded-lg border-none focus:outline-none"
      />
    </div>
    {error && value && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default InputField;
