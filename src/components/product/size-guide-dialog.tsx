"use client";

import { Ruler } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const chart = [
  { size: "S", chest: "38-40", length: "27", sleeve: "8.5" },
  { size: "M", chest: "41-43", length: "28", sleeve: "9" },
  { size: "L", chest: "44-46", length: "29", sleeve: "9.5" },
  { size: "XL", chest: "47-49", length: "30", sleeve: "10" },
  { size: "XXL", chest: "50-52", length: "31", sleeve: "10.5" },
];

export function SizeGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1.5 text-xs font-medium text-ink-dim underline underline-offset-4 hover:text-ink">
        <Ruler className="h-3.5 w-3.5" /> Size guide
      </DialogTrigger>
      <DialogContent title="Size guide">
        <p className="text-sm text-ink-dim">
          All measurements in inches, taken flat. FandomWear tees are cut oversized —
          if you&apos;re between sizes, size down for a true oversized fit.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-faint">
                <th className="py-2 pr-4">Size</th>
                <th className="py-2 pr-4">Chest</th>
                <th className="py-2 pr-4">Length</th>
                <th className="py-2">Sleeve</th>
              </tr>
            </thead>
            <tbody>
              {chart.map((row) => (
                <tr key={row.size} className="border-b border-line/60">
                  <td className="py-2.5 pr-4 font-semibold text-ink">{row.size}</td>
                  <td className="py-2.5 pr-4 font-mono text-ink-dim">{row.chest}&quot;</td>
                  <td className="py-2.5 pr-4 font-mono text-ink-dim">{row.length}&quot;</td>
                  <td className="py-2.5 font-mono text-ink-dim">{row.sleeve}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
