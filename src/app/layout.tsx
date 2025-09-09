import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "BWC Academy - Roblox Game Development",
  description: "BWC Academy - Master Roblox game development from basics to advanced gameplay systems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, poppins.variable)}>
      <body className={cn(
        "min-h-screen bg-[#F8F8F8] text-[#212121] antialiased",
        inter.className
      )}>
        {children}
      </body>
    </html>
  );
}