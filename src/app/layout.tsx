import type { Metadata } from "next";
import { Unbounded, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CatalogProvider } from "@/context/catalog-context";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { RecentlyViewedProvider } from "@/context/recently-viewed-context";
import { AuthProvider } from "@/context/auth-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { OrdersProvider } from "@/context/orders-context";
import { ToastProvider } from "@/context/toast-context";
import { ThemeProvider } from "@/context/theme-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { Preloader } from "@/components/shared/preloader";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fandomwear.example"),
  title: {
    default: "FandomWear — Wear Your Favorite Universes",
    template: "%s · FandomWear",
  },
  description:
    "Premium oversized T-shirts inspired by games, movies, anime, and legends. Original fan-inspired graphics on heavyweight cotton.",
  keywords: [
    "oversized t-shirts",
    "fandom apparel",
    "gaming streetwear",
    "anime streetwear",
    "graphic tees",
  ],
  openGraph: {
    title: "FandomWear — Wear Your Favorite Universes",
    description:
      "Premium oversized T-shirts inspired by games, movies, anime, and legends.",
    type: "website",
    siteName: "FandomWear",
  },
  twitter: {
    card: "summary_large_image",
    title: "FandomWear — Wear Your Favorite Universes",
    description:
      "Premium oversized T-shirts inspired by games, movies, anime, and legends.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${unbounded.variable} ${inter.variable} ${jbMono.variable}`}>
      <head>
        {/* Applies the saved theme before first paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('fandomwear:theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Preloader />
        <ThemeProvider>
          <ToastProvider>
            <CatalogProvider>
            <AuthProvider>
              <AdminAuthProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <OrdersProvider>
                      <CartProvider>
                        <a
                          href="#main-content"
                          className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:m-4 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-void"
                        >
                          Skip to content
                        </a>
                        <Navbar />
                        <main id="main-content">{children}</main>
                        <Footer />
                        <CartDrawer />
                      </CartProvider>
                    </OrdersProvider>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </AdminAuthProvider>
            </AuthProvider>
            </CatalogProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
