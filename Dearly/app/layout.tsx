import type { Metadata } from "next";
import { Manjari } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const manjari = Manjari({
  variable: "--font-manjari",
  weight: ["100", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const conformity = localFont({
  src: "../public/fonts/Clint Marker.ttf",
  variable: "--font-clintMarker",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dearly - Preserve Your Loved One's Story",
  description: "Book a professionally produced interview to capture and preserve the stories of your loved ones for generations to come.",
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon_io/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/favicon_io/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/favicon_io/android-chrome-512x512.png',
      },
    ],
  },
  openGraph: {
    title: "Dearly - Preserve Your Loved One's Story",
    description: "Book a professionally produced interview to capture and preserve the stories of your loved ones for generations to come.",
    url: 'https://dearly.com',
    siteName: 'Dearly',
    images: [
      {
        url: '/dearly-logo.png',
        width: 1200,
        height: 630,
        alt: 'Dearly Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dearly - Preserve Your Loved One's Story",
    description: "Book a professionally produced interview to capture and preserve the stories of your loved ones for generations to come.",
    images: ['/dearly-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manjari.variable} ${conformity.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
