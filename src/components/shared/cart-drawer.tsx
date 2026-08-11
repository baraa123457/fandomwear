"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Tag, X, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { useCatalog } from "@/context/catalog-context";
import { TeeArt } from "@/components/shared/tee-art";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const FREE_SHIPPING_THRESHOLD = 75;

export function CartDrawer() {
  const {
    lines,
    isOpen,
    close,
    subtotal,
    discount,
    total,
    coupon,
    removeItem,
    setQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { toast } = useToast();
  const { getUniverse } = useCatalog();
  useBodyScrollLock(isOpen);
  const [couponInput, setCouponInput] = useState("");

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const shippingLabel =
    remaining === 0 ? "Free" : `${formatPrice(remaining)} away from free shipping`;

  const handleApply = async () => {
    if (!couponInput.trim()) return;
    const { success, message } = await applyCoupon(couponInput);
    if (success) {
      toast({ variant: "success", title: "Coupon applied", description: couponInput.toUpperCase() });
      setCouponInput("");
    } else {
      toast({ variant: "error", title: "Invalid or expired code", description: message ?? couponInput.toUpperCase() });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-void/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            role="dialog"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-md flex-col border-l border-line bg-void"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <ShoppingBag className="h-4.5 w-4.5" /> Your cart
              </h2>
              <button
                onClick={close}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-ink-faint" />
                <p className="text-sm text-ink-dim">Your cart is empty — for now.</p>
                <Button onClick={close} asChild variant="outline" size="sm">
                  <Link href="/shop">Browse the shop</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-6 py-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent-cyan transition-all duration-500"
                      style={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-faint">
                    Shipping: <span className="text-ink-dim">{shippingLabel}</span>
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                  <ul className="flex flex-col gap-5">
                    {lines.map((line) => {
                      const universe = getUniverse(line.universe)!;
                      return (
                        <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-3">
                          <TeeArt
                            color={universe.color}
                            icon={line.artIcon}
                            label={line.name}
                            className="h-20 w-16 shrink-0"
                          />
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-ink">{line.name}</p>
                              <button
                                onClick={() => removeItem(line.productId, line.size, line.color)}
                                aria-label={`Remove ${line.name} from cart`}
                                className="text-ink-faint hover:text-accent-red"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-ink-faint">
                              {line.size} · {line.color}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-full border border-line">
                                <button
                                  aria-label="Decrease quantity"
                                  onClick={() =>
                                    setQuantity(line.productId, line.size, line.color, line.quantity - 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center text-ink-dim hover:text-ink"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-medium text-ink">
                                  {line.quantity}
                                </span>
                                <button
                                  aria-label="Increase quantity"
                                  onClick={() =>
                                    setQuantity(line.productId, line.size, line.color, line.quantity + 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center text-ink-dim hover:text-ink"
                                >
                                  <Plus className="h-3 w-3" />
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

                <div className="border-t border-line px-6 py-5">
                  {coupon ? (
                    <div className="flex items-center justify-between rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2.5">
                      <span className="flex items-center gap-2 text-xs font-medium text-accent-cyan">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {coupon.code} applied
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-ink-faint hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5">
                      <Tag className="h-3.5 w-3.5 text-ink-faint" />
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
                        placeholder="Discount code"
                        className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
                      />
                      <button
                        onClick={handleApply}
                        className="text-xs font-semibold text-accent-cyan hover:text-accent-cyan/80"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-dim">Subtotal</span>
                      <span className="font-mono text-ink">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-accent-cyan">Discount</span>
                        <span className="font-mono text-accent-cyan">−{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-ink">Total</span>
                      <span className="font-mono text-ink">{formatPrice(total)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">Shipping and taxes calculated at checkout.</p>
                  {!coupon && (
                    <p className="mt-1 text-[11px] text-ink-faint">
                      Try <span className="font-mono text-ink-dim">WELCOME10</span> or{" "}
                      <span className="font-mono text-ink-dim">FREESHIP</span>
                    </p>
                  )}

                  <Button onClick={close} asChild size="lg" variant="accent" className="mt-4 w-full">
                    <Link href="/checkout">Checkout · {formatPrice(total)}</Link>
                  </Button>
                  <Link
                    href="/cart"
                    onClick={close}
                    className="mt-3 block text-center text-xs text-ink-faint underline underline-offset-4 hover:text-ink"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
