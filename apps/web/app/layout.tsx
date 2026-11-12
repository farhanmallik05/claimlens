import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["serif"],
});

export const metadata: Metadata = {
  title: "ClaimLens — Shortfall Forecaster & Appeal Architect",
  description:
    "Your shortfall, forecast before discharge, with the clause behind every rupee. Interactive healthcare claim audit for 2026.",
  authors: [{ name: "ClaimLens Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${GeistSans.variable} ${GeistMono.variable} overflow-x-hidden`}
    >
      <body className="bg-paper text-ink font-ui antialiased min-h-screen selection:bg-red-soft selection:text-ink overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
