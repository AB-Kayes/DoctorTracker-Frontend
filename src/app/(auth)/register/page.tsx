"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuestLayout } from "@/components/layout/GuestLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/nexus/interaction-bits";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await authService.register({ name, email, password });
      toast.success("Account registered!", { description: "Signed in as administrator" });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create account";
      toast.error("Registration error", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestLayout
      eyebrow="New Administrator"
      title="Create Admin Account"
      subtitle="Register an authorized clinical administrator account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="Dr. Gregory House"
            className="mt-1.5"
            required
          />
          <FieldError>{errors.name}</FieldError>
        </div>

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
            placeholder="gregory.house@princeton.edu"
            className="mt-1.5"
            autoComplete="email"
            required
          />
          <FieldError>{errors.email}</FieldError>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            placeholder="Minimum 6 characters"
            className="mt-1.5"
            autoComplete="new-password"
            required
          />
          <FieldError>{errors.password}</FieldError>
        </div>

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? "Creating account..." : "Register Administrator"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </GuestLayout>
  );
}
