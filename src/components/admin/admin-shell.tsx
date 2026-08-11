"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Boxes,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/discounts", label: "Discount codes", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoading, logout } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace("/admin/login");
  }, [isLoading, isAdmin, router]);

  if (isLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-line px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-6">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-accent-purple/15 text-accent-purple" : "text-ink-dim hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
              className="mt-2 flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-faint transition-colors hover:bg-ink/5 hover:text-accent-red lg:mt-4"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>

          <Link
            href="/"
            className="mt-8 hidden items-center gap-1.5 text-xs text-ink-faint hover:text-ink lg:flex"
          >
            <ExternalLink className="h-3 w-3" /> View storefront
          </Link>
        </aside>

        <main className="px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
