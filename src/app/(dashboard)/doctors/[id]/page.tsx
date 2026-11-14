"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Activity,
  Plus,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { TableShell, Thead, Th, Td, Tr } from "@/components/nexus/admin-bits";
import { Pagination, ConfirmAction } from "@/components/nexus/interaction-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { DateRangePicker, DateRange, defaultRange } from "@/components/nexus/date-range-picker";
import { doctorService } from "@/services/doctorService";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import { IPatient } from "@/types";
import { toast } from "sonner";

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<IPatient | null>(null);

  // Patient table query state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch Doctor profile
  const { data: doctorResponse, isLoading: doctorLoading } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => doctorService.getDoctorById(doctorId),
    enabled: !!doctorId,
  });

  // Fetch Doctor's Patients
  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ["doctor-patients", doctorId, { page, limit, search: debouncedSearch, status: statusFilter, dateRange }],
    queryFn: () =>
      doctorService.getDoctorPatients(doctorId, {
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        fromDate: dateRange.from ? new Date(dateRange.from).toISOString() : undefined,
        toDate: dateRange.to ? new Date(dateRange.to).toISOString() : undefined,
      }),
    enabled: !!doctorId,
  });

  const doctor = doctorResponse?.data;
  const patients = patientsResponse?.data || [];
  const pagination = patientsResponse?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };
  const stats = doctor?.stats || { totalPatients: 0, admitted: 0, outpatient: 0, discharged: 0 };

  const handleRemovePatient = async (patientId: string, patientName: string) => {
    try {
      await doctorService.removeDoctorPatient(doctorId, patientId);
      toast.success("Patient removed", { description: `${patientName} removed from roster` });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["doctor-patients", doctorId] }),
        queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] }),
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
      ]);
    } catch (err: any) {
      toast.error("Failed to remove patient", {
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  if (doctorLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
        Loading physician profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Users}
          title="Doctor not found"
          description="The requested physician record does not exist or has been removed."
          action={
            <Button size="sm" asChild>
              <Link href="/doctors">Back to Directory</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        backHref="/doctors"
        backLabel="Doctors Directory"
        eyebrow="Physician Profile"
        title={doctor.name}
        description={`${doctor.specialization} specialist affiliated with ${doctor.hospital}.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditDoctorOpen(true)}
              className="gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingPatient(null);
                setAddPatientOpen(true);
              }}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Patient
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-6">
        {/* Profile Card & Info */}
        <div className="surface-card p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-xs shrink-0">
                {doctor.name.replace(/^Dr\.\s*/i, "").charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{doctor.name}</h2>
                  <Badge variant="outline" className="text-xs">
                    {doctor.specialization}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>{doctor.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
              <span className="font-mono text-xs text-muted-foreground">
                Registered: {formatDate(doctor.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor's Caseload Metric Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Assigned Patients"
            value={stats.totalPatients}
            icon={Users}
            accent="primary"
          />
          <StatCard
            label="Admitted Now"
            value={stats.admitted}
            icon={AlertCircle}
            accent="destructive"
          />
          <StatCard
            label="Outpatient Care"
            value={stats.outpatient}
            icon={Activity}
            accent="info"
          />
          <StatCard
            label="Discharged / Recovered"
            value={stats.discharged}
            icon={CheckCircle2}
            accent="success"
          />
        </div>

        {/* Assigned Patients Table */}
        <div className="surface-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Assigned Patient Roster
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Active clinical patients under Dr. {doctor.name.replace(/^Dr\.\s*/i, "")}&apos;s direct care.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Patients */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search patient..."
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Admitted">Admitted</SelectItem>
                  <SelectItem value="Outpatient">Outpatient</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
                className="h-8 text-xs"
              />

              <Button
                size="sm"
                onClick={() => {
                  setEditingPatient(null);
                  setAddPatientOpen(true);
                }}
                className="h-8 gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Patient
              </Button>
            </div>
          </div>

          {patients.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Activity}
                title="No patients assigned"
                description={
                  search || statusFilter !== "all"
                    ? "No patients match the specified criteria."
                    : `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")} currently has zero assigned patients.`
                }
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingPatient(null);
                      setAddPatientOpen(true);
                    }}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add Patient under this Doctor
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <TableShell>
                <Thead>
                  <Th>Patient Name</Th>
                  <Th>Age & Gender</Th>
                  <Th>Condition / Diagnosis</Th>
                  <Th>Status</Th>
                  <Th>Contact</Th>
                  <Th align="right">Admission Date</Th>
                  <Th align="right" className="w-12">
                    Remove
                  </Th>
                </Thead>
                <tbody>
                  {patients.map((pat) => (
                    <Tr key={pat._id}>
                      <Td>
                        <div className="font-semibold text-foreground">{pat.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          ID: {pat._id.slice(-6)}
                        </div>
                      </Td>
                      <Td className="text-muted-foreground">
                        {pat.age} yrs · {pat.gender}
                      </Td>
                      <Td>
                        <span className="font-medium text-foreground">{pat.condition}</span>
                      </Td>
                      <Td>
                        <Badge
                          variant={
                            pat.status === "Admitted"
                              ? "default"
                              : pat.status === "Outpatient"
                              ? "info"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {pat.status}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="text-[11px] font-medium text-foreground">{pat.phone}</div>
                        {pat.email && (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {pat.email}
                          </div>
                        )}
                      </Td>
                      <Td align="right" className="font-mono text-[11px] text-muted-foreground">
                        {formatDate(pat.admissionDate)}
                      </Td>
                      <Td align="right">
                        <ConfirmAction
                          title={`Remove ${pat.name}?`}
                          description={`Are you sure you want to remove ${pat.name} from Dr. ${doctor.name}'s roster? This patient record will be deleted from the list.`}
                          confirmLabel="Delete from List"
                          onConfirm={() => handleRemovePatient(pat._id, pat.name)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Remove from roster"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </ConfirmAction>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableShell>

              <Pagination
                page={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(newSize) => {
                  setLimit(newSize);
                  setPage(1);
                }}
                label="patients"
              />
            </>
          )}
        </div>
      </div>

      <DoctorFormModal
        open={editDoctorOpen}
        onOpenChange={setEditDoctorOpen}
        doctor={doctor}
      />

      <PatientFormModal
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        lockedDoctorId={doctorId}
      />
    </div>
  );
}
