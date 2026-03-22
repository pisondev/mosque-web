import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import Google OAuth Provider
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mosque SaaS",
  description: "Modern Mosque Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil Client ID dari .env.local
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus children dengan Provider */}
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}