"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistRef = useRef(0);
  const initialScaleRef = useRef(1);

  const goTo = useCallback(
    (index: number) => {
      setScale(1);
      setCurrentIndex((index + images.length) % images.length);
    },
    [images.length],
  );

  // 키보드 네비게이션 + body 스크롤 잠금
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, goTo, currentIndex]);

  // 핀치 줌
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      initialDistRef.current = dist;
      initialScaleRef.current = scale;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      const newScale = Math.min(Math.max(initialScaleRef.current * (dist / initialDistRef.current), 1), 4);
      setScale(newScale);
    }
  }

  function handleTouchEnd() {
    if (scale < 1.1) setScale(1);
  }

  function getTouchDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white"
        aria-label="닫기"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 이미지 카운터 */}
      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* 좌우 화살표 (데스크톱) */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/50 hover:text-white hidden md:block"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/50 hover:text-white hidden md:block"
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* 이미지 영역 (스와이프) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          className="w-full h-full flex items-center justify-center select-none"
          drag={scale <= 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 80) {
              goTo(info.offset.x > 0 ? currentIndex - 1 : currentIndex + 1);
            }
            // 아래로 드래그 닫기
            if (info.offset.y > 100) {
              onClose();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.15 }}
        >
          <img
            src={images[currentIndex]}
            alt=""
            className="max-w-full max-h-full object-contain will-change-transform"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
