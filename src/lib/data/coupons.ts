export interface DiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  expires: string;
}

/** Demo coupons a shopper can actually redeem at checkout. */
export const redeemableCoupons: DiscountCode[] = [
  { code: "WELCOME10", type: "percentage", value: 10, active: true, expires: "2026-12-31" },
  { code: "FREESHIP", type: "fixed", value: 5.99, active: true, expires: "2026-09-30" },
  { code: "ANIME20", type: "percentage", value: 20, active: true, expires: "2026-08-31" },
  { code: "VIP15", type: "percentage", value: 15, active: true, expires: "2026-10-15" },
];

export function validateCoupon(code: string): DiscountCode | null {
  const match = redeemableCoupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!match) return null;
  if (!match.active) return null;
  if (new Date(match.expires).getTime() < Date.now()) return null;
  return match;
}

export function computeDiscount(coupon: DiscountCode | null, subtotal: number): number {
  if (!coupon) return 0;
  const raw = coupon.type === "percentage" ? subtotal * (coupon.value / 100) : coupon.value;
  return Math.min(raw, subtotal);
}
