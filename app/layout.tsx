import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOIX - 음성 인터랙티브 설문",
  description: "음성 기반 인터랙티브 설문 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
