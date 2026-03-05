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
    <div className={`flex gap-2 ${className}`}>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-full transition-all duration-150
              active:scale-[0.95]
              ${
                isActive
                  ? "bg-text-primary text-text-inverse"
                  : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
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
