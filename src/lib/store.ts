"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Client,
  CompanySettings,
  Equipment,
  Invoice,
  Project,
  Quote,
} from "./types";
import {
  DEFAULT_SETTINGS,
  SEED_CLIENTS,
  SEED_EQUIPMENT,
  SEED_INVOICES,
  SEED_PROJECTS,
  SEED_QUOTES,
} from "./seed";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

function nextNumber(prefix: string, existing: { number: string }[]): string {
  const nums = existing
    .map((d) => {
      const m = d.number.match(/(\d+)\s*$/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

interface AppState {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  settings: CompanySettings;
  equipment: Equipment[];
  clients: Client[];
  projects: Project[];
  quotes: Quote[];
  invoices: Invoice[];

  updateSettings: (patch: Partial<CompanySettings>) => void;

  addEquipment: (e: Omit<Equipment, "id">) => Equipment;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  addClient: (c: Omit<Client, "id">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProject: (p: Omit<Project, "id">) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addQuote: (q: Omit<Quote, "id" | "number">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  addInvoice: (i: Omit<Invoice, "id" | "number">) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  invoiceFromQuote: (quoteId: string) => Invoice | undefined;

  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      settings: DEFAULT_SETTINGS,
      equipment: SEED_EQUIPMENT,
      clients: SEED_CLIENTS,
      projects: SEED_PROJECTS,
      quotes: SEED_QUOTES,
      invoices: SEED_INVOICES,

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      addEquipment: (e) => {
        const item: Equipment = { ...e, id: uid("eq") };
        set((s) => ({ equipment: [...s.equipment, item] }));
        return item;
      },
      updateEquipment: (id, patch) =>
        set((s) => ({
          equipment: s.equipment.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        })),
      deleteEquipment: (id) =>
        set((s) => ({ equipment: s.equipment.filter((e) => e.id !== id) })),

      addClient: (c) => {
        const item: Client = { ...c, id: uid("cl") };
        set((s) => ({ clients: [...s.clients, item] }));
        return item;
      },
      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      addProject: (p) => {
        const item: Project = { ...p, id: uid("pr") };
        set((s) => ({ projects: [...s.projects, item] }));
        return item;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addQuote: (q) => {
        const item: Quote = {
          ...q,
          id: uid("q"),
          number: nextNumber("SND-Q-", get().quotes),
        };
        set((s) => ({ quotes: [item, ...s.quotes] }));
        return item;
      },
      updateQuote: (id, patch) =>
        set((s) => ({
          quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        })),
      deleteQuote: (id) =>
        set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) })),

      addInvoice: (i) => {
        const item: Invoice = {
          ...i,
          id: uid("inv"),
          number: nextNumber("SND-INV-", get().invoices),
        };
        set((s) => ({ invoices: [item, ...s.invoices] }));
        return item;
      },
      updateInvoice: (id, patch) =>
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === id ? { ...i, ...patch } : i
          ),
        })),
      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      invoiceFromQuote: (quoteId) => {
        const quote = get().quotes.find((q) => q.id === quoteId);
        if (!quote) return undefined;
        const item: Invoice = {
          id: uid("inv"),
          number: nextNumber("SND-INV-", get().invoices),
          quoteId: quote.id,
          clientId: quote.clientId,
          projectId: quote.projectId,
          date: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 30 * 864e5)
            .toISOString()
            .slice(0, 10),
          status: "unpaid",
          items: quote.items.map((li) => ({ ...li })),
          vatEnabled: quote.vatEnabled,
          vatRate: quote.vatRate,
          notes: quote.notes,
          terms: quote.terms,
          amountPaid: 0,
        };
        set((s) => ({ invoices: [item, ...s.invoices] }));
        return item;
      },

      resetAll: () =>
        set({
          settings: DEFAULT_SETTINGS,
          equipment: SEED_EQUIPMENT,
          clients: SEED_CLIENTS,
          projects: SEED_PROJECTS,
          quotes: SEED_QUOTES,
          invoices: SEED_INVOICES,
        }),
    }),
    {
      name: "snd-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        settings,
        equipment,
        clients,
        projects,
        quotes,
        invoices,
      }) => ({ settings, equipment, clients, projects, quotes, invoices }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
