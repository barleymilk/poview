import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POVIEW",
  description: "Height-based POV simulation commerce experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
