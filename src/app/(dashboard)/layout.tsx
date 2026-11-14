"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { CommandPalette } from "@/components/nexus/command-palette";
import { authService } from "@/services/authService";
import { Activity } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        await authService.getMe();
        if (isMounted) setCheckingAuth(false);
      } catch (error) {
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md animate-pulse">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wide">
            Verifying clinical session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] transform bg-card transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} />
      </div>

      {/* Main View on Right */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopHeader
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="themed-scroll flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
