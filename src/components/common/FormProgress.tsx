"use client";

import { motion } from "framer-motion";

interface FormProgressProps {
  title: string;
  description: string;
  category: string;
  conditionGrade: string;
  startingPrice: string;
  endType: string;
  endValue: string;
  imageUrls: string[];
  instantPrice: string;
  reservePrice: string;
}

interface SectionStatus {
  label: string;
  complete: boolean;
}

export function FormProgress(props: FormProgressProps) {
  const {
    title, description, category, conditionGrade,
    startingPrice, endType, endValue,
    imageUrls, instantPrice, reservePrice,
  } = props;

  // 필수 필드 7개 기준 완성도
  const requiredFields = [
    title.trim().length > 0,
    description.trim().length > 0,
    category.length > 0,
    conditionGrade.length > 0,
    startingPrice.length > 0 && Number(startingPrice) > 0,
    endType.length > 0,
    endValue.length > 0,
  ];

  const requiredComplete = requiredFields.filter(Boolean).length;
  const basePercent = (requiredComplete / requiredFields.length) * 80;

  // 선택 필드 보너스
  const imageBonus = imageUrls.length > 0 ? 10 : 0;
  const instantBonus = instantPrice.length > 0 && Number(instantPrice) > 0 ? 5 : 0;
  const reserveBonus = reservePrice.length > 0 && Number(reservePrice) > 0 ? 5 : 0;

  const totalPercent = Math.min(100, Math.round(basePercent + imageBonus + instantBonus + reserveBonus));

  // 섹션별 완성 체크
  const sections: SectionStatus[] = [
    {
      label: "기본 정보",
      complete: title.trim().length > 0 && description.trim().length > 0 && category.length > 0 && conditionGrade.length > 0,
    },
    {
      label: "경매 설정",
      complete: (startingPrice.length > 0 && Number(startingPrice) > 0) && endType.length > 0 && endValue.length > 0,
    },
    {
      label: "이미지",
      complete: imageUrls.length > 0,
    },
  ];

  return (
    <div className="sticky top-0 z-10 bg-bg border-b border-border px-4 py-3 -mx-4 mb-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalPercent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <span className="text-xs font-medium text-text-secondary w-10 text-right">{totalPercent}%</span>
      </div>

      {/* 섹션 체크 */}
      <div className="flex gap-4">
        {sections.map((section) => (
          <div key={section.label} className="flex items-center gap-1.5">
            <svg
              className={`w-3.5 h-3.5 ${section.complete ? "text-success" : "text-text-tertiary"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {section.complete ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <circle cx="12" cy="12" r="9" />
              )}
            </svg>
            <span className={`text-xs ${section.complete ? "text-text-primary" : "text-text-tertiary"}`}>
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
