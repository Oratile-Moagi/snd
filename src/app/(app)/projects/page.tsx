"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Project, ProjectStatus } from "@/lib/types";
import { formatDate } from "@/lib/calc";
import { PageContainer, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const NONE = "__none__";

const EMPTY: Omit<Project, "id"> = {
  name: "",
  clientId: undefined,
  location: "",
  status: "active",
  subcontracted: false,
  mainContractor: "",
  startDate: "",
  endDate: "",
  notes: "",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On hold",
};

const STATUS_VARIANT: Record<
  ProjectStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  completed: "secondary",
  on_hold: "outline",
};

export default function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const clients = useStore((s) => s.clients);
  const addProject = useStore((s) => s.addProject);
  const updateProject = useStore((s) => s.updateProject);
  const deleteProject = useStore((s) => s.deleteProject);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(EMPTY);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    const { id: _id, ...rest } = p;
    void _id;
    setForm({ ...EMPTY, ...rest });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    if (editing) {
      updateProject(editing.id, form);
      toast.success("Project updated.");
    } else {
      addProject(form);
      toast.success("Project added.");
    }
    setOpen(false);
  }

  function clientName(id?: string) {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : undefined;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Jobs where you hire out trucks and equipment."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant={STATUS_VARIANT[p.status]}>
                        {STATUS_LABELS[p.status]}
                      </Badge>
                      {p.subcontracted && (
                        <Badge variant="outline">Subcontracted</Badge>
                      )}
                    </div>
                    {clientName(p.clientId) && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        Client: {clientName(p.clientId)}
                      </div>
                    )}
                    {p.subcontracted && p.mainContractor && (
                      <div className="text-sm text-muted-foreground">
                        Under: {p.mainContractor}
                      </div>
                    )}
                    {p.location && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" /> {p.location}
                      </div>
                    )}
                    {(p.startDate || p.endDate) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDate(p.startDate)} → {formatDate(p.endDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(p)}
                      aria-label="Edit project"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteProject(p.id);
                        toast.success("Project deleted.");
                      }}
                      aria-label="Delete project"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {p.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">{p.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit project" : "New project"}
            </DialogTitle>
            <DialogDescription>
              Track where your equipment is deployed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Client</Label>
                <Select
                  value={form.clientId ?? NONE}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      clientId: v === NONE ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No client</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as ProjectStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <input
                id="subcontracted"
                type="checkbox"
                className="size-4 accent-primary"
                checked={form.subcontracted}
                onChange={(e) =>
                  setForm({ ...form, subcontracted: e.target.checked })
                }
              />
              <Label htmlFor="subcontracted" className="cursor-pointer">
                We are a subcontractor on this project
              </Label>
            </div>
            {form.subcontracted && (
              <div className="grid gap-2">
                <Label htmlFor="main">Main contractor</Label>
                <Input
                  id="main"
                  value={form.mainContractor}
                  onChange={(e) =>
                    setForm({ ...form, mainContractor: e.target.value })
                  }
                />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
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
            <Button onClick={save}>{editing ? "Save" : "Add project"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
