"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Client } from "@/lib/types";
import { PageContainer, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY: Omit<Client, "id"> = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  vatNumber: "",
  notes: "",
};

export default function ClientsPage() {
  const clients = useStore((s) => s.clients);
  const addClient = useStore((s) => s.addClient);
  const updateClient = useStore((s) => s.updateClient);
  const deleteClient = useStore((s) => s.deleteClient);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Omit<Client, "id">>(EMPTY);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    const { id: _id, ...rest } = c;
    void _id;
    setForm({ ...EMPTY, ...rest });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) {
      toast.error("Client name is required.");
      return;
    }
    if (editing) {
      updateClient(editing.id, form);
      toast.success("Client updated.");
    } else {
      addClient(form);
      toast.success("Client added.");
    }
    setOpen(false);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Clients"
        description="People and companies you quote and invoice."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> New client
          </Button>
        }
      />

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No clients yet. Add your first client to start quoting.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clients.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  {c.company && (
                    <div className="text-sm text-muted-foreground">
                      {c.company}
                    </div>
                  )}
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5" /> {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5" /> {c.phone}
                      </div>
                    )}
                    {c.address && <div>{c.address}</div>}
                    {c.vatNumber && <div>VAT: {c.vatNumber}</div>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(c)}
                    aria-label="Edit client"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      deleteClient(c.id);
                      toast.success("Client deleted.");
                    }}
                    aria-label="Delete client"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit client" : "New client"}</DialogTitle>
            <DialogDescription>
              Details used on quotes and invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Contact name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vat">VAT number</Label>
              <Input
                id="vat"
                value={form.vatNumber}
                onChange={(e) =>
                  setForm({ ...form, vatNumber: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save" : "Add client"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
