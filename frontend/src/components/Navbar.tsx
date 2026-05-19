"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types";
import { authApi } from "@/services/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vehicles", label: "Veículos" },
  { href: "/drivers", label: "Motoristas" },
  { href: "/travels", label: "Viagens" },
  { href: "/fuel", label: "Abastecimentos" },
  { href: "/maintenance", label: "Manutenções" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (pathname === "/login") return null;

  return (
    <nav className="bg-fleet-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            Fleet<span className="text-blue-300">AI</span>
          </Link>
          <div className="hidden gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  pathname === item.href
                    ? "bg-fleet-700 text-white"
                    : "text-blue-100 hover:bg-fleet-700/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="capitalize text-blue-300">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
