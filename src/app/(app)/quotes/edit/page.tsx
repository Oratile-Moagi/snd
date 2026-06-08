"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QuoteEditor } from "@/components/quote-editor";

function QuoteEditorFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <QuoteEditor id={id} />;
}

export default function QuoteEditPage() {
  return (
    <Suspense fallback={null}>
      <QuoteEditorFromQuery />
    </Suspense>
  );
}
