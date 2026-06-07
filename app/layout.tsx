import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Brand Positioning",
  description:
    "Analyse how your brand is positioned inside AI chatbots — visibility, associations, competitive gaps, and GEO content audit.",
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
