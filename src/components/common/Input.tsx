"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border border-border bg-bg text-text-primary px-3 py-2 text-sm
            placeholder:text-text-tertiary
            focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none
            disabled:bg-bg-secondary disabled:text-text-secondary
            ${error ? "border-error focus:border-error focus:ring-error" : ""}
            ${className}
          `}
          onInvalid={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.validity.valueMissing) {
              input.setCustomValidity("이 항목을 입력해주세요.");
            }
          }}
          onInput={(e) => {
            (e.target as HTMLInputElement).setCustomValidity("");
          }}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error-text">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
