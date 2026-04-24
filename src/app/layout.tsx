import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { headers, cookies } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { defaultLocale, type Locale } from "@/i18n/request";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orvyn-Labs Research Funding",
  description: "Decentralized research crowdfunding on Base Network — Bachelor Thesis Project",
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

  // Get locale from cookie
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || defaultLocale) as Locale;

  // Load messages for the current locale
  const messages = (await import(`@/locales/${locale}.json`)).default;

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
