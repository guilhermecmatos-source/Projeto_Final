"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export function useAuth(redirectToLogin = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token && redirectToLogin) {
      router.push("/login");
      return;
    }

    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, [router, redirectToLogin]);

  return { user, ready };
}
