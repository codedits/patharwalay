import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: {
  default: "Patthar Walay | Timeless Gems & Fine Jewelry",
  template: "%s | Patthar Walay",
  },
  description:
    "Discover ethically sourced gemstones and handcrafted jewelry. Shop rings, pendants, and more.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" suppressHydrationWarning>
      <head>
        {/* Speed up first connection to Cloudinary (image CDN) */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
  <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${poppins.variable} antialiased bg-background text-foreground`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try{
                var stored = localStorage.getItem('theme');
                var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = stored || (systemDark ? 'dark' : 'light');
                var el = document.documentElement;
                if(theme==='dark') {
                  el.classList.add('dark');
                  el.classList.remove('light');
                } else {
                  el.classList.remove('dark');
                  el.classList.add('light');
                }
                el.style.colorScheme = theme;
              }catch(e){}
            })();
          `}}
        />
        <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
          <Header />
          <main id="content" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-0 pb-8 outline-light">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
