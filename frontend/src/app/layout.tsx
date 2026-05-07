import type { Metadata } from "next";

import "./globals.css";
import { Header } from "@/components/ui";

export const metadata: Metadata = {
  title: "ContractGuard AI",
  description: "AI-powered contract risk analysis platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative">
        <Header />
        <main className="relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
