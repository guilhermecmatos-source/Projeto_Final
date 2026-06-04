"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-right" richColors theme={theme} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        {children}
        <ThemedToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
