import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
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
        <nav className="border-b">
          <div className="container mx-auto px-4 h-12 flex items-center gap-6 text-sm">
            <Link href="/recipes" className="font-semibold">
              Recipes
            </Link>
            <Link
              href="/favorites"
              className="text-muted-foreground hover:text-foreground"
            >
              Favorites
            </Link>
            <Link
              href="/shopping-list"
              className="text-muted-foreground hover:text-foreground"
            >
              Shopping list
            </Link>
            <Link
              href="/cook"
              className="text-muted-foreground hover:text-foreground"
            >
              Cook from pantry
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
