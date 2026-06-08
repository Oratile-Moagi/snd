"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { InvoiceStatus } from "@/lib/types";
import {
  documentTotals,
  effectiveInvoiceStatus,
  formatCurrency,
} from "@/lib/calc";
import { downloadElementAsPdf } from "@/lib/pdf";
import { PageContainer } from "@/components/page";
import { LineItemsEditor } from "@/components/line-items-editor";
import { DocumentView } from "@/components/document-view";
import { CreateClientDialog } from "@/components/create-client-dialog";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  overdue: "Overdue",
};

export function InvoiceEditor({ id }: { id: string }) {
  const router = useRouter();

  const invoice = useStore((s) => s.invoices.find((i) => i.id === id));
  const clients = useStore((s) => s.clients);
  const projects = useStore((s) => s.projects);
  const settings = useStore((s) => s.settings);
  const updateInvoice = useStore((s) => s.updateInvoice);

  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [tab, setTab] = useState("edit");

  if (!invoice) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Invoice not found.
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/invoices")}
              >
                Back to invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const client = clients.find((c) => c.id === invoice.clientId);
  const project = projects.find((p) => p.id === invoice.projectId);
  const bankAccount =
    settings.bankAccounts.find(
      (b) => b.id === (invoice.bankAccountId ?? settings.defaultBankAccountId)
    ) ?? settings.bankAccounts[0];
  const totals = documentTotals(invoice);

  async function downloadPdf() {
    const el = docRef.current?.querySelector(".print-area") as
      | HTMLElement
      | null;
    if (!el) return;
    setDownloading(true);
    try {
      await downloadElementAsPdf(el, `${invoice!.number}.pdf`);
    } catch {
      toast.error("Could not generate PDF. Try the print option instead.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <PageContainer className="max-w-5xl">
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/invoices")}
        >
          <ArrowLeft className="size-4" /> Invoices
        </Button>
        <span className="font-mono text-sm text-muted-foreground">
          {invoice.number}
        </span>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="no-print mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview & print</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Client</Label>
                <div className="flex gap-2">
                  <Select
                    value={invoice.clientId ?? NONE}
                    onValueChange={(v) =>
                      updateInvoice(invoice.id, {
                        clientId: v === NONE ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger className="flex-1">
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
                  <CreateClientDialog
                    onCreated={(id) =>
                      updateInvoice(invoice.id, { clientId: id })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Project</Label>
                <div className="flex gap-2">
                  <Select
                    value={invoice.projectId ?? NONE}
                    onValueChange={(v) =>
                      updateInvoice(invoice.id, {
                        projectId: v === NONE ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CreateProjectDialog
                    clientId={invoice.clientId}
                    onCreated={(id) =>
                      updateInvoice(invoice.id, { projectId: id })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Bank account (shown on document)</Label>
                <Select
                  value={
                    invoice.bankAccountId ??
                    settings.defaultBankAccountId ??
                    settings.bankAccounts[0]?.id ??
                    NONE
                  }
                  onValueChange={(v) =>
                    updateInvoice(invoice.id, {
                      bankAccountId: v === NONE ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.bankAccounts.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Invoice date</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoice.date}
                  onChange={(e) =>
                    updateInvoice(invoice.id, { date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due">Due date</Label>
                <Input
                  id="due"
                  type="date"
                  value={invoice.dueDate ?? ""}
                  onChange={(e) =>
                    updateInvoice(invoice.id, { dueDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Status</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      effectiveInvoiceStatus(invoice) === "paid"
                        ? "default"
                        : effectiveInvoiceStatus(invoice) === "overdue"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {STATUS_LABELS[effectiveInvoiceStatus(invoice)]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {invoice.status === "paid"
                      ? "Marked as paid."
                      : effectiveInvoiceStatus(invoice) === "overdue"
                      ? "Past due date — still unpaid."
                      : "Awaiting payment."}
                  </span>
                  <div className="ml-auto">
                    {invoice.status === "paid" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateInvoice(invoice.id, { status: "unpaid" })
                        }
                      >
                        Mark as unpaid
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateInvoice(invoice.id, { status: "paid" })
                        }
                      >
                        Mark as paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={invoice.items}
                onChange={(items) => updateInvoice(invoice.id, { items })}
                currencySymbol={settings.currencySymbol}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals & terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={invoice.vatEnabled}
                    onChange={(e) =>
                      updateInvoice(invoice.id, {
                        vatEnabled: e.target.checked,
                      })
                    }
                  />
                  Add VAT
                </label>
                {invoice.vatEnabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="vatrate" className="text-sm">
                      VAT %
                    </Label>
                    <Input
                      id="vatrate"
                      type="number"
                      className="w-20"
                      value={Math.round(invoice.vatRate * 100)}
                      onChange={(e) =>
                        updateInvoice(invoice.id, {
                          vatRate: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </div>
                )}
                <div className="ml-auto text-right">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-xl font-semibold tabular-nums">
                    {formatCurrency(totals.total, settings.currencySymbol)}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="terms">Payment terms</Label>
                <Textarea
                  id="terms"
                  rows={2}
                  value={invoice.terms ?? ""}
                  onChange={(e) =>
                    updateInvoice(invoice.id, { terms: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={invoice.notes ?? ""}
                  onChange={(e) =>
                    updateInvoice(invoice.id, { notes: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="no-print flex justify-end">
            <Button onClick={() => setTab("preview")}>
              <Eye className="size-4" /> Preview & print
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
            <Button onClick={downloadPdf} disabled={downloading}>
              <Download className="size-4" />{" "}
              {downloading ? "Preparing…" : "Download PDF"}
            </Button>
          </div>
          <div
            ref={docRef}
            className="overflow-x-auto rounded-xl border bg-white shadow-sm print-shadow-none"
          >
            <DocumentView
              settings={settings}
              client={client}
              project={project}
              bankAccount={bankAccount}
              doc={{
                kind: "invoice",
                number: invoice.number,
                date: invoice.date,
                secondaryDateLabel: "Due date",
                secondaryDate: invoice.dueDate,
                statusLabel: STATUS_LABELS[effectiveInvoiceStatus(invoice)],
                items: invoice.items,
                vatEnabled: invoice.vatEnabled,
                vatRate: invoice.vatRate,
                notes: invoice.notes,
                terms: invoice.terms,
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
