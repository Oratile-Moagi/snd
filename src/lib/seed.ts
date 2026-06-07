import type {
  Client,
  CompanySettings,
  Equipment,
  Invoice,
  Project,
  Quote,
} from "./types";

export const DEFAULT_SETTINGS: CompanySettings = {
  name: "Siluma N Dube Group",
  legalName: "Siluma N Dube Group (Pty) Ltd",
  phone: "+27 78 456 6071",
  email: "Info@silumandube.co.za",
  website: "silumandube.co.za",
  address: "",
  vatNumber: "",
  regNumber: "",
  bankName: "",
  bankAccountName: "Siluma N Dube Group (Pty) Ltd",
  bankAccountNumber: "",
  bankBranchCode: "",
  defaultVatRate: 0.15,
  currencySymbol: "R",
  defaultTerms:
    "Payment due within 30 days of invoice date. Establishment fee payable before commencement of work.",
};

export const SEED_EQUIPMENT: Equipment[] = [
  {
    id: "eq-1",
    name: "Dump Truck 01",
    type: "dump_truck",
    registration: "ND 123-456",
    ownership: "owned",
    defaultRate: 350,
    defaultRateUnit: "hour",
    status: "available",
  },
  {
    id: "eq-2",
    name: "Tipper Truck 01",
    type: "tipper_truck",
    registration: "ND 654-321",
    ownership: "owned",
    defaultRate: 350,
    defaultRateUnit: "hour",
    status: "available",
  },
  {
    id: "eq-3",
    name: "Excavator 20T (hired)",
    type: "excavator",
    ownership: "hired_in",
    supplier: "Highveld Plant Hire",
    costRate: 650,
    defaultRate: 850,
    defaultRateUnit: "hour",
    status: "available",
    notes: "Hired in per project. Confirm availability with supplier.",
  },
];

export const SEED_CLIENTS: Client[] = [
  {
    id: "cl-1",
    name: "Thabo Mokoena",
    company: "Mokoena Civils",
    email: "thabo@mokoenacivils.co.za",
    phone: "+27 82 000 0000",
    address: "12 Industria Rd, Middelburg",
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "pr-1",
    name: "Road widening — N4 access",
    clientId: "cl-1",
    location: "Middelburg",
    status: "active",
    subcontracted: true,
    mainContractor: "Mokoena Civils",
    startDate: new Date().toISOString().slice(0, 10),
    notes: "Supplying 2 tipper trucks + 1 excavator.",
  },
];

export const SEED_QUOTES: Quote[] = [
  {
    id: "q-1",
    number: "SND-Q-0001",
    clientId: "cl-1",
    projectId: "pr-1",
    date: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    status: "sent",
    vatEnabled: true,
    vatRate: 0.15,
    terms:
      "Payment due within 30 days. Establishment fee payable before commencement of work.",
    items: [
      {
        id: "li-1",
        description: "Establishment / mobilisation to site",
        type: "fixed",
        rate: 5000,
        quantity: 1,
      },
      {
        id: "li-2",
        description: "Tipper Truck hire",
        type: "hourly",
        rate: 350,
        hours: 9,
        days: 6,
        quantity: 2,
      },
      {
        id: "li-3",
        description: "Excavator 20T",
        type: "daily",
        rate: 7000,
        days: 6,
        quantity: 1,
      },
    ],
  },
];

export const SEED_INVOICES: Invoice[] = [];
