import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Sidebar } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ELA - Employee Lifecycle Automation Platform",
  description: "Employee Lifecycle Automation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col bg-muted/30 text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-[280px] min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-8 overflow-auto custom-scrollbar">
            <div className="container mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}