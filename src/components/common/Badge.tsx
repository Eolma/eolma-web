import { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

/** variant별 배경/텍스트 스타일 */
const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success-text",
  warning: "bg-warning-light text-warning-text",
  error: "bg-error-light text-error-text",
  info: "bg-info-light text-info-text",
  neutral: "bg-bg-tertiary text-text-secondary",
};

export function Badge({ variant = "neutral", children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
