"use client";

import AppShell from "@/components/layout/AppShell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell headerTitle="Configurações">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Tema persistente em todo o sistema</CardDescription>
          </CardHeader>
          <div className="flex gap-2">
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              Escuro
            </Button>
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              Claro
            </Button>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>API em http://localhost:3001/api</CardDescription>
          </CardHeader>
          <p className="text-sm text-fleet-400">
            Backend MySQL (sem Prisma). Execute migrações após subir o Docker.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
