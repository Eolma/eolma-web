"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ImageLightbox } from "./ImageLightbox";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export function ImageGallery({ images, alt = "" }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-bg-tertiary rounded-xl flex items-center justify-center text-text-tertiary">
        이미지 없음
      </div>
    );
  }

  function handleImageError(index: number) {
    setFailedImages((prev) => new Set(prev).add(index));
  }

  return (
    <div className="space-y-3">
      {/* 메인 이미지 */}
      <div
        className="aspect-square bg-bg-tertiary rounded-xl overflow-hidden cursor-pointer"
        onClick={() => !failedImages.has(selectedIndex) && setLightboxOpen(true)}
      >
        {failedImages.has(selectedIndex) ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-text-tertiary text-sm">이미지를 불러올 수 없습니다</span>
          </div>
        ) : (
          <img
            src={images[selectedIndex]}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => handleImageError(selectedIndex)}
          />
        )}
      </div>

      {/* 썸네일 리스트 */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square bg-bg-tertiary rounded-lg overflow-hidden border-2 transition-colors ${
                i === selectedIndex ? "border-primary" : "border-transparent"
              }`}
            >
              {failedImages.has(i) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-text-tertiary text-xs">불러올 수 없음</span>
                </div>
              ) : (
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(i)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* 라이트박스 */}
      <AnimatePresence>
        {lightboxOpen && (() => {
          const validImages = images.filter((_, i) => !failedImages.has(i));
          // selectedIndex -> validImages 내 인덱스로 변환
          let mappedIndex = 0;
          for (let i = 0; i < selectedIndex; i++) {
            if (!failedImages.has(i)) mappedIndex++;
          }
          return (
            <ImageLightbox
              images={validImages}
              initialIndex={Math.min(mappedIndex, validImages.length - 1)}
              onClose={() => setLightboxOpen(false)}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
