"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { InvoiceStatus } from "@/lib/types";
import {
  documentTotals,
  formatCurrency,
  formatDate,
  todayISO,
  addDaysISO,
} from "@/lib/calc";
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
  InvoiceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  unpaid: "secondary",
  paid: "default",
  overdue: "destructive",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  overdue: "Overdue",
};

export default function InvoicesPage() {
  const router = useRouter();
  const invoices = useStore((s) => s.invoices);
  const clients = useStore((s) => s.clients);
  const settings = useStore((s) => s.settings);
  const addInvoice = useStore((s) => s.addInvoice);
  const deleteInvoice = useStore((s) => s.deleteInvoice);

  function clientName(id?: string) {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : "—";
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

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Send invoices and track what's paid."
        actions={
          <Button onClick={createInvoice}>
            <Plus className="size-4" /> New invoice
          </Button>
        }
      />

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Receipt className="size-8" />
            No invoices yet. Create one, or convert a quote into an invoice.
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
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const totals = documentTotals(inv);
                  return (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                    >
                      <TableCell className="font-mono font-medium">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {inv.number}
                        </Link>
                      </TableCell>
                      <TableCell>{clientName(inv.clientId)}</TableCell>
                      <TableCell>{formatDate(inv.date)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[inv.status]}>
                          {STATUS_LABELS[inv.status]}
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
                            deleteInvoice(inv.id);
                            toast.success("Invoice deleted.");
                          }}
                          aria-label="Delete invoice"
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
