"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function TopHeader({
  onOpenCommandPalette,
  onOpenMobileMenu,
}: {
  onOpenCommandPalette: () => void;
  onOpenMobileMenu?: () => void;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return [{ label: "Dashboard", href: "/" }];

    const breadcrumbs = [{ label: "Portal", href: "/" }];
    let current = "";
    parts.forEach((p) => {
      current += `/${p}`;
      const label = p.charAt(0).toUpperCase() + p.slice(1);
      breadcrumbs.push({ label, href: current });
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 md:px-8 backdrop-blur-xs z-20">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Top Nav Theme Toggle - Icon Only (Left of Search Bar) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl border border-border bg-surface text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors shadow-xs"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-warning" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Universal Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 items-center gap-3 rounded-xl border border-border bg-surface px-3 text-xs text-muted-foreground shadow-xs transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search portal...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-card px-1.5 font-mono text-[10px] text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
