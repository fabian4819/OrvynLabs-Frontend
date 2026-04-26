import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orvyn-Labs - Research Funding Platform",
  description: "Decentralized research crowdfunding on DChain — Bachelor Thesis Project",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the wagmi cookie on the server to hydrate wallet state without a flash
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  // Get locale from cookie (default to English, only English is supported)
  const locale = "en" as const;

  // Load messages for the current locale
  const messages = (await import(`@/locales/en.json`)).default;

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers initialState={initialState} locale={locale} messages={messages}>
          <ClientLayout>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
