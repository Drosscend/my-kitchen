import type { Metadata } from "next";
import { Kalam } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-handwriting",
});

export const metadata: Metadata = {
  title: "Mon Garde-Manger",
  description: "Gérez votre inventaire d'ingrédients de cuisine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={kalam.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
        <Script
          src="https://analytics.kevin-dev.com/script.js"
          data-website-id="53aa53cc-5844-4e2b-b73f-0cae810eb3b4"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
