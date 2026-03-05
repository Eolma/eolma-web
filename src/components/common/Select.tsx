"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, onChange, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full rounded-lg border border-border bg-bg text-text-primary px-3 py-2 text-sm
            focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none
            disabled:bg-bg-secondary disabled:text-text-secondary
            ${error ? "border-error focus:border-error focus:ring-error" : ""}
            ${className}
          `}
          onInvalid={(e) => {
            const select = e.target as HTMLSelectElement;
            if (select.validity.valueMissing) {
              select.setCustomValidity("항목을 선택해주세요.");
            }
          }}
          onChange={(e) => {
            (e.target as HTMLSelectElement).setCustomValidity("");
            onChange?.(e);
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-error-text">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
