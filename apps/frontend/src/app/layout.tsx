import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica de Tricologia • PhaifferTech",
  description: "Plataforma de gestão clínica para fluxos de tricologia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}

