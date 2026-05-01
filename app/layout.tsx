import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Providers from "./providers";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: '--font-noto-bengali',
  subsets: ['bengali'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "অর্বান ফার্মিং",
  description: "Urban Farming Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansBengali.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
