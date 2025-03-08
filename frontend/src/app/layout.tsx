import RefundManager from "@/components/RefundManager"; // Import RefundManager
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crowdfunding DApp",
  description: "A decentralized crowdfunding platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RefundManager /> {/* Add RefundManager to run globally */}
        {children}
      </body>
    </html>
  );
}
