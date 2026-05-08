import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard ยอดขาย เงินติดล้อ 2569",
  description: "Real-time Sales Dashboard สำหรับติดตามยอดขาย เงินติดล้อ ปี 2569",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
