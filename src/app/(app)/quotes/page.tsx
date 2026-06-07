"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { DocStatus } from "@/lib/types";
import { documentTotals, formatCurrency, formatDate, todayISO, addDaysISO } from "@/lib/calc";
import { PageContainer, PageHeader } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<
  DocStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  sent: "secondary",
  accepted: "default",
  declined: "destructive",
};

const STATUS_LABELS: Record<DocStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

export default function QuotesPage() {
  const router = useRouter();
  const quotes = useStore((s) => s.quotes);
  const clients = useStore((s) => s.clients);
  const settings = useStore((s) => s.settings);
  const addQuote = useStore((s) => s.addQuote);
  const deleteQuote = useStore((s) => s.deleteQuote);

  function clientName(id?: string) {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : "—";
  }

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

  return (
    <PageContainer>
      <PageHeader
        title="Quotes"
        description="Build itemised quotations with full pricing breakdowns."
        actions={
          <Button onClick={createQuote}>
            <Plus className="size-4" /> New quote
          </Button>
        }
      />

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <FileText className="size-8" />
            No quotes yet. Create your first quote.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => {
                  const totals = documentTotals(q);
                  return (
                    <TableRow
                      key={q.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/quotes/${q.id}`)}
                    >
                      <TableCell className="font-mono font-medium">
                        <Link
                          href={`/quotes/${q.id}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {q.number}
                        </Link>
                      </TableCell>
                      <TableCell>{clientName(q.clientId)}</TableCell>
                      <TableCell>{formatDate(q.date)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[q.status]}>
                          {STATUS_LABELS[q.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(totals.total, settings.currencySymbol)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuote(q.id);
                            toast.success("Quote deleted.");
                          }}
                          aria-label="Delete quote"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
