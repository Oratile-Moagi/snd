"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import {
  EQUIPMENT_TYPE_LABELS,
  type Equipment,
  type EquipmentType,
  type EquipmentStatus,
  type Ownership,
  type RateUnit,
} from "@/lib/types";
import { formatCurrency } from "@/lib/calc";
import { PageContainer, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY: Omit<Equipment, "id"> = {
  name: "",
  type: "dump_truck",
  registration: "",
  ownership: "owned",
  supplier: "",
  costRate: undefined,
  defaultRate: 0,
  defaultRateUnit: "hour",
  status: "available",
  notes: "",
};

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: "Available",
  on_hire: "On hire",
  maintenance: "Maintenance",
};

const STATUS_VARIANT: Record<
  EquipmentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  available: "default",
  on_hire: "secondary",
  maintenance: "destructive",
};

export default function FleetPage() {
  const equipment = useStore((s) => s.equipment);
  const settings = useStore((s) => s.settings);
  const addEquipment = useStore((s) => s.addEquipment);
  const updateEquipment = useStore((s) => s.updateEquipment);
  const deleteEquipment = useStore((s) => s.deleteEquipment);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState<Omit<Equipment, "id">>(EMPTY);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(e: Equipment) {
    setEditing(e);
    const { id: _id, ...rest } = e;
    void _id;
    setForm({ ...EMPTY, ...rest });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    const payload = {
      ...form,
      supplier: form.ownership === "hired_in" ? form.supplier : "",
    };
    if (editing) {
      updateEquipment(editing.id, payload);
      toast.success("Equipment updated.");
    } else {
      addEquipment(payload);
      toast.success("Equipment added.");
    }
    setOpen(false);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Fleet & Equipment"
        description="Your owned trucks plus equipment hired in from other companies."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Add equipment
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead className="text-right">Default rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[90px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No equipment yet.
                  </TableCell>
                </TableRow>
              )}
              {equipment.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.name}</div>
                    {e.registration && (
                      <div className="text-xs text-muted-foreground">
                        {e.registration}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{EQUIPMENT_TYPE_LABELS[e.type]}</TableCell>
                  <TableCell>
                    {e.ownership === "owned" ? (
                      <span>Owned</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Hired in
                        {e.supplier ? ` · ${e.supplier}` : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(e.defaultRate, settings.currencySymbol)}
                    <span className="text-muted-foreground">
                      /{e.defaultRateUnit === "hour" ? "hr" : "day"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[e.status]}>
                      {STATUS_LABELS[e.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(e)}
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteEquipment(e.id);
                          toast.success("Equipment deleted.");
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit equipment" : "Add equipment"}
            </DialogTitle>
            <DialogDescription>
              A truck or machine you can hire out on projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Tipper Truck 02"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm({ ...form, type: v as EquipmentType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EQUIPMENT_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg">Registration</Label>
                <Input
                  id="reg"
                  value={form.registration}
                  onChange={(e) =>
                    setForm({ ...form, registration: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Ownership</Label>
                <Select
                  value={form.ownership}
                  onValueChange={(v) =>
                    setForm({ ...form, ownership: v as Ownership })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="hired_in">
                      Hired in (sub-contracted)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as EquipmentStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="on_hire">On hire</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.ownership === "hired_in" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="supplier">Hired from</Label>
                  <Input
                    id="supplier"
                    placeholder="Supplier company"
                    value={form.supplier}
                    onChange={(e) =>
                      setForm({ ...form, supplier: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Our cost rate</Label>
                  <Input
                    id="cost"
                    type="number"
                    inputMode="decimal"
                    value={form.costRate ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        costRate:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rate">Default charge rate</Label>
                <Input
                  id="rate"
                  type="number"
                  inputMode="decimal"
                  value={form.defaultRate || ""}
                  onChange={(e) =>
                    setForm({ ...form, defaultRate: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Per</Label>
                <Select
                  value={form.defaultRateUnit}
                  onValueChange={(v) =>
                    setForm({ ...form, defaultRateUnit: v as RateUnit })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
