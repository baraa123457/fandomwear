"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Heart, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { useCatalog } from "@/context/catalog-context";
import { resolveIcon } from "@/lib/icon-map";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { SearchOverlay } from "@/components/shared/search-overlay";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=new" },
  { label: "Best Sellers", href: "/shop?sort=best" },
];

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, open: openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();
  const { universes } = useCatalog();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useBodyScrollLock(mobileOpen);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-colors duration-300",
          scrolled
            ? "border-b border-line/80 bg-void/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
              <span>
                FANDOM<span className="text-accent-purple">WEAR</span>
              </span>
              {isAdmin && (
                <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-1 font-sans text-[10px] font-semibold uppercase leading-none tracking-wider text-ink-faint">
                  Admin
                </span>
              )}
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:text-ink"
                  aria-expanded={megaOpen}
                >
                  Collections
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", megaOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-1/2 top-full grid w-[560px] -translate-x-1/2 grid-cols-2 gap-1 rounded-2xl border border-line bg-surface/95 p-3 shadow-2xl backdrop-blur-xl"
                    >
                      {universes.map((u) => {
                        const Icon = resolveIcon(u.icon);
                        return (
                          <Link
                            key={u.id}
                            href={`/shop?universe=${u.id}`}
                            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink/5"
                          >
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${u.color}1f`, color: u.color }}
                            >
                              <Icon className="h-4.5 w-4.5" />
                            </span>
                            <span>
                              <span className="block text-sm font-medium text-ink">{u.label}</span>
                              <span className="block text-xs text-ink-faint">{u.tagline}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink sm:flex"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink sm:flex"
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-purple text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <ThemeToggle className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink sm:flex" />
            <Link
              href={user ? "/account/profile" : "/account/login"}
              aria-label={user ? `Account, signed in as ${user.name}` : "Sign in"}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink sm:flex"
            >
              <User className="h-4.5 w-4.5" />
            </Link>
            <button
              aria-label={`Cart, ${itemCount} items`}
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-cyan text-[10px] font-bold text-void">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/*
        SearchOverlay and the mobile menu are rendered OUTSIDE <header> on
        purpose. The header gains `backdrop-blur-xl` once the page is
        scrolled, and per the CSS spec any element with a backdrop-filter
        (or filter/transform/perspective) becomes the containing block for
        its `position: fixed` descendants — instead of the viewport. If
        these overlays lived inside <header>, they'd size/position
        themselves against the header's own small box the moment you
        scrolled, instead of covering the screen. Keeping them as siblings
        means they always resolve against the viewport, regardless of scroll
        position or the header's blur state.
      */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-void/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-display text-lg font-extrabold text-ink">
                FANDOM<span className="text-accent-purple">WEAR</span>
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-5 py-4">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium text-ink hover:bg-ink/5"
              >
                <Search className="h-4.5 w-4.5" /> Search
              </button>
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-lg font-medium text-ink hover:bg-ink/5"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-line" />
              {universes.map((u) => (
                <Link
                  key={u.id}
                  href={`/shop?universe=${u.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-base text-ink-dim hover:bg-ink/5 hover:text-ink"
                >
                  {u.label}
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: u.color }} />
                </Link>
              ))}
              <div className="my-2 h-px bg-line" />
              <Link
                href={user ? "/account/profile" : "/account/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium text-ink hover:bg-ink/5"
              >
                <User className="h-4.5 w-4.5" /> {user ? "My account" : "Sign in"}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium text-ink hover:bg-ink/5"
              >
                <Heart className="h-4.5 w-4.5" /> Wishlist
              </Link>
              <ThemeToggle
                showLabel
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-medium text-ink hover:bg-ink/5"
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
