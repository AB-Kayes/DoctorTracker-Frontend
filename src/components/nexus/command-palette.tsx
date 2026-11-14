"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  PlusCircle,
  Moon,
  Sun,
  Building2,
  Stethoscope,
  User,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { doctorService } from "@/services/doctorService";
import { patientService } from "@/services/patientService";
import { IDoctor, IPatient } from "@/types";

export function CommandPalette({
  open,
  onOpenChange,
  onOpenCreateDoctor,
  onOpenCreatePatient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateDoctor?: () => void;
  onOpenCreatePatient?: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [patients, setPatients] = useState<IPatient[]>([]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Reset query when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDoctors([]);
      setPatients([]);
    }
  }, [open]);

  // Universal real-time query across doctors & patients
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setDoctors([]);
      setPatients([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      doctorService.getDoctors({ search: debouncedQuery.trim(), limit: 5 }),
      patientService.getPatients({ search: debouncedQuery.trim(), limit: 5 }),
    ])
      .then(([docRes, patRes]) => {
        if (!isMounted) return;
        if (docRes.status === "fulfilled") {
          setDoctors(docRes.value.data || []);
        } else {
          setDoctors([]);
        }
        if (patRes.status === "fulfilled") {
          setPatients(patRes.value.data || []);
        } else {
          setPatients([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const navigate = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Admitted":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Outpatient":
        return "bg-info/10 text-info border-info/20";
      case "Discharged":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Universal Portal Search"
      description="Quickly find doctors, clinical patients, hospital departments, or execute portal actions."
    >
      <CommandInput
        placeholder="Type to search doctors, patients, conditions, or commands..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Searching clinical database...</span>
          </div>
        )}

        {!loading && (
          <CommandEmpty>
            {query.trim()
              ? `No doctors or patients matching "${query}".`
              : "No search results."}
          </CommandEmpty>
        )}

        {/* Doctors Section */}
        {doctors.length > 0 && (
          <CommandGroup heading={`Specialists & Doctors (${doctors.length})`}>
            {doctors.map((doc) => (
              <CommandItem
                key={doc._id}
                value={`doctor-${doc.name}-${doc.specialization}-${doc.hospital}`}
                onSelect={() => navigate(`/doctors/${doc._id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {doc.name.replace(/^Dr\.\s*/i, "").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate flex items-center gap-2">
                      <span>{doc.name}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        • {doc.hospital}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {doc.specialization} • {doc.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5">
                    {doc.specialization}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Patients Section */}
        {patients.length > 0 && (
          <CommandGroup heading={`Clinical Patients (${patients.length})`}>
            {patients.map((patient) => {
              const docName =
                patient.doctor && typeof patient.doctor === "object"
                  ? (patient.doctor as any).name
                  : "Unassigned";

              return (
                <CommandItem
                  key={patient._id}
                  value={`patient-${patient.name}-${patient.condition}-${docName}`}
                  onSelect={() =>
                    navigate(`/patients?search=${encodeURIComponent(patient.name)}`)
                  }
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-info/10 text-info font-bold text-xs">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate flex items-center gap-2">
                        <span>{patient.name}</span>
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({patient.age}y, {patient.gender})
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        Diagnosis: <strong className="text-foreground">{patient.condition}</strong> • Dr. {docName.replace(/^Dr\.\s*/i, "")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getStatusColor(
                        patient.status
                      )}`}
                    >
                      {patient.status}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {(doctors.length > 0 || patients.length > 0) && <CommandSeparator />}

        {/* Platform Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            value="navigate-dashboard"
            onSelect={() => navigate("/")}
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>Dashboard Overview</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="navigate-doctors"
            onSelect={() => navigate("/doctors")}
          >
            <Users className="h-4 w-4 text-primary" />
            <span>Doctors Directory</span>
            <CommandShortcut>G O</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="navigate-patients"
            onSelect={() => navigate("/patients")}
          >
            <Activity className="h-4 w-4 text-primary" />
            <span>Patient Registry</span>
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Clinical Quick Actions */}
        <CommandGroup heading="Clinical Actions">
          <CommandItem
            value="action-admit-patient"
            onSelect={() => {
              if (onOpenCreatePatient) {
                onOpenChange(false);
                onOpenCreatePatient();
              } else {
                navigate("/patients?action=create");
              }
            }}
          >
            <PlusCircle className="h-4 w-4 text-primary" />
            <span>Admit New Patient</span>
          </CommandItem>
          <CommandItem
            value="action-add-doctor"
            onSelect={() => {
              if (onOpenCreateDoctor) {
                onOpenChange(false);
                onOpenCreateDoctor();
              } else {
                navigate("/doctors?action=create");
              }
            }}
          >
            <Stethoscope className="h-4 w-4 text-primary" />
            <span>Register Medical Specialist</span>
          </CommandItem>
          <CommandItem
            value="action-toggle-theme"
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              onOpenChange(false);
            }}
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            <span>Toggle {mounted && resolvedTheme === "dark" ? "Light" : "Dark"} Mode</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
