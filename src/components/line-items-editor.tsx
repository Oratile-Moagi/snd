"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  LINE_ITEM_TYPE_LABELS,
  type LineItem,
  type LineItemType,
} from "@/lib/types";
import { lineItemTotal, formatCurrency } from "@/lib/calc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function newItem(): LineItem {
  return {
    id: `li-${Math.random().toString(36).slice(2, 9)}`,
    description: "",
    type: "hourly",
    rate: 0,
    hours: 9,
    days: 1,
    quantity: 1,
  };
}

export function LineItemsEditor({
  items,
  onChange,
  currencySymbol = "R",
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currencySymbol?: string;
}) {
  function update(id: string, patch: Partial<LineItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }
  function add() {
    onChange([...items, newItem()]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="rounded-xl border bg-card p-3 shadow-sm sm:p-4"
        >
          <div className="flex items-start gap-2">
            <div className="mt-2 hidden text-muted-foreground sm:block">
              <GripVertical className="size-4" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Description</Label>
                  <Input
                    placeholder="e.g. Tipper truck hire"
                    value={item.description}
                    onChange={(e) =>
                      update(item.id, { description: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Pricing</Label>
                  <Select
                    value={item.type}
                    onValueChange={(v) =>
                      update(item.id, { type: v as LineItemType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LINE_ITEM_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs">
                    {item.type === "fixed" ? "Amount" : "Rate"}
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={item.rate || ""}
                    onChange={(e) =>
                      update(item.id, { rate: Number(e.target.value) })
                    }
                  />
                </div>
                {item.type === "hourly" && (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Hours / day</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={item.hours ?? ""}
                      onChange={(e) =>
                        update(item.id, { hours: Number(e.target.value) })
                      }
                    />
                  </div>
                )}
                {(item.type === "hourly" || item.type === "daily") && (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Days</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={item.days ?? ""}
                      onChange={(e) =>
                        update(item.id, { days: Number(e.target.value) })
                      }
                    />
                  </div>
                )}
                <div className="grid gap-1.5">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      update(item.id, { quantity: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Line {idx + 1}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(lineItemTotal(item), currencySymbol)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => remove(item.id)}
              aria-label="Remove line"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={add} className="w-full">
        <Plus className="size-4" /> Add line item
      </Button>
    </div>
  );
}
