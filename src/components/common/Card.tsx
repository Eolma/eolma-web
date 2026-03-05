import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 패딩 없이 사용할 경우 (이미지 카드 등) */
  noPadding?: boolean;
  /** 클릭 가능한 카드 스타일 */
  interactive?: boolean;
}

const baseStyles = "bg-bg-elevated border border-border rounded-xl shadow-card";

export function Card({
  children,
  noPadding = false,
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        ${baseStyles}
        ${noPadding ? "" : "p-4"}
        ${interactive ? "cursor-pointer hover:shadow-md transition-shadow duration-150" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/** 카드 헤더 영역 */
function CardHeader({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

/** 카드 본문 영역 */
function CardBody({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

/** 카드 푸터 영역 */
function CardFooter({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-3 pt-3 border-t border-border ${className}`} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
