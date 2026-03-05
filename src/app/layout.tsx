import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthInitializer } from "@/components/layout/AuthInitializer";
import { PageTransition } from "@/components/common/PageTransition";
import { ToastProvider } from "@/components/common/Toast";
import { NetworkBanner } from "@/components/common/NetworkBanner";
import { SwipeBackProvider } from "@/components/layout/SwipeBackProvider";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";

export const metadata: Metadata = {
  title: "얼마 - 중고 경매 플랫폼",
  description: "상품만 올리면, 시장이 가격을 정해주는 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f14" },
  ],
};

// FOUC 방지: 페이지 로드 시 테마를 즉시 적용하는 인라인 스크립트
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    var d = document.documentElement;
    if (t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      d.setAttribute('data-theme', 'dark');
    } else {
      d.setAttribute('data-theme', 'light');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-bg text-text-primary">
        <AuthInitializer>
          <SwipeBackProvider>
            <Header />
            <main className="flex-1 pb-16 md:pb-0">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <BottomNav />
            <FloatingActionButton />
          </SwipeBackProvider>
          <NetworkBanner />
          <ToastProvider />
        </AuthInitializer>
      </body>
    </html>
  );
}
