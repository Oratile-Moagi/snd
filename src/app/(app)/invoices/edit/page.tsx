"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceEditor } from "@/components/invoice-editor";

function InvoiceEditorFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <InvoiceEditor id={id} />;
}

export default function InvoiceEditPage() {
  return (
    <Suspense fallback={null}>
      <InvoiceEditorFromQuery />
    </Suspense>
  );
}
