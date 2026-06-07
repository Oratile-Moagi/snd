export type EquipmentType =
  | "dump_truck"
  | "tipper_truck"
  | "excavator"
  | "tlb"
  | "grader"
  | "roller"
  | "water_truck"
  | "lowbed"
  | "front_end_loader"
  | "other";

export type Ownership = "owned" | "hired_in";
export type RateUnit = "hour" | "day";
export type EquipmentStatus = "available" | "on_hire" | "maintenance";

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  registration?: string;
  ownership: Ownership;
  /** Company we hire this unit from (when ownership === "hired_in"). */
  supplier?: string;
  /** What the supplier charges us (for hired-in units), informational. */
  costRate?: number;
  /** Default rate we charge clients. */
  defaultRate: number;
  defaultRateUnit: RateUnit;
  status: EquipmentStatus;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  notes?: string;
}

export type ProjectStatus = "active" | "completed" | "on_hold";

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  location?: string;
  status: ProjectStatus;
  /** True when we work as a subcontractor under a main contractor. */
  subcontracted: boolean;
  mainContractor?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export type LineItemType = "hourly" | "daily" | "fixed";

export interface LineItem {
  id: string;
  description: string;
  type: LineItemType;
  equipmentId?: string;
  /** Charge rate. Interpreted per the line type. */
  rate: number;
  /** Hours per day (hourly only). */
  hours?: number;
  /** Number of days (hourly & daily). */
  days?: number;
  /** Multiplier, e.g. number of trucks. Defaults to 1. */
  quantity: number;
}

export type DocStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined";

export interface Quote {
  id: string;
  number: string;
  clientId?: string;
  projectId?: string;
  date: string;
  validUntil?: string;
  status: DocStatus;
  items: LineItem[];
  vatEnabled: boolean;
  vatRate: number;
  notes?: string;
  terms?: string;
}

export type InvoiceStatus = "unpaid" | "paid" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  quoteId?: string;
  clientId?: string;
  projectId?: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  items: LineItem[];
  vatEnabled: boolean;
  vatRate: number;
  notes?: string;
  terms?: string;
  amountPaid: number;
}

export interface CompanySettings {
  name: string;
  legalName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  vatNumber: string;
  regNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranchCode: string;
  defaultVatRate: number;
  currencySymbol: string;
  defaultTerms: string;
}

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  dump_truck: "Dump Truck",
  tipper_truck: "Tipper Truck",
  excavator: "Excavator",
  tlb: "TLB",
  grader: "Grader",
  roller: "Roller",
  water_truck: "Water Truck",
  lowbed: "Lowbed",
  front_end_loader: "Front End Loader",
  other: "Other",
};

export const LINE_ITEM_TYPE_LABELS: Record<LineItemType, string> = {
  hourly: "Hourly",
  daily: "Daily",
  fixed: "Fixed / Establishment",
};
