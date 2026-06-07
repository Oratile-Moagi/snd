"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Inline "add a new project" dialog. Calls back with the created project id. */
export function CreateProjectDialog({
  clientId,
  onCreated,
}: {
  clientId?: string;
  onCreated: (id: string) => void;
}) {
  const addProject = useStore((s) => s.addProject);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [subcontracted, setSubcontracted] = useState(false);
  const [mainContractor, setMainContractor] = useState("");

  function reset() {
    setName("");
    setLocation("");
    setSubcontracted(false);
    setMainContractor("");
  }

  function save() {
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    const p = addProject({
      name,
      clientId,
      location,
      status: "active",
      subcontracted,
      mainContractor: subcontracted ? mainContractor : "",
    } as Omit<Project, "id">);
    toast.success("Project added.");
    onCreated(p.id);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="New project">
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Add a project without leaving this document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Project name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={subcontracted}
              onChange={(e) => setSubcontracted(e.target.checked)}
            />
            We are a subcontractor on this project
          </label>
          {subcontracted && (
            <div className="grid gap-2">
              <Label>Main contractor</Label>
              <Input
                value={mainContractor}
                onChange={(e) => setMainContractor(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Add project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
