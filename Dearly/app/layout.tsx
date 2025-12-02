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
