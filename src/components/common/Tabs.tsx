"use client";

interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, activeValue, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex border-b border-border ${className}`}>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-colors duration-150
              border-b-2 -mb-px
              ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover"
              }
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
