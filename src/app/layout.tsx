import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "订单记账系统",
  description: "一个简单的订单记账管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}