import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { StoreProvider } from "@/lib/store";
import { AppWalletProvider } from "@/components/WalletProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solfund — Solana Crowdfunding",
  description: "Create, fund, and manage campaigns on Solana devnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppWalletProvider>
            <StoreProvider>
              <Header />
              <main className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
                <div className="relative">
                  {children}
                </div>
              </main>
              <Toaster richColors position="top-right" expand={false} closeButton />
            </StoreProvider>
          </AppWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
