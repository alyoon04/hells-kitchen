import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b">
          <div className="container mx-auto px-4 py-3 flex justify-center sm:justify-start">
            <TopNav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
