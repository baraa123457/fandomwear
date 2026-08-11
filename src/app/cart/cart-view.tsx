"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useCatalog } from "@/context/catalog-context";
import { TeeArt } from "@/components/shared/tee-art";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/toast-context";

const FREE_SHIPPING_THRESHOLD = 75;

export default function CartPage() {
  const {
    lines,
    subtotal,
    discount,
    total,
    coupon,
    removeItem,
    setQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const { toast } = useToast();
  const { getUniverse } = useCatalog();

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const { success, message } = await applyCoupon(couponInput);
    if (success) {
      toast({ variant: "success", title: "Coupon applied", description: couponInput.toUpperCase() });
      setCouponInput("");
    } else {
      toast({ variant: "error", title: "Invalid or expired code", description: message ?? couponInput.toUpperCase() });
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <ShoppingBag className="h-10 w-10 text-ink-faint" />
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-1.5 text-sm text-ink-dim">Find something you love and it&apos;ll show up here.</p>
        <Button asChild variant="accent" size="md" className="mt-6">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
        Your cart · {lines.reduce((n, l) => n + l.quantity, 0)} items
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="rounded-2xl border border-line">
            <div className="h-1.5 w-full overflow-hidden rounded-t-2xl bg-surface-2">
              <div
                className="h-full bg-accent-cyan transition-all duration-500"
                style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
            <p className="border-b border-line px-5 py-3 text-xs text-ink-faint">
              {remaining === 0 ? (
                <span className="text-accent-cyan">You&apos;ve unlocked free shipping</span>
              ) : (
                <>
                  <span className="text-ink-dim">{formatPrice(remaining)}</span> away from free shipping
                </>
              )}
            </p>

            <ul className="divide-y divide-line">
              {lines.map((line) => {
                const universe = getUniverse(line.universe)!;
                return (
                  <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4 p-5">
                    <TeeArt
                      color={universe.color}
                      icon={line.artIcon}
                      label={line.name}
                      className="h-28 w-22 shrink-0"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: universe.color }}>
                            {universe.label}
                          </p>
                          <Link href={`/product/${line.slug}`} className="font-medium text-ink hover:underline underline-offset-4">
                            {line.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            {line.size} · {line.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(line.productId, line.size, line.color)}
                          aria-label={`Remove ${line.name} from cart`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-accent-red"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-1 rounded-full border border-line">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setQuantity(line.productId, line.size, line.color, line.quantity - 1)
                            }
                            className="flex h-9 w-9 items-center justify-center text-ink-dim hover:text-ink"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-ink">
                            {line.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() =>
                              setQuantity(line.productId, line.size, line.color, line.quantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center text-ink-dim hover:text-ink"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-mono text-sm font-semibold text-ink">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <Link href="/shop" className="mt-5 inline-block text-sm text-ink-dim underline underline-offset-4 hover:text-ink">
            ← Continue shopping
          </Link>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>

          {coupon ? (
            <div className="mt-4 flex items-center justify-between rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-accent-cyan">
                <CheckCircle2 className="h-3.5 w-3.5" /> {coupon.code} applied
              </span>
              <button onClick={removeCoupon} className="text-xs text-ink-faint hover:text-ink">
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-full border border-line bg-void px-4 py-2.5">
              <Tag className="h-3.5 w-3.5 text-ink-faint" />
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                placeholder="Discount code"
                className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button onClick={handleApplyCoupon} className="text-xs font-semibold text-accent-cyan hover:text-accent-cyan/80">
                Apply
              </button>
            </div>
          )}
          {!coupon && (
            <p className="mt-1.5 text-[11px] text-ink-faint">
              Try <span className="font-mono text-ink-dim">WELCOME10</span>,{" "}
              <span className="font-mono text-ink-dim">FREESHIP</span>, or{" "}
              <span className="font-mono text-ink-dim">ANIME20</span>
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-dim">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent-cyan">
                <span>Discount</span>
                <span className="font-mono">−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-dim">
              <span>Shipping</span>
              <span className="font-mono text-ink">{remaining === 0 ? "Free" : "Calculated at checkout"}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span className="font-mono">{formatPrice(total)}</span>
            </div>
          </div>

          <Button asChild size="lg" variant="accent" className="mt-6 w-full">
            <Link href="/checkout">Checkout · {formatPrice(total)}</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
