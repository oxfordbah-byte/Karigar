import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Karigar — Laundry Wash & Ironing, Pickup & Drop-off",
  description: "Book trusted laundry wash & ironing with free pickup and drop-off. More home services coming soon.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t-2 border-[#d21f3c] py-6 text-center text-sm text-neutral-600">
          <div className="flex flex-col items-center gap-1">
            <span>
              Customer care:{" "}
              <a href="tel:+919876543210" className="font-semibold text-[#d21f3c] hover:underline">
                +91 98765 43210
              </a>
            </span>
            <span className="text-neutral-400 text-xs">Built with Supabase + Vercel</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
