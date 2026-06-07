"use client";

import { Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { BankAccount, CompanySettings } from "@/lib/types";
import { PageContainer, PageHeader } from "@/components/page";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const addBank = useStore((s) => s.addBank);
  const updateBank = useStore((s) => s.updateBank);
  const deleteBank = useStore((s) => s.deleteBank);
  const setDefaultBank = useStore((s) => s.setDefaultBank);
  const resetAll = useStore((s) => s.resetAll);

  function setBank<K extends keyof BankAccount>(
    id: string,
    key: K,
    value: BankAccount[K]
  ) {
    updateBank(id, { [key]: value } as Partial<BankAccount>);
  }

  function set<K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K]
  ) {
    updateSettings({ [key]: value } as Partial<CompanySettings>);
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Branding and details shown on your quotes and invoices."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Brand</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="brand-gradient rounded-xl p-3">
              <Logo showWordmark={false} size={44} />
            </div>
            <div className="text-sm text-muted-foreground">
              Your logo appears on the dashboard, quotes and invoices.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Display name</Label>
              <Input
                value={settings.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Legal name</Label>
              <Input
                value={settings.legalName}
                onChange={(e) => set("legalName", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Tagline (shown under the name on documents)</Label>
              <Input
                value={settings.tagline}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={settings.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={settings.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input
                value={settings.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Company reg. number</Label>
              <Input
                value={settings.regNumber}
                onChange={(e) => set("regNumber", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>VAT number</Label>
              <Input
                value={settings.vatNumber}
                onChange={(e) => set("vatNumber", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Address</Label>
              <Textarea
                rows={2}
                value={settings.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Bank accounts</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  addBank({
                    label: "New bank account",
                    accountName: settings.legalName,
                    bankName: "",
                    accountNumber: "",
                    branchCode: "",
                  });
                  toast.success("Bank account added.");
                }}
              >
                <Plus className="size-4" /> Add bank
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add as many accounts as you like. Pick which one appears on each
              quote or invoice from the document’s editor.
            </p>
            {settings.bankAccounts.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No bank accounts yet. Add one above.
              </p>
            )}
            {settings.bankAccounts.map((b) => {
              const isDefault = settings.defaultBankAccountId === b.id;
              return (
                <div
                  key={b.id}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {b.label || "Untitled account"}
                      </span>
                      {isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDefaultBank(b.id)}
                        >
                          <Star className="size-4" /> Set default
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete bank account"
                        onClick={() => {
                          deleteBank(b.id);
                          toast.success("Bank account removed.");
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Label</Label>
                      <Input
                        value={b.label}
                        onChange={(e) => setBank(b.id, "label", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Account name</Label>
                      <Input
                        value={b.accountName}
                        onChange={(e) =>
                          setBank(b.id, "accountName", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Bank</Label>
                      <Input
                        value={b.bankName}
                        onChange={(e) =>
                          setBank(b.id, "bankName", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Account number</Label>
                      <Input
                        value={b.accountNumber}
                        onChange={(e) =>
                          setBank(b.id, "accountNumber", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Branch code</Label>
                      <Input
                        value={b.branchCode}
                        onChange={(e) =>
                          setBank(b.id, "branchCode", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defaults</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Currency symbol</Label>
              <Input
                value={settings.currencySymbol}
                onChange={(e) => set("currencySymbol", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Default VAT %</Label>
              <Input
                type="number"
                value={Math.round(settings.defaultVatRate * 100)}
                onChange={(e) =>
                  set("defaultVatRate", Number(e.target.value) / 100)
                }
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Default terms (new quotes & invoices)</Label>
              <Textarea
                rows={3}
                value={settings.defaultTerms}
                onChange={(e) => set("defaultTerms", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              All data is stored on this device. Save / share documents as PDF
              for backup.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset all data back to the starter sample data? This cannot be undone."
                  )
                ) {
                  resetAll();
                  toast.success("Data reset to sample.");
                }
              }}
            >
              Reset to sample data
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Settings saved.")}>
            Save changes
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
