import { Product } from "@/lib/types";
import { Order } from "@/context/orders-context";

const PRODUCT_COLUMNS = [
  "id",
  "name",
  "slug",
  "universe",
  "category",
  "price",
  "compareAtPrice",
  "stock",
  "rating",
  "reviewCount",
  "material",
  "sizes",
  "colors",
  "tags",
  "artIcon",
  "image",
  "description",
  "createdAt",
] as const;

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function productsToCSV(products: Product[]): string {
  const header = PRODUCT_COLUMNS.join(",");
  const rows = products.map((p) =>
    PRODUCT_COLUMNS.map((col) => {
      switch (col) {
        case "sizes":
          return escapeCell(p.sizes.join("|"));
        case "colors":
          return escapeCell(p.colors.map((c) => `${c.name}:${c.hex}`).join("|"));
        case "tags":
          return escapeCell(p.tags.join("|"));
        case "image":
          // Uploaded photos are base64 data URLs that can run into the millions
          // of characters — far past what Excel/Sheets can hold in one cell,
          // and the reason past exports looked corrupted. We just flag whether
          // a custom photo exists; re-importing this file keeps the product's
          // existing photo untouched (see rowsToProducts/importProducts).
          return p.image ? "custom" : "";
        default:
          return escapeCell(String(p[col] ?? ""));
      }
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

const ORDER_COLUMNS = [
  "orderId",
  "date",
  "status",
  "customerName",
  "customerEmail",
  "productName",
  "size",
  "color",
  "quantity",
  "unitPrice",
  "lineTotal",
  "orderTotal",
] as const;

/**
 * One row per order line item (not per order), since that's the level a
 * "size the customer picked" actually applies at — an order can contain
 * several items in different sizes.
 */
export function ordersToCSV(orders: Order[]): string {
  const header = ORDER_COLUMNS.join(",");
  const rows = orders.flatMap((o) =>
    o.items.map((item) =>
      ORDER_COLUMNS.map((col) => {
        switch (col) {
          case "orderId":
            return escapeCell(o.id);
          case "date":
            return escapeCell(o.date);
          case "status":
            return escapeCell(o.status);
          case "customerName":
            return escapeCell(o.shippingAddress.fullName);
          case "customerEmail":
            return escapeCell(o.email);
          case "productName":
            return escapeCell(item.name);
          case "size":
            return escapeCell(item.size);
          case "color":
            return escapeCell(item.color);
          case "quantity":
            return escapeCell(String(item.quantity));
          case "unitPrice":
            return escapeCell(item.price.toFixed(2));
          case "lineTotal":
            return escapeCell((item.price * item.quantity).toFixed(2));
          case "orderTotal":
            return escapeCell(o.total.toFixed(2));
          default:
            return "";
        }
      }).join(",")
    )
  );
  return [header, ...rows].join("\n");
}

// Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, commas
// and newlines inside quotes. Good enough for round-tripping our own export.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export interface CSVImportResult {
  products: Product[];
  errors: string[];
}

/**
 * Turns parsed CSV rows into Product objects, filling any missing optional
 * fields from `fallback` (an existing product used as a template). Rows
 * missing a required field are skipped and reported in `errors`.
 */
export function rowsToProducts(rows: string[][], fallback: Product): CSVImportResult {
  const errors: string[] = [];
  if (rows.length === 0) return { products: [], errors: ["File is empty."] };

  const header = rows[0].map((h) => h.trim());
  const required = ["name", "universe", "category", "price", "stock"];
  const missingCols = required.filter((c) => !header.includes(c));
  if (missingCols.length > 0) {
    return { products: [], errors: [`Missing required column(s): ${missingCols.join(", ")}`] };
  }

  const products: Product[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const get = (col: string) => {
      const idx = header.indexOf(col);
      return idx === -1 ? undefined : cells[idx]?.trim();
    };

    const name = get("name");
    const universe = get("universe");
    const category = get("category");
    const priceRaw = get("price");
    const stockRaw = get("stock");

    if (!name || !universe || !category || !priceRaw || !stockRaw) {
      errors.push(`Row ${i + 1}: missing a required value, skipped.`);
      continue;
    }
    const price = Number(priceRaw);
    const stock = Number(stockRaw);
    if (Number.isNaN(price) || Number.isNaN(stock)) {
      errors.push(`Row ${i + 1}: price/stock must be numbers, skipped.`);
      continue;
    }

    const sizesRaw = get("sizes");
    const colorsRaw = get("colors");
    const tagsRaw = get("tags");
    const id = get("id") || `p${Date.now()}${i}`;

    // Template fields minus `image`: a CSV row can never carry real photo data
    // (see productsToCSV), so we never want the template's photo bleeding onto
    // a different product. New rows get no photo (fall back to generated art);
    // rows matching an existing id keep whatever photo that product already has,
    // since importProducts merges onto the current record and this object simply
    // won't include an `image` key to overwrite it with.
    const { image: _templateImage, ...templateRest } = fallback;

    products.push({
      ...templateRest,
      id,
      name,
      slug: get("slug") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      universe,
      category,
      price,
      stock,
      compareAtPrice: get("compareAtPrice") ? Number(get("compareAtPrice")) : undefined,
      rating: get("rating") ? Number(get("rating")) : fallback.rating,
      reviewCount: get("reviewCount") ? Number(get("reviewCount")) : fallback.reviewCount,
      material: get("material") || fallback.material,
      sizes: sizesRaw ? (sizesRaw.split("|").filter(Boolean) as Product["sizes"]) : fallback.sizes,
      colors: colorsRaw
        ? colorsRaw
            .split("|")
            .filter(Boolean)
            .map((c) => {
              const [cName, hex] = c.split(":");
              return { name: cName?.trim() ?? "", hex: hex?.trim() ?? "#000000" };
            })
        : fallback.colors,
      tags: tagsRaw ? (tagsRaw.split("|").filter(Boolean) as Product["tags"]) : [],
      artIcon: get("artIcon") || fallback.artIcon,
      // "image" in the CSV is just a "custom"/"" flag (see productsToCSV) — never
      // literal image data — so importing never overwrites a product's real photo.
      // Existing photos survive because importProducts merges onto the current record.
      description: get("description") || fallback.description,
      createdAt: get("createdAt") || new Date().toISOString(),
    });
  }

  return { products, errors };
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
