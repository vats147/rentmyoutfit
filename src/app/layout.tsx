import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B4332",
};

export const metadata: Metadata = {
  title: "ShahidRa Rentals - Ethnic Outfit Rental in Surat",
  description: "Rent beautiful ethnic outfits for weddings, festivals, and special occasions in Surat. Bridal lehengas, sherwanis, sarees, and more with secure deposits and verified sellers.",
  keywords: ["ethnic wear", "rental", "Surat", "lehenga", "sherwani", "saree", "wedding", "festival", "Indian wear"],
  authors: [{ name: "ShahidRa Rentals" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%231B4332' width='100' height='100' rx='20'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='50' font-weight='bold' fill='%23C9A84C'>SR</text></svg>",
  },
  openGraph: {
    title: "ShahidRa Rentals - Ethnic Outfit Rental",
    description: "Rent beautiful ethnic outfits for weddings and festivals in Surat",
    type: "website",
    locale: "en_IN",
  },
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

import { AuthProvider } from "@/components/auth/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
            strategy="beforeInteractive"
          />
        )}
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
