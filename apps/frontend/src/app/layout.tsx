import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trichology Clinic",
  description: "Clinical management platform for trichology workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

