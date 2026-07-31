import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Horizon Africa | Dashboard",
  description: "WhatsApp AI sales platform dashboard for Horizon Africa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-on-surface`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-outline-variant)",
              color: "var(--color-on-surface)",
            },
          }}
        />
      </body>
    </html>
  );
}
