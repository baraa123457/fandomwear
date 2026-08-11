"use client";

import { useMemo, useRef, useState, FormEvent, ChangeEvent } from "react";
import { Download, Pencil, Plus, RotateCcw, Save, Search, Trash2, Upload, X } from "lucide-react";
import { Product, Size, UniverseInfo } from "@/lib/types";
import { useCatalog } from "@/context/catalog-context";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { ManageOptionsList } from "@/components/admin/manage-options-list";
import { ProductVisual } from "@/components/shared/product-visual";
import { Dropdown } from "@/components/shared/dropdown";
import { useToast } from "@/context/toast-context";
import { formatPrice, cn } from "@/lib/utils";
import { downloadCSV, parseCSV, productsToCSV, rowsToProducts } from "@/lib/csv";

const FALLBACK_PALETTE = ["#7C5CFF", "#22D3EE", "#FF3B4E", "#22C55E", "#F59E0B", "#EC4899", "#38BDF8", "#A855F7"];

function slugify(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ALL_SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

type Draft = Pick<Product, "name" | "category" | "universe" | "price" | "stock" | "artIcon" | "sizes"> & {
  image?: string;
};

const emptyDraft: Draft = {
  name: "",
  category: "Oversized Tee",
  universe: "gaming",
  price: 34.99,
  stock: 50,
  artIcon: "Gamepad2",
  image: undefined,
  sizes: [...ALL_SIZES],
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB — data URLs live in local state, so keep this sane

export default function AdminProductsPage() {
  const { toast } = useToast();
  const {
    products: list,
    universes: universeOptions,
    categories: categoryOptions,
    addProduct,
    updateProduct,
    deleteProduct,
    addUniverse,
    removeUniverse,
    addCategory,
    removeCategory,
    importProducts,
    resetToSeed,
    uploadProductImage,
    isLoading: catalogLoading,
    getUniverse,
  } = useCatalog();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const addUniverseOption = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = slugify(trimmed) || `universe-${Date.now()}`;
    if (universeOptions.some((u) => u.id === id)) {
      toast({ variant: "error", title: "That universe already exists" });
      return;
    }
    const color = FALLBACK_PALETTE[universeOptions.length % FALLBACK_PALETTE.length];
    const newUniverse: UniverseInfo = {
      id,
      label: trimmed,
      tagline: "",
      color,
      icon: "Sparkles",
      productCount: 0,
    };
    const { error } = await addUniverse(newUniverse);
    if (error) {
      toast({ variant: "error", title: "Couldn't add universe", description: error });
      return;
    }
    toast({ variant: "success", title: "Universe added", description: trimmed });
  };

  const removeUniverseOption = async (id: string) => {
    if (universeOptions.length <= 1) {
      toast({ variant: "error", title: "You need at least one universe" });
      return;
    }
    const { error } = await removeUniverse(id);
    if (error) {
      toast({ variant: "error", title: "Couldn't remove universe", description: error });
      return;
    }
    const next = universeOptions.filter((u) => u.id !== id);
    if (draft.universe === id) setDraft((d) => ({ ...d, universe: next[0].id }));
  };

  const addCategoryOption = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (categoryOptions.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast({ variant: "error", title: "That category already exists" });
      return;
    }
    const { error } = await addCategory(trimmed);
    if (error) {
      toast({ variant: "error", title: "Couldn't add category", description: error });
      return;
    }
    toast({ variant: "success", title: "Category added", description: trimmed });
  };

  const removeCategoryOption = async (label: string) => {
    if (categoryOptions.length <= 1) {
      toast({ variant: "error", title: "You need at least one category" });
      return;
    }
    const { error } = await removeCategory(label);
    if (error) {
      toast({ variant: "error", title: "Couldn't remove category", description: error });
      return;
    }
    const next = categoryOptions.filter((c) => c !== label);
    if (draft.category === label) setDraft((d) => ({ ...d, category: next[0] }));
  };

  const resolveUniverseColor = (id: string) => getUniverse(id).color;

  const filtered = useMemo(
    () => list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      category: p.category,
      universe: p.universe,
      price: p.price,
      stock: p.stock,
      artIcon: p.artIcon,
      image: p.image,
      sizes: p.sizes,
    });
    setDialogOpen(true);
  };

  const toggleSize = (size: Size) => {
    setDraft((d) => {
      const has = d.sizes.includes(size);
      if (has && d.sizes.length <= 1) {
        toast({ variant: "error", title: "At least one size is required" });
        return d;
      }
      return { ...d, sizes: has ? d.sizes.filter((s) => s !== size) : [...d.sizes, size] };
    });
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "error", title: "That's not an image file" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({ variant: "error", title: "Image too large", description: "Max 4MB." });
      return;
    }
    setUploadingPhoto(true);
    const { url, error } = await uploadProductImage(file);
    setUploadingPhoto(false);
    if (error || !url) {
      toast({ variant: "error", title: "Upload failed", description: error ?? undefined });
      return;
    }
    setDraft((d) => ({ ...d, image: url }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = editingId ? await updateProduct(editingId, draft) : await addProduct(draft);
    setSubmitting(false);
    if (error) {
      toast({ variant: "error", title: editingId ? "Couldn't save changes" : "Couldn't add product", description: error });
      return;
    }
    toast({
      variant: "success",
      title: editingId ? "Product updated" : "Product added",
      description: draft.name,
    });
    setDialogOpen(false);
  };

  const requestDelete = (p: Product) => {
    setDeleteTarget(p);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteProduct(deleteTarget.id);
    if (error) {
      toast({ variant: "error", title: "Couldn't delete product", description: error });
      return;
    }
    toast({ variant: "info", title: "Product removed", description: deleteTarget.name });
    setDeleteTarget(null);
  };

  const handleExportCSV = () => {
    if (list.length === 0) {
      toast({ variant: "error", title: "No products to export" });
      return;
    }
    downloadCSV(`fandomwear-products-${new Date().toISOString().slice(0, 10)}.csv`, productsToCSV(list));
    toast({ variant: "success", title: "Exported", description: `${list.length} products` });
  };

  const handleImportClick = () => csvInputRef.current?.click();

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (list.length === 0) {
      toast({ variant: "error", title: "Add at least one product first", description: "Import needs an existing product as a template for missing fields." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      const rows = parseCSV(text);
      const { products: imported, errors: parseErrors } = rowsToProducts(rows, list[0]);
      let importErrors: string[] = [];
      if (imported.length > 0) {
        const result = await importProducts(imported);
        importErrors = result.errors;
        const succeeded = imported.length - importErrors.length;
        if (succeeded > 0) {
          toast({ variant: "success", title: "Imported", description: `${succeeded} products` });
        }
      }
      const allErrors = [...parseErrors, ...importErrors];
      if (allErrors.length > 0) {
        toast({ variant: "error", title: "Some rows were skipped", description: allErrors.slice(0, 3).join(" ") });
      }
    };
    reader.onerror = () => toast({ variant: "error", title: "Couldn't read that file" });
    reader.readAsText(file);
  };

  const confirmReset = async () => {
    const { error } = await resetToSeed();
    setResetConfirmOpen(false);
    if (error) {
      toast({ variant: "error", title: "Reset failed", description: error });
      return;
    }
    toast({ variant: "info", title: "Catalog reset", description: "Products, universes, and categories restored to defaults." });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-faint">{list.length} products in catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-56 rounded-full border border-line bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
            />
          </div>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResetConfirmOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Reset to defaults
          </Button>
          <Dialog open={optionsDialogOpen} onOpenChange={setOptionsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4" /> Save universes & categories
              </Button>
            </DialogTrigger>
            <DialogContent title="Universes & categories">
              <p className="text-xs text-ink-faint">
                Changes here save immediately — no need to add a product.
              </p>
              <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-medium text-ink-dim">Universes</span>
                  <ManageOptionsList
                    items={universeOptions.map((u) => ({ value: u.id, label: u.label, color: u.color }))}
                    onAdd={addUniverseOption}
                    onRemove={removeUniverseOption}
                    addPlaceholder="Add universe..."
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-ink-dim">Categories</span>
                  <ManageOptionsList
                    items={categoryOptions.map((c) => ({ value: c, label: c }))}
                    onAdd={addCategoryOption}
                    onRemove={removeCategoryOption}
                    addPlaceholder="Add category..."
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="accent"
                size="md"
                className="mt-4"
                onClick={() => setOptionsDialogOpen(false)}
              >
                Done
              </Button>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" size="sm" onClick={openNew}>
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent title={editingId ? "Edit product" : "Add product"}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <label>
                  <span className="text-xs font-medium text-ink-dim">Name</span>
                  <input
                    required
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
                  />
                </label>

                <div>
                  <span className="text-xs font-medium text-ink-dim">Photo</span>
                  <div className="mt-1.5 flex items-center gap-3">
                    <ProductVisual
                      image={draft.image}
                      color={resolveUniverseColor(draft.universe)}
                      icon={draft.artIcon}
                      className="h-20 w-20 shrink-0"
                    />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          <Upload className="h-3.5 w-3.5" />{" "}
                          {uploadingPhoto ? "Uploading..." : draft.image ? "Replace photo" : "Upload photo"}
                        </Button>
                        {draft.image && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDraft((d) => ({ ...d, image: undefined }))}
                          >
                            <X className="h-3.5 w-3.5" /> Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-faint">
                        JPG or PNG, up to 4MB. {draft.image ? "" : "No photo yet — a placeholder will be used until one is uploaded."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <label>
                    <span className="text-xs font-medium text-ink-dim">Universe</span>
                    <Dropdown
                      className="mt-1.5"
                      fullWidth
                      ariaLabel="Universe"
                      value={draft.universe}
                      options={universeOptions.map((u) => ({ value: u.id, label: u.label }))}
                      onChange={(universe) => setDraft((d) => ({ ...d, universe }))}
                    />
                    <ManageOptionsList
                      items={universeOptions.map((u) => ({ value: u.id, label: u.label, color: u.color }))}
                      onAdd={addUniverseOption}
                      onRemove={removeUniverseOption}
                      addPlaceholder="Add universe..."
                    />
                  </label>
                  <label>
                    <span className="text-xs font-medium text-ink-dim">Category</span>
                    <Dropdown
                      className="mt-1.5"
                      fullWidth
                      ariaLabel="Category"
                      value={draft.category}
                      options={categoryOptions.map((c) => ({ value: c, label: c }))}
                      onChange={(category) => setDraft((d) => ({ ...d, category }))}
                    />
                    <ManageOptionsList
                      items={categoryOptions.map((c) => ({ value: c, label: c }))}
                      onAdd={addCategoryOption}
                      onRemove={removeCategoryOption}
                      addPlaceholder="Add category..."
                    />
                  </label>
                </div>
                <div>
                  <span className="text-xs font-medium text-ink-dim">Sizes available to customers</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {ALL_SIZES.map((s) => {
                      const active = draft.sizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          aria-pressed={active}
                          className={cn(
                            "h-10 w-14 rounded-xl border text-sm font-semibold transition-colors",
                            active
                              ? "border-accent-purple bg-accent-purple/15 text-accent-purple"
                              : "border-line text-ink-faint hover:border-ink-faint hover:text-ink"
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-faint">
                    Only the sizes selected here will be choosable on the product page.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <label>
                    <span className="text-xs font-medium text-ink-dim">Price ($)</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min={0}
                      value={draft.price}
                      onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                      className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
                    />
                  </label>
                  <label>
                    <span className="text-xs font-medium text-ink-dim">Stock</span>
                    <input
                      required
                      type="number"
                      min={0}
                      value={draft.stock}
                      onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
                      className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink focus:border-accent-cyan focus:outline-none"
                    />
                  </label>
                </div>
                <Button type="submit" variant="accent" size="md" className="mt-2" disabled={submitting || uploadingPhoto}>
                  {submitting ? "Saving..." : editingId ? "Save changes" : "Add product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Universe</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-faint">
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-faint">
                  {search ? "No products match your search." : "No products yet — add your first one."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
              const universe = getUniverse(p.universe);
              const status = p.stock === 0 ? "out" : p.stock <= 30 ? "low" : "healthy";
              return (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductVisual image={p.image} color={universe.color} icon={p.artIcon} className="h-10 w-10 shrink-0" />
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink-faint">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-ink-dim">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: universe.color }} />
                      {universe.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">{formatPrice(p.price)}</td>
                  <td className={cn("px-4 py-3 font-mono", p.stock <= 30 && "text-amber-400")}>{p.stock}</td>
                  <td className="px-4 py-3"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-ink"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => requestDelete(p)}
                        aria-label={`Delete ${p.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-accent-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent title="Delete product">
          <p className="text-sm text-ink-dim">
            Delete <span className="font-medium text-ink">{deleteTarget?.name}</span>? This can&apos;t be undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-accent-red text-accent-red hover:bg-accent-red/10"
              onClick={confirmDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent title="Reset to default catalog">
          <p className="text-sm text-ink-dim">
            This replaces all products, universes, and categories with the original seed data. Anything
            you&apos;ve added or changed will be lost. This can&apos;t be undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-accent-red text-accent-red hover:bg-accent-red/10"
              onClick={confirmReset}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
