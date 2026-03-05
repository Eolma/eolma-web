"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/common/Button";

interface LongPressButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  duration?: number;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const CIRCLE_RADIUS = 18;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function LongPressButton({
  onConfirm,
  disabled = false,
  className = "",
  children,
  duration = 500,
  variant = "primary",
}: LongPressButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const p = Math.min(elapsed / duration, 1);
    setProgress(p);

    if (p < 1) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else {
      onConfirm();
      setIsPressed(false);
      setProgress(0);
    }
  }, [duration, onConfirm]);

  const handlePointerDown = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [disabled, updateProgress]);

  const handlePointerUp = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPressed(false);
    setProgress(0);
  }, []);

  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <Button
      type="button"
      variant={variant}
      className={`relative overflow-hidden select-none ${className}`}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {isPressed && (
        <svg
          className="absolute left-2 top-1/2 -translate-y-1/2"
          width="40"
          height="40"
          viewBox="0 0 40 40"
        >
          <circle
            cx="20"
            cy="20"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 20 20)"
          />
        </svg>
      )}
      <span className={isPressed ? "opacity-70" : ""}>{children}</span>
    </Button>
  );
}
