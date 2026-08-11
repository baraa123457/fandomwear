"use client";

import Link from "next/link";
import { Camera, AtSign, PlaySquare, MessageCircle } from "lucide-react";
import { useCatalog } from "@/context/catalog-context";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "New arrivals", href: "/shop?sort=new" },
      { label: "Best sellers", href: "/shop?sort=best" },
      { label: "Sale", href: "/shop?tag=sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Size guide", href: "/help/size-guide" },
      { label: "Shipping & returns", href: "/help/shipping" },
      { label: "Track order", href: "/account/orders" },
      { label: "Contact us", href: "/help/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About FandomWear", href: "/about" },
      { label: "Sustainability", href: "/about/sustainability" },
      { label: "Careers", href: "/about/careers" },
      { label: "Press", href: "/about/press" },
    ],
  },
];

export function Footer() {
  const { universes } = useCatalog();
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-ink">
              FANDOM<span className="text-accent-purple">WEAR</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-faint">
              Premium oversized tees inspired by the worlds you already live in.
              Original graphics, heavyweight cotton, made to last past the hype cycle.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Camera, AtSign, PlaySquare, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-faint transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-2">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              Universes
            </h4>
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
              {universes.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/shop?universe=${u.id}`}
                    className="text-sm text-ink-faint transition-colors hover:text-ink"
                  >
                    {u.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} FandomWear. All designs are original,
            fan-inspired works. Not affiliated with or endorsed by any studio or publisher.
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-faint">
            <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
            <span className="font-mono tracking-wider">VISA · MC · PAYPAL · APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
