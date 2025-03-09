import RefundManager from "@/components/RefundManager"; // Import RefundManager
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrowdFundX",
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
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
        {children}
      </body>
    </html>
  );
}
