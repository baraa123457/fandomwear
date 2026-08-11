import { UniverseInfo } from "@/lib/types";

export const universes: UniverseInfo[] = [
  {
    id: "marvel",
    label: "Marvel",
    tagline: "Heroes, reimagined in thread",
    color: "#ED1D24",
    icon: "Zap",
    productCount: 6,
  },
  {
    id: "dc",
    label: "DC",
    tagline: "Gotham to Metropolis",
    color: "#2E7DFF",
    icon: "ShieldHalf",
    productCount: 4,
  },
  {
    id: "potter",
    label: "Harry Potter",
    tagline: "Wands, houses, legends",
    color: "#C9A227",
    icon: "Sparkles",
    productCount: 3,
  },
  {
    id: "anime",
    label: "Anime",
    tagline: "Shonen energy, everyday fit",
    color: "#B14CFF",
    icon: "Flame",
    productCount: 7,
  },
  {
    id: "gaming",
    label: "Gaming",
    tagline: "Loot for the real world",
    color: "#22D3EE",
    icon: "Gamepad2",
    productCount: 7,
  },
  {
    id: "fantasy",
    label: "Fantasy",
    tagline: "Dragons, realms, relics",
    color: "#22C55E",
    icon: "Swords",
    productCount: 2,
  },
  {
    id: "movies",
    label: "Movies",
    tagline: "Cult classics on cotton",
    color: "#F59E0B",
    icon: "Clapperboard",
    productCount: 1,
  },
];

// A small rotating palette for universes that don't have a curated color
// (e.g. custom ones added from the admin catalog manager).
export const FALLBACK_PALETTE = ["#7C5CFF", "#22D3EE", "#FF3B4E", "#22C55E", "#F59E0B", "#EC4899", "#38BDF8", "#A855F7"];

export function hashToIndex(input: string, mod: number) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % mod;
}

/**
 * Always returns a usable UniverseInfo, even for ids outside the given
 * list (e.g. a custom universe added via the admin catalog manager, or a
 * product left referencing one that was later removed). This keeps every
 * surface that renders a product (cards, product page, cart, etc.) from
 * crashing on an unrecognized universe id. Pass the *live* universes list
 * (from CatalogContext) when you have one; falls back to the static seed
 * list otherwise.
 */
export function resolveUniverse(list: UniverseInfo[], id: string): UniverseInfo {
  const found = list.find((u) => u.id === id);
  if (found) return found;
  return {
    id,
    label: id ? id.charAt(0).toUpperCase() + id.slice(1) : "Other",
    tagline: "",
    color: FALLBACK_PALETTE[hashToIndex(id, FALLBACK_PALETTE.length)],
    icon: "Sparkles",
    productCount: 0,
  };
}

export function getUniverse(id: string): UniverseInfo {
  return resolveUniverse(universes, id);
}
