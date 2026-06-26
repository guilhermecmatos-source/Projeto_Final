"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { ensureCurrentProfileInList } from "@/lib/profiles";
import { getStoredAuth, setStoredAuth } from "@/lib/auth-storage";

export function useAuth(redirectToLogin = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { token, user: storedUser } = getStoredAuth();

    if (!token && redirectToLogin) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      const parsed = storedUser as User;
      setUser(parsed);
      ensureCurrentProfileInList(parsed);
    }
    setReady(true);
  }, [router, redirectToLogin]);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    setStoredAuth(getStoredAuth().token, u as Record<string, unknown>);
  }, []);

  return { user, ready, setUser: updateUser };
}
