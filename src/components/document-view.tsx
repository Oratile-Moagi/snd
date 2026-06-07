"use client";

import Image from "next/image";
import type {
  Client,
  CompanySettings,
  LineItem,
  Project,
} from "@/lib/types";
import {
  documentTotals,
  formatCurrency,
  formatDate,
  lineItemBreakdown,
  lineItemTotal,
} from "@/lib/calc";

export interface DocumentMeta {
  kind: "quote" | "invoice";
  number: string;
  date: string;
  /** validUntil for quotes, dueDate for invoices */
  secondaryDateLabel: string;
  secondaryDate?: string;
  statusLabel?: string;
  items: LineItem[];
  vatEnabled: boolean;
  vatRate: number;
  notes?: string;
  terms?: string;
}

export function DocumentView({
  settings,
  client,
  project,
  doc,
}: {
  settings: CompanySettings;
  client?: Client;
  project?: Project;
  doc: DocumentMeta;
}) {
  const totals = documentTotals({
    items: doc.items,
    vatEnabled: doc.vatEnabled,
    vatRate: doc.vatRate,
  } as never);
  const cur = settings.currencySymbol;
  const title = doc.kind === "quote" ? "QUOTATION" : "TAX INVOICE";

  return (
    <div className="print-area mx-auto w-full max-w-[820px] bg-white p-6 text-[13px] text-neutral-800 sm:p-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 border-b pb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt={settings.name}
            width={56}
            height={56}
            className="object-contain"
          />
          <div>
            <div className="text-lg font-semibold text-neutral-900">
              {settings.legalName}
            </div>
            <div className="text-xs text-neutral-500">
              {[settings.phone, settings.email, settings.website]
                .filter(Boolean)
                .join("  ·  ")}
            </div>
            {settings.address && (
              <div className="text-xs text-neutral-500">{settings.address}</div>
            )}
            {(settings.vatNumber || settings.regNumber) && (
              <div className="text-xs text-neutral-500">
                {settings.regNumber && `Reg: ${settings.regNumber}`}
                {settings.regNumber && settings.vatNumber && "  ·  "}
                {settings.vatNumber && `VAT: ${settings.vatNumber}`}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div
            className="brand-text-gradient text-2xl font-bold"
            style={{ letterSpacing: "0.02em" }}
          >
            {title}
          </div>
          <div className="mt-1 font-mono text-sm font-medium text-neutral-700">
            {doc.number}
          </div>
          {doc.statusLabel && (
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {doc.statusLabel}
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-6 py-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {doc.kind === "quote" ? "Quote for" : "Bill to"}
          </div>
          {client ? (
            <div className="mt-1">
              <div className="font-medium text-neutral-900">
                {client.company || client.name}
              </div>
              {client.company && client.name && <div>{client.name}</div>}
              {client.email && <div>{client.email}</div>}
              {client.phone && <div>{client.phone}</div>}
              {client.address && (
                <div className="whitespace-pre-line">{client.address}</div>
              )}
              {client.vatNumber && <div>VAT: {client.vatNumber}</div>}
            </div>
          ) : (
            <div className="mt-1 text-neutral-400">—</div>
          )}
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-neutral-500">Date</span>
            <span className="font-medium">{formatDate(doc.date)}</span>
            {doc.secondaryDate && (
              <>
                <span className="text-neutral-500">
                  {doc.secondaryDateLabel}
                </span>
                <span className="font-medium">
                  {formatDate(doc.secondaryDate)}
                </span>
              </>
            )}
            {project && (
              <>
                <span className="text-neutral-500">Project</span>
                <span className="font-medium">{project.name}</span>
              </>
            )}
            {project?.subcontracted && project.mainContractor && (
              <>
                <span className="text-neutral-500">Main contractor</span>
                <span className="font-medium">{project.mainContractor}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="brand-gradient text-left text-white">
            <th className="rounded-l-md px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 font-medium">Breakdown</th>
            <th className="rounded-r-md px-3 py-2 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item) => (
            <tr key={item.id} className="border-b align-top">
              <td className="px-3 py-2.5 font-medium text-neutral-900">
                {item.description || "—"}
              </td>
              <td className="px-3 py-2.5 text-neutral-500">
                {lineItemBreakdown(item, cur)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatCurrency(lineItemTotal(item), cur)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-5 flex justify-end">
        <div className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="tabular-nums">
              {formatCurrency(totals.subtotal, cur)}
            </span>
          </div>
          {doc.vatEnabled && (
            <div className="flex justify-between">
              <span className="text-neutral-500">
                VAT ({Math.round(doc.vatRate * 100)}%)
              </span>
              <span className="tabular-nums">
                {formatCurrency(totals.vat, cur)}
              </span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t pt-2 text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span className="tabular-nums">
              {formatCurrency(totals.total, cur)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms + Banking */}
      <div className="mt-8 grid gap-6 border-t pt-6 sm:grid-cols-2">
        <div>
          {doc.terms && (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Terms
              </div>
              <p className="mt-1 whitespace-pre-line text-neutral-600">
                {doc.terms}
              </p>
            </>
          )}
          {doc.notes && (
            <>
              <div className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Notes
              </div>
              <p className="mt-1 whitespace-pre-line text-neutral-600">
                {doc.notes}
              </p>
            </>
          )}
        </div>
        {(settings.bankName || settings.bankAccountNumber) && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Banking details
            </div>
            <div className="mt-1 space-y-0.5 text-neutral-600">
              {settings.bankAccountName && (
                <div>{settings.bankAccountName}</div>
              )}
              {settings.bankName && <div>Bank: {settings.bankName}</div>}
              {settings.bankAccountNumber && (
                <div>Account: {settings.bankAccountNumber}</div>
              )}
              {settings.bankBranchCode && (
                <div>Branch code: {settings.bankBranchCode}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 border-t pt-4 text-center text-xs text-neutral-400">
        {settings.legalName} · {settings.phone} · {settings.email}
      </div>
    </div>
  );
}
