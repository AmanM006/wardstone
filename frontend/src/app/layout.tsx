import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import GlobalShaderGradient from "@/components/GlobalShaderGradient";

export const metadata: Metadata = {
  title: "Wardstone AP2 | Autonomous Agent Governance",
  description: "Pre-settlement circuit breakers for autonomous agent commerce",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-black text-[#ededed]">
        <GlobalShaderGradient />
        {children}
      </body>
    </html>
  );
}
