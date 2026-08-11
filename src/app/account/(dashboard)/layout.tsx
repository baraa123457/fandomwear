"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MapPin, Package, User, Heart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export default function AccountDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/account/login");
  }, [isLoading, user, router]);

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <div className="mb-6">
            <p className="font-display text-sm font-bold text-ink">{user.name}</p>
            <p className="text-xs text-ink-faint">{user.email}</p>
          </div>
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-ink/5 text-ink" : "text-ink-faint hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="mt-2 flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-faint transition-colors hover:bg-ink/5 hover:text-accent-red"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
