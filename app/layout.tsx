import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
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
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://patharwalay.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
  default: "Patthar Walay",
    template: "%s | Patthar Walay",
  },
  description:
    "Discover ethically sourced gemstones and handcrafted jewelry. Shop rings, pendants, and more.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Patthar Walay",
  title: "Patthar Walay",
    description:
      "Discover ethically sourced gemstones and handcrafted jewelry. Shop rings, pendants, and more.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@pattharwalay",
    site: "@pattharwalay",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
        {/* Canonical + SEO helpers */}
        <link rel="canonical" href={siteUrl} />
        <meta name="keywords" content="gemstones, jewelry, handcrafted jewelry, ruby, emerald, sapphire, opal, Patthar Walay" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}#organization`,
                  "name": "Patthar Walay",
                  "url": siteUrl,
                  "logo": `${siteUrl}/favicon.ico`,
                  "sameAs": [
                    "https://www.instagram.com/pattharwalay",
                    "https://www.facebook.com/pattharwalay"
                  ],
                  "contactPoint": [
                    {
                      "@type": "ContactPoint",
                      "telephone": "+92 300 1234567",
                      "contactType": "customer service",
                      "areaServed": "PK"
                    }
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}#website`,
                  "url": siteUrl,
                  "name": "Patthar Walay",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${siteUrl}/products?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            }),
          }}
        />
      </head>
  <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${poppins.variable} antialiased bg-background text-foreground`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try{
                var stored = localStorage.getItem('theme');
                // Default to dark when no explicit user preference is stored
                var theme = stored || 'dark';
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
          <Analytics />
        </div>
      </body>
    </html>
  );
}
