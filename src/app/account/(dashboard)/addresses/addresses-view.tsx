"use client";

import { useEffect, useState, FormEvent } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";

interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const STORAGE_KEY = "fandomwear:addresses";

const seed: Address[] = [
  {
    id: "a1",
    label: "Home",
    fullName: "Alex Rivera",
    line1: "142 Maple Street",
    city: "Austin",
    state: "TX",
    zip: "73301",
    country: "United States",
    isDefault: true,
  },
];

const emptyForm: Omit<Address, "id" | "isDefault"> = {
  label: "",
  fullName: "",
  line1: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

export default function AddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setAddresses(raw ? JSON.parse(raw) : seed);
    } catch {
      setAddresses(seed);
    }
  }, []);

  const persist = (next: Address[]) => {
    setAddresses(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setForm(address);
    setDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      persist(addresses.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      toast({ variant: "success", title: "Address updated" });
    } else {
      const newAddress: Address = { ...form, id: `a${Date.now()}`, isDefault: addresses.length === 0 };
      persist([...addresses, newAddress]);
      toast({ variant: "success", title: "Address added" });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    persist(addresses.filter((a) => a.id !== id));
    toast({ variant: "info", title: "Address removed" });
  };

  const handleSetDefault = (id: string) => {
    persist(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Addresses</h1>
          <p className="mt-1 text-sm text-ink-faint">Manage your shipping addresses.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add address
            </Button>
          </DialogTrigger>
          <DialogContent title={editingId ? "Edit address" : "Add address"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <TextField label="Label (e.g. Home, Work)" required value={form.label} onChange={(v) => setForm((f) => ({ ...f, label: v }))} />
              <TextField label="Full name" required value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} />
              <TextField label="Address" required value={form.line1} onChange={(v) => setForm((f) => ({ ...f, line1: v }))} />
              <div className="grid grid-cols-2 gap-3.5">
                <TextField label="City" required value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
                <TextField label="State" required value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <TextField label="ZIP" required value={form.zip} onChange={(v) => setForm((f) => ({ ...f, zip: v }))} />
                <TextField label="Country" required value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
              </div>
              <Button type="submit" variant="accent" size="md" className="mt-2">
                {editingId ? "Save changes" : "Add address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line py-16 text-center">
          <MapPin className="h-8 w-8 text-ink-faint" />
          <p className="mt-3 text-sm text-ink-dim">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{a.label}</p>
                  {a.isDefault && (
                    <span className="rounded-full bg-accent-cyan/15 px-2 py-0.5 text-[10px] font-bold text-accent-cyan">
                      DEFAULT
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(a)}
                    aria-label={`Edit ${a.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    aria-label={`Delete ${a.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-accent-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink-dim">{a.fullName}</p>
              <p className="text-sm text-ink-faint">
                {a.line1}, {a.city}, {a.state} {a.zip}, {a.country}
              </p>
              {!a.isDefault && (
                <button
                  onClick={() => handleSetDefault(a.id)}
                  className="mt-3 text-xs font-medium text-ink-dim underline underline-offset-4 hover:text-ink"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-medium text-ink-dim">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
      />
    </label>
  );
}
