import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resonance — Privacy-First AI Workplace Accessibility Platform",
  description: "Local-first workplace communication assistant for deaf and hard-of-hearing employees. On-device captions, personal name matching, and environmental sound classification with zero cloud audio transmission.",
  keywords: ["accessibility", "deaf workplace", "hard of hearing", "local AI", "offline captions", "speech-to-text", "environmental sound detection"],
  authors: [{ name: "Resonance Team" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
