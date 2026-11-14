"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Search,
  Plus,
  Download,
  MoreVertical,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  UserCheck,
  UserX,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import {
  TableShell,
  Thead,
  Th,
  Td,
  Tr,
} from "@/components/nexus/admin-bits";
import {
  Pagination,
  ConfirmAction,
} from "@/components/nexus/interaction-bits";
import { DateRangePicker, DateRange, defaultRange } from "@/components/nexus/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { patientService, GetPatientsParams } from "@/services/patientService";
import { useDebounce } from "@/hooks/use-debounce";
import { exportToCSV } from "@/lib/csv-export";
import { formatDate } from "@/lib/utils";
import { IPatient, IDoctor } from "@/types";
import { toast } from "sonner";

export default function PatientsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";

  // Search & Filter state
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [statusTab, setStatusTab] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange());

  // Sorting & Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("admissionDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Modal state
  const [selected, setSelected] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<IPatient | null>(null);

  // Sync search state with URL query parameters (e.g. from Universal Search)
  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
      setStatusTab("all");
      setConditionFilter("all");
      setDoctorFilter("all");
      setPage(1);
    }
  }, [urlSearch]);

  useEffect(() => {
    if (searchParams?.get("action") === "create") {
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  // Fetch patients query
  const queryParams: GetPatientsParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusTab !== "all" ? statusTab : undefined,
    condition: conditionFilter !== "all" ? conditionFilter : undefined,
    doctorId: doctorFilter !== "all" ? doctorFilter : undefined,
    fromDate: dateRange.from ? new Date(dateRange.from).toISOString() : undefined,
    toDate: dateRange.to ? new Date(dateRange.to).toISOString() : undefined,
    sortBy,
    sortOrder,
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ["patients", queryParams],
    queryFn: () => patientService.getPatients(queryParams),
  });

  const patients = response?.data || [];
  const pagination = response?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };
  const counts = response?.meta?.counts || { all: 0, admitted: 0, outpatient: 0, discharged: 0 };
  const conditions = response?.meta?.conditions || [];
  const doctorsList = response?.meta?.doctors || [];

  // Toggle sorting on column click
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Selection helpers
  const allSelected = patients.length > 0 && patients.every((p) => selected.includes(p._id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(selected.filter((id) => !patients.some((p) => p._id === id)));
    } else {
      setSelected(Array.from(new Set([...selected, ...patients.map((p) => p._id)])));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Delete
  const handleDeletePatient = async (patient: IPatient) => {
    try {
      await patientService.deletePatient(patient._id);
      toast.success("Patient record deleted", { description: `${patient.name} removed from registry` });
      setSelected((prev) => prev.filter((id) => id !== patient._id));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
      ]);
    } catch (err: any) {
      toast.error("Failed to delete patient", {
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      const res = await patientService.bulkDeletePatients(selected);
      toast.success(res.message);
      setSelected([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
      ]);
    } catch (err: any) {
      toast.error("Bulk delete failed", {
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (newStatus: "Admitted" | "Outpatient" | "Discharged") => {
    if (selected.length === 0) return;
    try {
      const res = await patientService.bulkUpdatePatientStatus(selected, newStatus);
      toast.success(res.message);
      setSelected([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
      ]);
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  // Export to CSV
  const handleExportCSV = (exportSelectedOnly: boolean = false) => {
    const listToExport = exportSelectedOnly
      ? patients.filter((p) => selected.includes(p._id))
      : patients;

    if (listToExport.length === 0) {
      toast.error("No patient records to export");
      return;
    }

    exportToCSV("patients_registry", listToExport, [
      { key: "name", label: "Patient Name" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "condition", label: "Diagnosis / Condition" },
      { key: "status", label: "Status" },
      {
        key: "doctor",
        label: "Assigned Doctor",
        transform: (doc) => (typeof doc === "object" && doc?.name ? doc.name : "Unassigned"),
      },
      { key: "admissionDate", label: "Admission Date", transform: (v) => formatDate(v) },
    ]);
    toast.success(`Exported ${listToExport.length} patient records to CSV`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusTab("all");
    setConditionFilter("all");
    setDoctorFilter("all");
    setDateRange(defaultRange());
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Clinical Registry"
        title="Patient Management"
        description="Monitor patient evaluations, condition tracking, clinical admission status, and physician assignments."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportCSV(false)}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingPatient(null);
                setCreateModalOpen(true);
              }}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Admit Patient
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Patients"
            value={counts.all}
            icon={Activity}
            accent="primary"
          />
          <StatCard
            label="Admitted Now"
            value={counts.admitted}
            icon={AlertCircle}
            accent="destructive"
          />
          <StatCard
            label="Outpatient Care"
            value={counts.outpatient}
            icon={Clock}
            accent="info"
          />
          <StatCard
            label="Discharged / Recovered"
            value={counts.discharged}
            icon={CheckCircle2}
            accent="success"
          />
        </div>

        {/* Filter Bar with Status Tabs & Dropdowns */}
        <div className="surface-card p-3 sm:p-4 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Status Filter Tabs with Live Count Badges */}
            <Tabs
              value={statusTab}
              onValueChange={(val) => {
                setStatusTab(val);
                setPage(1);
              }}
              className="w-auto"
            >
              <TabsList className="h-9 p-1 bg-muted">
                {[
                  { key: "all", label: "All", count: counts.all },
                  { key: "Admitted", label: "Admitted", count: counts.admitted },
                  { key: "Outpatient", label: "Outpatient", count: counts.outpatient },
                  { key: "Discharged", label: "Discharged", count: counts.discharged },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="gap-1.5 px-3 h-7 text-xs font-medium cursor-pointer"
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
                        statusTab === tab.key
                          ? "bg-card text-foreground shadow-2xs"
                          : "bg-muted-foreground/15 text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search patient name, condition, phone, email..."
                className="h-9 pl-9 pr-8 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-border/50">
            {/* Condition Dropdown */}
            <div className="w-full sm:w-48">
              <Select
                value={conditionFilter}
                onValueChange={(val) => {
                  setConditionFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Filter */}
            <div className="w-full sm:w-52">
              <Select
                value={doctorFilter}
                onValueChange={(val) => {
                  setDoctorFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Assigned Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="unassigned">Unassigned Patients</SelectItem>
                  {doctorsList.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
              className="h-8 text-xs"
            />

            {/* Reset Filters */}
            {(search || statusTab !== "all" || conditionFilter !== "all" || doctorFilter !== "all" || dateRange.preset !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="surface-card overflow-hidden">
          {/* Floating Bulk Action Bar */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-inset px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-foreground">
                  {selected.length} patient{selected.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Status Update Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkStatusChange("Admitted")}>
                      Mark as Admitted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange("Outpatient")}>
                      Mark as Outpatient
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange("Discharged")}>
                      Mark as Discharged
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportCSV(true)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Download className="h-3 w-3" /> Export Selected
                </Button>

                <ConfirmAction
                  title={`Delete ${selected.length} Patient Records?`}
                  description="Are you sure you want to permanently delete the selected patient records? This action cannot be undone."
                  confirmLabel="Delete Records"
                  onConfirm={handleBulkDelete}
                >
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs gap-1.5"
                  >
                    <Trash2 className="h-3 w-3" /> Delete Selected
                  </Button>
                </ConfirmAction>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected([])}
                  className="h-7 text-xs text-muted-foreground"
                >
                  <X className="h-3 w-3" /> Clear
                </Button>
              </div>
            </div>
          )}

          {patients.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Activity}
                title={
                  search || statusTab !== "all" || conditionFilter !== "all" || doctorFilter !== "all"
                    ? "No patients match the filters"
                    : "No patients registered"
                }
                description={
                  search || statusTab !== "all" || conditionFilter !== "all" || doctorFilter !== "all"
                    ? "Try adjusting your search query, status tab, or date range."
                    : "Admit your first patient to begin tracking conditions and treatment plans."
                }
                action={
                  search || statusTab !== "all" || conditionFilter !== "all" || doctorFilter !== "all" ? (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingPatient(null);
                        setCreateModalOpen(true);
                      }}
                      className="gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Admit Patient
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <>
              <TableShell>
                <Thead>
                  <Th className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all patients"
                    />
                  </Th>
                  <Th
                    sortable
                    sorted={sortBy === "name" ? sortOrder : false}
                    onSort={() => handleSort("name")}
                  >
                    Patient
                  </Th>
                  <Th
                    sortable
                    sorted={sortBy === "condition" ? sortOrder : false}
                    onSort={() => handleSort("condition")}
                  >
                    Condition
                  </Th>
                  <Th
                    sortable
                    sorted={sortBy === "status" ? sortOrder : false}
                    onSort={() => handleSort("status")}
                  >
                    Status
                  </Th>
                  <Th>Assigned Physician</Th>
                  <Th>Contact</Th>
                  <Th
                    align="right"
                    sortable
                    sorted={sortBy === "admissionDate" ? sortOrder : false}
                    onSort={() => handleSort("admissionDate")}
                  >
                    Admission Date
                  </Th>
                  <Th align="right" className="w-12">
                    Actions
                  </Th>
                </Thead>
                <tbody>
                  {patients.map((pat) => {
                    const isSelected = selected.includes(pat._id);
                    const assignedDoc = typeof pat.doctor === "object" ? pat.doctor : null;

                    return (
                      <Tr key={pat._id} className={isSelected ? "bg-muted/30" : ""}>
                        <Td>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(pat._id)}
                            aria-label={`Select ${pat.name}`}
                          />
                        </Td>
                        <Td>
                          <div
                            onClick={() => {
                              setEditingPatient(pat);
                              setCreateModalOpen(true);
                            }}
                            className="group cursor-pointer"
                          >
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {pat.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {pat.age} yrs · {pat.gender}
                            </div>
                          </div>
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
                          {assignedDoc ? (
                            <Link
                              href={`/doctors/${assignedDoc._id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                            >
                              <UserCheck className="h-3.5 w-3.5 text-primary" />
                              <span>{assignedDoc.name}</span>
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground italic">
                              <UserX className="h-3.5 w-3.5 opacity-60" />
                              Unassigned
                            </span>
                          )}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPatient(pat);
                                  setCreateModalOpen(true);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit Patient</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <ConfirmAction
                                title={`Delete ${pat.name}?`}
                                description={`Are you sure you want to permanently delete the clinical record for ${pat.name}?`}
                                confirmLabel="Delete"
                                onConfirm={() => handleDeletePatient(pat)}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Record</span>
                                </DropdownMenuItem>
                              </ConfirmAction>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Td>
                      </Tr>
                    );
                  })}
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

      <PatientFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        patient={editingPatient}
      />
    </div>
  );
}
