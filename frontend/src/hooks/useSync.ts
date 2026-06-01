"use client";

import { useCallback, useState } from "react";
import { useOffline } from "./useOffline";
import { useToast } from "./useToast";

export function useSync() {
  const { syncNow, syncing, pendingCount, online } = useOffline();
  const toast = useToast();
  const [ultimoOk, setUltimoOk] = useState<boolean | null>(null);

  const sincronizar = useCallback(async () => {
    if (!online) {
      toast.erro("Sem conexão com a internet.");
      return false;
    }
    const result = await syncNow();
    setUltimoOk(result.ok);
    toast[result.ok ? "sucesso" : "erro"](result.message);
    return result.ok;
  }, [online, syncNow, toast]);

  return { sincronizar, syncing, pendingCount, online, ultimoOk };
}
