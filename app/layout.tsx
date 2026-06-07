import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Brand Positioning Audit",
  description:
    "Audit how well your brand's online content is structured for AI discovery and citation — scored against Princeton GEO research.",
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
