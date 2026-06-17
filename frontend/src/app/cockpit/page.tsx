"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Cockpit unificado no Dashboard Principal */
export default function CockpitRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      router.replace(`/dashboard${window.location.search}`);
    } else {
      router.replace("/dashboard");
    }
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-on-surface-variant">Redirecionando para Dashboard Principal...</p>
    </div>
  );
}
