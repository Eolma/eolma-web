"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            block w-full rounded-lg border border-border bg-bg text-text-primary px-3 py-2 text-sm
            placeholder:text-text-tertiary
            focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none
            disabled:bg-bg-secondary disabled:text-text-secondary
            ${error ? "border-error focus:border-error focus:ring-error" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error-text">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
