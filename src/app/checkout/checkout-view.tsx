"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useOrders, Order } from "@/context/orders-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { TeeArt } from "@/components/shared/tee-art";
import { Dropdown } from "@/components/shared/dropdown";
import { useCatalog } from "@/context/catalog-context";
import { formatPrice, cn } from "@/lib/utils";

const SHIPPING_FLAT = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;
const TAX_RATE = 0.08;

type PaymentMethod = "card" | "cod";

// Input formatters — keep each field to the kind of value it actually holds.
function onlyLetters(value: string) {
  return value.replace(/[^a-zA-Z\s'-]/g, "");
}
function onlyDigits(value: string, maxLen?: number) {
  const digits = value.replace(/\D/g, "");
  return typeof maxLen === "number" ? digits.slice(0, maxLen) : digits;
}
function formatCardNumber(value: string) {
  return onlyDigits(value, 19).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = onlyDigits(value, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function CheckoutPage() {
  const { lines, subtotal, discount, coupon, applyCoupon, removeCoupon, clearCart, close } = useCart();
  const { placeOrder } = useOrders();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { getUniverse } = useCatalog();
  const [placing, setPlacing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [form, setForm] = useState({
    fullName: "",
    email: user?.email ?? "",
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "Egypt",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const discountedSubtotal = subtotal - discount;
  const shipping =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0 ? 0 : SHIPPING_FLAT;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + shipping + tax;

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

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    close();

    const { order, error } = await placeOrder({
      items: lines,
      couponCode: coupon?.code,
      shipping,
      tax,
      paymentMethod,
      email: form.email,
      shippingAddress: {
        fullName: form.fullName,
        line1: form.line1,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
      },
    });

    setPlacing(false);

    if (error || !order) {
      toast({ variant: "error", title: "Couldn't place order", description: error ?? undefined });
      return;
    }

    setConfirmedOrder(order);
    clearCart();
  };

  if (!authLoading && !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <Lock className="h-10 w-10 text-ink-faint" />
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Sign in to check out</h1>
        <p className="mt-1.5 text-sm text-ink-dim">
          Orders are tied to your account so you can track them under My Orders. Your cart will still be here.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline" size="md">
            <Link href="/account/register">Create account</Link>
          </Button>
          <Button asChild variant="accent" size="md">
            <Link href="/account/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/15"
        >
          <CheckCircle2 className="h-8 w-8 text-accent-cyan" />
        </motion.div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Order confirmed</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Order <span className="font-mono text-ink">{confirmedOrder.id}</span> is on its way to{" "}
          {confirmedOrder.shippingAddress.city}.{" "}
          {confirmedOrder.paymentMethod === "cod"
            ? `Have ${formatPrice(confirmedOrder.total)} ready to pay when it arrives.`
            : `A confirmation was sent to ${form.email || "your email"}.`}
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline" size="md">
            <Link href="/shop">Continue shopping</Link>
          </Button>
          <Button asChild variant="accent" size="md">
            <Link href="/account/orders">View order</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <ShoppingBag className="h-10 w-10 text-ink-faint" />
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Your cart is empty</h1>
        <p className="mt-1.5 text-sm text-ink-dim">Add something first, then come back to check out.</p>
        <Button asChild variant="accent" size="md" className="mt-6">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-10">
          {/* Shipping */}
          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Truck className="h-4.5 w-4.5" /> Shipping
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required value={form.fullName} onChange={update("fullName")} className="sm:col-span-2" />
              <Field label="Email" type="email" required value={form.email} onChange={update("email")} className="sm:col-span-2" />
              <Field label="Address" required value={form.line1} onChange={update("line1")} className="sm:col-span-2" />
              <Field label="City" required value={form.city} onChange={update("city")} />
              <Field label="State / Province" required value={form.state} onChange={update("state")} />
              <label className="sm:col-span-2">
                <span className="text-xs font-medium text-ink-dim">Country</span>
                <Dropdown
                  className="mt-1.5"
                  fullWidth
                  ariaLabel="Country"
                  value={form.country}
                  options={[{ value: "Egypt", label: "Egypt" }]}
                  onChange={(country) => setForm((f) => ({ ...f, country }))}
                />
              </label>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <CreditCard className="h-4.5 w-4.5" /> Payment
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                aria-pressed={paymentMethod === "card"}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  paymentMethod === "card"
                    ? "border-accent-cyan bg-accent-cyan/10 text-ink"
                    : "border-line text-ink-dim hover:border-ink-faint"
                )}
              >
                <CreditCard className="h-4 w-4 shrink-0" /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                aria-pressed={paymentMethod === "cod"}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  paymentMethod === "cod"
                    ? "border-accent-cyan bg-accent-cyan/10 text-ink"
                    : "border-line text-ink-dim hover:border-ink-faint"
                )}
              >
                <Banknote className="h-4 w-4 shrink-0" /> Pay on delivery
              </button>
            </div>

            {paymentMethod === "card" ? (
              <>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-faint">
                  <Lock className="h-3 w-3" /> This is a demo checkout — no real payment is processed.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Name on card"
                    required
                    value={form.cardName}
                    onChange={(e) => setForm((f) => ({ ...f, cardName: onlyLetters(e.target.value) }))}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Card number"
                    required
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    maxLength={23}
                    value={form.cardNumber}
                    onChange={(e) => setForm((f) => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Expiry"
                    required
                    inputMode="numeric"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={form.expiry}
                    onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                  />
                  <Field
                    label="CVC"
                    required
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={form.cvc}
                    onChange={(e) => setForm((f) => ({ ...f, cvc: onlyDigits(e.target.value, 4) }))}
                  />
                </div>
              </>
            ) : (
              <p className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm text-ink-dim">
                Pay in cash when your order arrives at your door. Please have the exact amount ready —{" "}
                <span className="font-mono text-ink">{formatPrice(total)}</span>.
              </p>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {lines.map((line) => {
              const universe = getUniverse(line.universe)!;
              return (
                <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-3">
                  <TeeArt color={universe.color} icon={line.artIcon} label={line.name} className="h-16 w-13 shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-ink">{line.name}</p>
                    <p className="text-xs text-ink-faint">
                      {line.size} · {line.color} · Qty {line.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-ink">{formatPrice(line.price * line.quantity)}</span>
                </li>
              );
            })}
          </ul>

          {coupon ? (
            <div className="mt-5 flex items-center justify-between rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-accent-cyan">
                <CheckCircle2 className="h-3.5 w-3.5" /> {coupon.code} applied
              </span>
              <button type="button" onClick={removeCoupon} className="text-xs text-ink-faint hover:text-ink">
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 rounded-full border border-line bg-void px-4 py-2.5">
              <Tag className="h-3.5 w-3.5 text-ink-faint" />
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                placeholder="Discount code"
                className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button type="button" onClick={handleApplyCoupon} className="text-xs font-semibold text-accent-cyan hover:text-accent-cyan/80">
                Apply
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
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
              <span className="font-mono text-ink">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-ink-dim">
              <span>Estimated tax</span>
              <span className="font-mono text-ink">{formatPrice(tax)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <span>Total</span>
              <span className="font-mono">{formatPrice(total)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" variant="accent" className="mt-6 w-full" disabled={placing}>
            {placing
              ? "Placing order…"
              : paymentMethod === "cod"
                ? `Place order · Pay on delivery`
                : `Place order · ${formatPrice(total)}`}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={className}>
      <span className="text-xs font-medium text-ink-dim">{label}</span>
      <input
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
      />
    </label>
  );
}
