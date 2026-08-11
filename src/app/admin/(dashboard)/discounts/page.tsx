"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { Dropdown } from "@/components/shared/dropdown";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";

interface CouponRow {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order: number;
  active: boolean;
  usage_limit: number | null;
  uses: number;
  expires_at: string | null;
}

const emptyDraft = { code: "", type: "percentage" as "percentage" | "fixed", value: 10, maxUses: 100, expires: "" };

export default function AdminDiscountsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [codes, setCodes] = useState<CouponRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (!error && data) setCodes(data);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("coupons").insert({
      code: draft.code.toUpperCase(),
      discount_type: draft.type,
      discount_value: draft.value,
      usage_limit: draft.maxUses,
      active: true,
      expires_at: draft.expires || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ variant: "error", title: "Couldn't create code", description: error.message });
      return;
    }
    toast({ variant: "success", title: "Discount code created", description: draft.code.toUpperCase() });
    setDraft(emptyDraft);
    setDialogOpen(false);
    await load();
  };

  const toggleActive = async (c: CouponRow) => {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) {
      toast({ variant: "error", title: "Couldn't update code", description: error.message });
      return;
    }
    setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      toast({ variant: "error", title: "Couldn't delete code", description: error.message });
      return;
    }
    setCodes((prev) => prev.filter((c) => c.id !== id));
    toast({ variant: "info", title: "Discount code removed" });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Discount codes</h1>
          <p className="mt-1 text-sm text-ink-faint">{codes.length} codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4" /> New code
            </Button>
          </DialogTrigger>
          <DialogContent title="New discount code">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <label>
                <span className="text-xs font-medium text-ink-dim">Code</span>
                <input
                  required
                  value={draft.code}
                  onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                  placeholder="SUMMER25"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm uppercase text-ink focus:border-accent-cyan focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                <label>
                  <span className="text-xs font-medium text-ink-dim">Type</span>
                  <Dropdown
                    className="mt-1.5"
                    fullWidth
                    ariaLabel="Discount type"
                    value={draft.type}
                    options={[
                      { value: "percentage", label: "Percentage" },
                      { value: "fixed", label: "Fixed amount" },
                    ]}
                    onChange={(type) => setDraft((d) => ({ ...d, type: type as "percentage" | "fixed" }))}
                  />
                </label>
                <label>
                  <span className="text-xs font-medium text-ink-dim">Value</span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={draft.value}
                    onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <label>
                  <span className="text-xs font-medium text-ink-dim">Max uses</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={draft.maxUses}
                    onChange={(e) => setDraft((d) => ({ ...d, maxUses: Number(e.target.value) }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
                  />
                </label>
                <label>
                  <span className="text-xs font-medium text-ink-dim">Expires</span>
                  <input
                    type="date"
                    value={draft.expires}
                    onChange={(e) => setDraft((d) => ({ ...d, expires: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
                  />
                </label>
              </div>
              <Button type="submit" variant="accent" size="md" className="mt-2" disabled={submitting}>
                {submitting ? "Creating..." : "Create code"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-faint">
                  Loading discount codes...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-faint">
                  No discount codes yet.
                </td>
              </tr>
            ) : (
              codes.map((c) => {
                const maxUses = c.usage_limit ?? 0;
                return (
                  <tr key={c.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 font-mono font-semibold text-ink">{c.code}</td>
                    <td className="px-4 py-3 text-ink-dim">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value.toFixed(2)}`} off
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              maxUses > 0 && c.uses / maxUses > 0.9 ? "bg-accent-red" : "bg-accent-cyan"
                            )}
                            style={{ width: `${maxUses > 0 ? Math.min((c.uses / maxUses) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-faint">
                          {c.uses}/{maxUses || "∞"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-dim">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)}>
                        <StatusBadge status={c.active ? "active" : "inactive"} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        aria-label={`Delete ${c.code}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-accent-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
