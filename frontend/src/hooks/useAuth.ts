"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { ensureCurrentProfileInList } from "@/lib/profiles";

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

    if (stored) {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      ensureCurrentProfileInList(parsed);
    }
    setReady(true);
  }, [router, redirectToLogin]);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  }, []);

  return { user, ready, setUser: updateUser };
}
