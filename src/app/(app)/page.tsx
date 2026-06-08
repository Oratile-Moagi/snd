"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  FolderKanban,
  FileText,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  documentTotals,
  effectiveInvoiceStatus,
  formatCurrency,
  formatDate,
  todayISO,
  addDaysISO,
} from "@/lib/calc";
import { PageContainer } from "@/components/page";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const equipment = useStore((s) => s.equipment);
  const projects = useStore((s) => s.projects);
  const quotes = useStore((s) => s.quotes);
  const invoices = useStore((s) => s.invoices);
  const clients = useStore((s) => s.clients);
  const settings = useStore((s) => s.settings);
  const addQuote = useStore((s) => s.addQuote);
  const addInvoice = useStore((s) => s.addInvoice);

  function createQuote() {
    const q = addQuote({
      date: todayISO(),
      validUntil: addDaysISO(todayISO(), 30),
      status: "draft",
      items: [],
      vatEnabled: true,
      vatRate: settings.defaultVatRate,
      terms: settings.defaultTerms,
    });
    router.push(`/quotes/${q.id}`);
  }

  function createInvoice() {
    const inv = addInvoice({
      date: todayISO(),
      dueDate: addDaysISO(todayISO(), 30),
      status: "unpaid",
      items: [],
      vatEnabled: true,
      vatRate: settings.defaultVatRate,
      terms: settings.defaultTerms,
      amountPaid: 0,
    });
    router.push(`/invoices/${inv.id}`);
  }

  const cur = settings.currencySymbol;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const availableEquipment = equipment.filter(
    (e) => e.status === "available"
  ).length;

  const outstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + documentTotals(i).total, 0);

  const openQuotes = quotes.filter(
    (q) => q.status === "draft" || q.status === "sent"
  ).length;

  function clientName(id?: string) {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : "—";
  }

  const stats = [
    {
      label: "Available equipment",
      value: `${availableEquipment} / ${equipment.length}`,
      icon: Truck,
      href: "/fleet",
    },
    {
      label: "Active projects",
      value: String(activeProjects),
      icon: FolderKanban,
      href: "/projects",
    },
    {
      label: "Open quotes",
      value: String(openQuotes),
      icon: FileText,
      href: "/quotes",
    },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding, cur),
      icon: Wallet,
      href: "/invoices",
    },
  ];

  return (
    <PageContainer>
      <div className="brand-gradient mb-6 flex flex-col gap-4 rounded-2xl p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <Logo showWordmark={false} size={40} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{settings.name}</h1>
            <p className="text-sm text-white/80">
              Operations & invoicing dashboard
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="bg-white/15 text-white hover:bg-white/25"
            onClick={createQuote}
          >
            New quote
          </Button>
          <Button
            variant="secondary"
            className="text-primary"
            onClick={createInvoice}
          >
            New invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4">
                  <div className="rounded-xl bg-accent p-2.5 text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="truncate text-lg font-semibold">
                      {s.value}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Recent quotes</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/quotes">
                  View all <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {quotes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No quotes yet.
              </p>
            ) : (
              <ul className="divide-y">
                {quotes.slice(0, 5).map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/quotes/${q.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-medium">{q.number}</div>
                        <div className="truncate text-muted-foreground">
                          {clientName(q.clientId)} · {formatDate(q.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium tabular-nums">
                          {formatCurrency(documentTotals(q).total, cur)}
                        </div>
                        <Badge variant="outline" className="mt-0.5 capitalize">
                          {q.status}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Recent invoices</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/invoices">
                  View all <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {invoices.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No invoices yet.
              </p>
            ) : (
              <ul className="divide-y">
                {invoices.slice(0, 5).map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-medium">
                          {inv.number}
                        </div>
                        <div className="truncate text-muted-foreground">
                          {clientName(inv.clientId)} · {formatDate(inv.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium tabular-nums">
                          {formatCurrency(documentTotals(inv).total, cur)}
                        </div>
                        <Badge variant="outline" className="mt-0.5 capitalize">
                          {effectiveInvoiceStatus(inv)}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
