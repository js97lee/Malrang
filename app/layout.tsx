import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "말랑이 - AI 기반 감성 아카이빙",
  description: "음성과 사진으로 기록하고, 감정을 시각화하고, 기념 영상을 만드는 서비스",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23FFD700'/></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}

