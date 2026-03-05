import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  /** 프로필 이미지 URL */
  src?: string | null;
  /** 이미지 대신 표시할 이니셜 (이름 첫 글자) */
  name?: string;
  size?: AvatarSize;
  className?: string;
}

/** 사이즈별 스타일 (px 크기 + 텍스트 크기) */
const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
  sm: { container: "w-8 h-8", text: "text-xs", px: 32 },
  md: { container: "w-10 h-10", text: "text-sm", px: 40 },
  lg: { container: "w-14 h-14", text: "text-lg", px: 56 },
};

/** 이름에서 이니셜 추출 */
function getInitial(name?: string): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={`
        ${styles.container} rounded-full overflow-hidden shrink-0
        bg-primary-muted flex items-center justify-center
        ${className}
      `}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "avatar"}
          width={styles.px}
          height={styles.px}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`${styles.text} font-semibold text-primary`}>
          {getInitial(name)}
        </span>
      )}
    </div>
  );
}
