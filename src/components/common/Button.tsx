"use client";

import { ButtonHTMLAttributes, forwardRef, MouseEvent, useState, useCallback } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: "bg-primary text-text-on-primary hover:bg-primary-hover focus:ring-primary",
  secondary: "bg-bg-tertiary text-text-primary hover:bg-border focus:ring-border-hover",
  danger: "bg-error text-text-on-primary hover:opacity-90 focus:ring-error",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-tertiary focus:ring-border-hover",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
    const showRipple = variant !== "ghost";

    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (showRipple) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const id = Date.now();
          setRipples((prev) => [...prev, { x, y, id }]);
          setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
          }, 600);
        }
        onClick?.(e);
      },
      [onClick, showRipple],
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          relative overflow-hidden
          inline-flex items-center justify-center font-medium rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          active:scale-[0.97]
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-current opacity-20 animate-[ripple_0.6s_ease-out_forwards] pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
            }}
          />
        ))}
      </button>
    );
  },
);

Button.displayName = "Button";
