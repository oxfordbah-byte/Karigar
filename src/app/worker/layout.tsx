import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Karigar Worker",
  description: "View and manage your Karigar jobs.",
};

export default function WorkerRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50">
        <header className="sticky top-0 z-20 bg-white border-b-2 border-[#d21f3c]">
          <div className="mx-auto max-w-md flex items-center justify-between px-4 py-3">
            <span className="text-lg font-extrabold tracking-tight text-[#d21f3c]">
              KARIGAR <span className="text-neutral-400 font-medium text-sm">Worker</span>
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
