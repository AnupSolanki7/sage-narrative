// app/(auth)/login/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import LoginPage from "./LoginPage";
import { NOINDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Sage Narrative account.",
  ...NOINDEX_METADATA,
};

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
