"use client";

import { useMemo, useState } from "react";
import { List, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { EQUIPMENT_TYPE_LABELS, type LineItemType } from "@/lib/types";
import { MACHINERY_CATALOG } from "@/lib/machinery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface EquipmentPick {
  description: string;
  equipmentId?: string;
  rate?: number;
  type?: LineItemType;
}

/**
 * Optional picker for line-item descriptions. Lets the user choose from their
 * own fleet (which also marks that unit On hire) or a pre-filled catalog of
 * common SA plant — but typing free-hand is always still allowed.
 */
export function EquipmentPickerDialog({
  onPick,
}: {
  onPick: (pick: EquipmentPick) => void;
}) {
  const equipment = useStore((s) => s.equipment);
  const updateEquipment = useStore((s) => s.updateEquipment);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const fleet = useMemo(
    () =>
      equipment.filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          EQUIPMENT_TYPE_LABELS[e.type].toLowerCase().includes(q)
      ),
    [equipment, q]
  );

  const catalog = useMemo(
    () =>
      MACHINERY_CATALOG.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => !q || i.toLowerCase().includes(q)),
      })).filter((cat) => cat.items.length > 0),
    [q]
  );

  function pickFleet(id: string) {
    const e = equipment.find((x) => x.id === id);
    if (!e) return;
    onPick({
      description: e.name,
      equipmentId: e.id,
      rate: e.defaultRate,
      type: e.defaultRateUnit === "hour" ? "hourly" : "daily",
    });
    if (e.status !== "on_hire") {
      updateEquipment(e.id, { status: "on_hire" });
      toast.success(`${e.name} marked On hire.`);
    }
    setOpen(false);
    setQuery("");
  }

  function pickCatalog(name: string) {
    onPick({ description: name });
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Pick from equipment"
          title="Pick from equipment"
        >
          <List className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Pick equipment</DialogTitle>
          <DialogDescription>
            Optional — choose from your fleet or common machinery. You can still
            type any item by hand.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search equipment…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="-mx-1 max-h-[55vh] space-y-4 overflow-y-auto px-1 py-1">
          {fleet.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Truck className="size-3.5" /> Your fleet
              </div>
              <div className="grid gap-1.5">
                {fleet.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => pickFleet(e.id)}
                    className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="font-medium">{e.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {EQUIPMENT_TYPE_LABELS[e.type]}
                      {e.defaultRate
                        ? ` · R${e.defaultRate}/${
                            e.defaultRateUnit === "hour" ? "hr" : "day"
                          }`
                        : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {catalog.map((cat) => (
            <div key={cat.id}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {cat.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => pickCatalog(item)}
                    className="rounded-full border bg-card px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {fleet.length === 0 && catalog.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matches. Just type the item by hand instead.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
