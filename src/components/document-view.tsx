"use client";

import Image from "next/image";
import { Globe, Phone, Mail } from "lucide-react";
import type {
  BankAccount,
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
  bankAccount,
  doc,
}: {
  settings: CompanySettings;
  client?: Client;
  project?: Project;
  bankAccount?: BankAccount;
  doc: DocumentMeta;
}) {
  const totals = documentTotals({
    items: doc.items,
    vatEnabled: doc.vatEnabled,
    vatRate: doc.vatRate,
  } as never);
  const cur = settings.currencySymbol;
  const title = doc.kind === "quote" ? "QUOTATION" : "INVOICE";
  const bank = bankAccount ?? settings.bankAccounts[0];

  return (
    <div className="print-area mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white text-[13px] text-neutral-800 print:min-h-0 print:max-w-none">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-neutral-100"
        />
        <div className="relative flex items-start justify-between gap-6 px-10 pt-10">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt={settings.name}
              width={64}
              height={64}
              className="object-contain"
            />
            <div className="leading-tight">
              <div className="text-lg font-bold uppercase tracking-wide text-neutral-900">
                {settings.name}
              </div>
              {settings.tagline && (
                <div className="text-sm text-neutral-500">
                  {settings.tagline}
                </div>
              )}
            </div>
          </div>
          <div className="relative pt-1 text-right">
            <div
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: "#0e2f3d" }}
            >
              {title}
            </div>
            <div className="mt-3 space-y-0.5 text-sm text-neutral-600">
              <div>
                <span className="text-neutral-400">Number:</span>{" "}
                <span className="font-medium text-neutral-800">
                  {doc.number}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Date:</span>{" "}
                <span className="font-medium text-neutral-800">
                  {formatDate(doc.date)}
                </span>
              </div>
              {doc.statusLabel && (
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {doc.statusLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank details + Bill to */}
      <div className="grid grid-cols-2 gap-8 px-10 pt-8">
        {bank ? (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-900">
              Bank details
            </div>
            <div className="mt-1.5 space-y-0.5 text-neutral-700">
              <div className="font-semibold text-neutral-900">
                {bank.accountName || settings.legalName}
              </div>
              {settings.regNumber && (
                <div>Reg. No: {settings.regNumber}</div>
              )}
              {bank.bankName && <div>Bank: {bank.bankName}</div>}
              {bank.accountNumber && (
                <div>Account Number: {bank.accountNumber}</div>
              )}
              {bank.branchCode && <div>Branch Code: {bank.branchCode}</div>}
              <div>Reference: {doc.number}</div>
            </div>
          </div>
        ) : (
          <div />
        )}
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-900">
            {doc.kind === "quote" ? "Quote for" : "Bill to"}
          </div>
          {client ? (
            <div className="mt-1.5 space-y-0.5">
              <div className="font-semibold text-neutral-900">
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
            <div className="mt-1.5 text-neutral-400">—</div>
          )}
          <div className="mt-3 space-y-0.5 text-[12px]">
            {doc.secondaryDate && (
              <div>
                <span className="text-neutral-400">
                  {doc.secondaryDateLabel}:
                </span>{" "}
                <span className="font-medium">
                  {formatDate(doc.secondaryDate)}
                </span>
              </div>
            )}
            {project && (
              <div>
                <span className="text-neutral-400">Project:</span>{" "}
                <span className="font-medium">{project.name}</span>
              </div>
            )}
            {project?.subcontracted && project.mainContractor && (
              <div>
                <span className="text-neutral-400">Main contractor:</span>{" "}
                <span className="font-medium">{project.mainContractor}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-10 pt-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="brand-gradient text-left text-white">
              <th className="rounded-l-md px-3 py-2.5 font-medium">
                Description
              </th>
              <th className="px-3 py-2.5 font-medium">Breakdown</th>
              <th className="rounded-r-md px-3 py-2.5 text-right font-medium">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item) => (
              <tr key={item.id} className="border-b align-top">
                <td className="px-3 py-3 font-medium text-neutral-900">
                  {item.description || "—"}
                </td>
                <td className="px-3 py-3 text-neutral-500">
                  {lineItemBreakdown(item, cur)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(lineItemTotal(item), cur)}
                </td>
              </tr>
            ))}
            {doc.items.length === 0 && (
              <tr className="border-b">
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-neutral-400"
                >
                  No line items yet.
                </td>
              </tr>
            )}
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

        {/* Terms + Notes */}
        {(doc.terms || doc.notes) && (
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
            </div>
            <div>
              {doc.notes && (
                <>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Notes
                  </div>
                  <p className="mt-1 whitespace-pre-line text-neutral-600">
                    {doc.notes}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer contact pill */}
      <div className="mt-auto px-10 pb-10 pt-10">
        <div
          className="flex flex-wrap items-center justify-around gap-4 rounded-full px-8 py-4 text-sm text-white"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #0c3a44 0%, #176d6d 100%)",
          }}
        >
          <span className="flex items-center gap-2">
            <Globe className="size-4 opacity-90" />
            {settings.website}
          </span>
          <span className="flex items-center gap-2">
            <Phone className="size-4 opacity-90" />
            {settings.phone}
          </span>
          <span className="flex items-center gap-2">
            <Mail className="size-4 opacity-90" />
            {settings.email}
          </span>
        </div>
      </div>
    </div>
  );
}
