import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Recipe Manager",
  description: "Browse, search, and scale recipes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <header>
          <div className="container mx-auto px-4 py-3 relative flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-orange-600 hover:text-orange-700"
            >
              Hell&apos;s Kitchen
            </Link>
            <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <TopNav />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
