"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { getRatingBreakdown } from "@/lib/data/reviews";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewRow {
  id: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  size: string | null;
  verified: boolean;
  created_at: string;
}

export function Reviews({ productId, averageRating }: { productId: string; averageRating: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setIsLoading(false);
  }, [supabase, productId]);

  useEffect(() => {
    setIsLoading(true);
    load();
  }, [load]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;
  const breakdown = getRatingBreakdown(reviews);

  const openForm = () => {
    if (myReview) setForm({ rating: myReview.rating, title: myReview.title, body: myReview.body });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    // One row per (product, user) — resubmitting edits your existing review
    // rather than creating a duplicate (see the unique constraint + this
    // upsert's onConflict target).
    const { error } = await supabase.from("reviews").upsert(
      {
        product_id: productId,
        user_id: user.id,
        author_name: user.name,
        rating: form.rating,
        title: form.title,
        body: form.body,
      },
      { onConflict: "product_id,user_id" }
    );
    setSubmitting(false);
    if (error) {
      toast({ variant: "error", title: "Couldn't submit review", description: error.message });
      return;
    }
    toast({ variant: "success", title: myReview ? "Review updated" : "Review submitted" });
    setShowForm(false);
    await load();
  };

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
      <div>
        <p className="font-display text-4xl font-bold text-ink">{averageRating.toFixed(1)}</p>
        <StarRating rating={averageRating} size="md" />
        <p className="mt-1.5 text-xs text-ink-faint">Based on {reviews.length} reviews</p>

        <div className="mt-5 flex flex-col gap-1.5">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2 text-xs text-ink-faint">
              <span className="w-3">{b.star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent-cyan" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-7 text-right">{b.count}</span>
            </div>
          ))}
        </div>

        {user ? (
          <Button variant="outline" size="sm" className="mt-5 w-full" onClick={openForm}>
            {myReview ? "Edit your review" : "Write a review"}
          </Button>
        ) : (
          <p className="mt-5 text-xs text-ink-faint">Sign in to leave a review.</p>
        )}
      </div>

      <div>
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5"
          >
            <div>
              <span className="text-xs font-medium text-ink-dim">Your rating</span>
              <div className="mt-1.5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: value }))}
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          value <= form.rating ? "fill-accent-cyan text-accent-cyan" : "text-line"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            <label>
              <span className="text-xs font-medium text-ink-dim">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1.5 h-10 w-full rounded-xl border border-line bg-void px-3.5 text-sm text-ink focus:border-accent-cyan focus:outline-none"
              />
            </label>
            <label>
              <span className="text-xs font-medium text-ink-dim">Review</span>
              <textarea
                required
                rows={3}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="mt-1.5 w-full resize-none rounded-xl border border-line bg-void px-3.5 py-2.5 text-sm text-ink focus:border-accent-cyan focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <Button type="submit" variant="accent" size="sm" disabled={submitting}>
                {submitting ? "Submitting..." : myReview ? "Save changes" : "Submit review"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-ink-faint">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-ink-faint">No reviews yet — be the first to write one.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-line pb-6 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} />
                    {r.verified && (
                      <span className="flex items-center gap-1 text-[11px] text-accent-cyan">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-ink-faint" dateTime={r.created_at}>
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </time>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-dim">{r.body}</p>
                <p className="mt-2 text-xs text-ink-faint">{r.author_name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
