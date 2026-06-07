# Siluma N Dube Group — Operations & Invoicing

A tablet- and laptop-friendly web app for **Siluma N Dube Group (Pty) Ltd** to run the
plant-hire / construction side of the business: manage trucks & equipment, hire them out to
projects (including subcontracted ones), build itemised quotes with flexible pricing, and
generate simple invoices.

## Features

- **Dashboard** — equipment availability, active projects, open quotes, outstanding invoices.
- **Fleet & Equipment** — owned trucks plus equipment hired-in from other companies (e.g. excavators), with default charge rates.
- **Clients** — customer details used on quotes and invoices.
- **Projects** — jobs where equipment is deployed; flag subcontracted work and the main contractor.
- **Quotes** — itemised pricing with full breakdowns:
  - **Hourly:** rate/hr × hours/day × days × qty (e.g. R350/hr × 9 hrs × 6 days × 2 trucks)
  - **Daily:** rate/day × days × qty
  - **Fixed / establishment:** lump sums
  - Optional VAT, payment terms, validity.
- **Invoices** — create from scratch or convert a quote; track paid / unpaid / overdue.
- **Print / Save PDF** — every quote and invoice has a branded printable view (use the browser's "Save as PDF").
- **Settings** — company branding, contact, banking details and document defaults.

## Tech

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand) with `localStorage` persistence — **offline-first, no backend or login required**

> Data is stored per-device in the browser. Save/share documents as PDF for backup. Multi-device
> sync (laptop ⇄ tablet) would require adding a small backend later.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
