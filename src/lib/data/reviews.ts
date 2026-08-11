export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  size: string;
}

const authors = [
  "Jordan M.", "Priya S.", "Omar K.", "Lena F.", "Marcus T.",
  "Yuki N.", "Sofia R.", "Ben H.", "Aisha B.", "Diego L.",
];

const templates = [
  { title: "Better than expected", body: "The print quality holds up way better than I thought it would after a few washes. Fits oversized like the size guide says." },
  { title: "Perfect oversized fit", body: "Runs true to the size guide — went one up from my usual and it drapes exactly how it looks in photos." },
  { title: "Heavyweight, not see-through", body: "A lot of graphic tees this price feel thin. This one has real weight to the cotton, doesn't feel cheap at all." },
  { title: "Print cracked a little", body: "Design is great but I noticed some light cracking on the ink after a dozen washes. Still wearing it in regular rotation." },
  { title: "Exactly like the mockup", body: "Colors matched what I saw on the site, which almost never happens. Shipping was quick too." },
  { title: "My new go-to tee", body: "Ordered a second one in a different colorway the week after this arrived. That says enough." },
];

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getReviewsForProduct(productId: string, rating: number): Review[] {
  const seed = hashString(productId);
  const count = 3 + (seed % 3);
  return Array.from({ length: count }, (_, i) => {
    const t = templates[(seed + i * 7) % templates.length];
    const author = authors[(seed + i * 3) % authors.length];
    const variance = ((seed + i) % 3) - 1; // -1, 0, 1
    return {
      id: `${productId}-r${i}`,
      author,
      rating: Math.min(5, Math.max(3, Math.round(rating) + variance)),
      title: t.title,
      body: t.body,
      date: new Date(2026, (seed + i) % 7, ((seed + i * 5) % 27) + 1).toISOString(),
      verified: (seed + i) % 4 !== 0,
      size: ["S", "M", "L", "XL", "XXL"][(seed + i) % 5],
    };
  });
}

export function getRatingBreakdown(reviews: Review[]) {
  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const total = reviews.length || 1;
  return buckets.map((b) => ({ ...b, pct: Math.round((b.count / total) * 100) }));
}
