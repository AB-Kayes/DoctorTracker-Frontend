"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GuestLayout } from "@/components/layout/GuestLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/nexus/interaction-bits";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";

  const [email, setEmail] = useState("admin@doctortracker.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await authService.login({ email, password });
      toast.success("Welcome back!", { description: "Signed in successfully" });
      window.location.href = redirectTo;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password";
      toast.error("Authentication failed", { description: msg });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          placeholder="admin@doctortracker.com"
          className="mt-1.5"
          autoComplete="email"
          required
        />
        <FieldError>{errors.email}</FieldError>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          placeholder="••••••••"
          className="mt-1.5"
          autoComplete="current-password"
          required
        />
        <FieldError>{errors.password}</FieldError>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>Default seeded admin credentials are pre-filled for convenience.</span>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Verifying..." : "Sign in"}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Need a new administrator account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register here
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <GuestLayout
      eyebrow="Portal Security"
      title="Sign in to DoctorTracker"
      subtitle="Access administrative dashboard, doctors, and patient rosters."
    >
      <Suspense fallback={<div className="py-8 text-center text-xs text-muted-foreground">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </GuestLayout>
  );
}
