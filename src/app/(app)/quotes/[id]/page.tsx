"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { DocStatus } from "@/lib/types";
import { documentTotals, formatCurrency } from "@/lib/calc";
import { downloadElementAsPdf } from "@/lib/pdf";
import { PageContainer } from "@/components/page";
import { LineItemsEditor } from "@/components/line-items-editor";
import { DocumentView } from "@/components/document-view";
import { CreateClientDialog } from "@/components/create-client-dialog";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Button } from "@/components/ui/button";
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

export default function QuoteEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const quote = useStore((s) => s.quotes.find((q) => q.id === id));
  const clients = useStore((s) => s.clients);
  const projects = useStore((s) => s.projects);
  const settings = useStore((s) => s.settings);
  const updateQuote = useStore((s) => s.updateQuote);
  const invoiceFromQuote = useStore((s) => s.invoiceFromQuote);

  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!quote) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Quote not found.
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.push("/quotes")}>
                Back to quotes
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const client = clients.find((c) => c.id === quote.clientId);
  const project = projects.find((p) => p.id === quote.projectId);
  const bankAccount =
    settings.bankAccounts.find(
      (b) => b.id === (quote.bankAccountId ?? settings.defaultBankAccountId)
    ) ?? settings.bankAccounts[0];
  const totals = documentTotals(quote);

  function convertToInvoice() {
    const inv = invoiceFromQuote(quote!.id);
    if (inv) {
      toast.success(`Created invoice ${inv.number}`);
      router.push(`/invoices/${inv.id}`);
    }
  }

  async function downloadPdf() {
    const el = docRef.current?.querySelector(".print-area") as
      | HTMLElement
      | null;
    if (!el) return;
    setDownloading(true);
    try {
      await downloadElementAsPdf(el, `${quote!.number}.pdf`);
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
          onClick={() => router.push("/quotes")}
        >
          <ArrowLeft className="size-4" /> Quotes
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">
            {quote.number}
          </span>
        </div>
      </div>

      <Tabs defaultValue="edit">
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
                    value={quote.clientId ?? NONE}
                    onValueChange={(v) =>
                      updateQuote(quote.id, {
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
                    onCreated={(id) => updateQuote(quote.id, { clientId: id })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Project</Label>
                <div className="flex gap-2">
                  <Select
                    value={quote.projectId ?? NONE}
                    onValueChange={(v) =>
                      updateQuote(quote.id, {
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
                    clientId={quote.clientId}
                    onCreated={(id) =>
                      updateQuote(quote.id, { projectId: id })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Bank account (shown on document)</Label>
                <Select
                  value={
                    quote.bankAccountId ??
                    settings.defaultBankAccountId ??
                    settings.bankAccounts[0]?.id ??
                    NONE
                  }
                  onValueChange={(v) =>
                    updateQuote(quote.id, {
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={quote.date}
                  onChange={(e) =>
                    updateQuote(quote.id, { date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valid">Valid until</Label>
                <Input
                  id="valid"
                  type="date"
                  value={quote.validUntil ?? ""}
                  onChange={(e) =>
                    updateQuote(quote.id, { validUntil: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={quote.status}
                  onValueChange={(v) =>
                    updateQuote(quote.id, { status: v as DocStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={quote.items}
                onChange={(items) => updateQuote(quote.id, { items })}
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
                    checked={quote.vatEnabled}
                    onChange={(e) =>
                      updateQuote(quote.id, { vatEnabled: e.target.checked })
                    }
                  />
                  Add VAT
                </label>
                {quote.vatEnabled && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="vatrate" className="text-sm">
                      VAT %
                    </Label>
                    <Input
                      id="vatrate"
                      type="number"
                      className="w-20"
                      value={Math.round(quote.vatRate * 100)}
                      onChange={(e) =>
                        updateQuote(quote.id, {
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
                  value={quote.terms ?? ""}
                  onChange={(e) =>
                    updateQuote(quote.id, { terms: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={quote.notes ?? ""}
                  onChange={(e) =>
                    updateQuote(quote.id, { notes: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={convertToInvoice}>
              <ReceiptText className="size-4" /> Convert to invoice
            </Button>
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
                kind: "quote",
                number: quote.number,
                date: quote.date,
                secondaryDateLabel: "Valid until",
                secondaryDate: quote.validUntil,
                items: quote.items,
                vatEnabled: quote.vatEnabled,
                vatRate: quote.vatRate,
                notes: quote.notes,
                terms: quote.terms,
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
