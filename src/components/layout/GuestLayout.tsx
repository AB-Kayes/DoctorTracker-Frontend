"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export function GuestLayout({
  children,
  eyebrow,
  title,
  subtitle,
  maxWidthClass = "max-w-[420px]",
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <div className="flex h-full flex-col p-2 md:p-4">
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card shadow-card">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
            <Link href="/" aria-label="DoctorTracker" className="flex items-center">
              <Logo />
            </Link>
          </header>

          <main className="themed-scroll flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn("my-auto w-full", maxWidthClass)}
            >
              <div className="mb-4 text-center">
                {eyebrow && (
                  <div className="mb-1.5 inline-flex items-center rounded-full border border-border bg-surface-inset px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {eyebrow}
                  </div>
                )}
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>

              <div className="surface-card p-6">{children}</div>
            </motion.div>
          </main>

          <footer className="shrink-0 border-t border-border py-2.5 text-center text-[11px] text-muted-foreground">
            © 2026 DoctorTracker — Clinical Administrative Management Portal
          </footer>
        </div>
      </div>
    </div>
  );
}
