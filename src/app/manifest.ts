import type { MetadataRoute } from "next";

/** PWA Web App Manifest */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "얼마 - 중고 경매 플랫폼",
    short_name: "얼마",
    description: "상품만 올리면, 시장이 가격을 정해주는 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
