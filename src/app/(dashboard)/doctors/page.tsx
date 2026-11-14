"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Plus,
  Download,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  RotateCcw,
  UserCheck,
  Building2,
  X,
  Activity,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import {
  TableShell,
  Thead,
  Th,
  Td,
  Tr,
  MiniBar,
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
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { doctorService, GetDoctorsParams } from "@/services/doctorService";
import { useDebounce } from "@/hooks/use-debounce";
import { exportToCSV } from "@/lib/csv-export";
import { formatDate } from "@/lib/utils";
import { IDoctor } from "@/types";
import { toast } from "sonner";

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";

  // Search & Filter state
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [specialization, setSpecialization] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange());

  // Sorting & Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Modal state
  const [selected, setSelected] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null);

  // Sync search state with URL query parameters
  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
      setSpecialization("all");
      setPage(1);
    }
  }, [urlSearch]);

  useEffect(() => {
    if (searchParams?.get("action") === "create") {
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  // Fetch doctors query
  const queryParams: GetDoctorsParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    specialization: specialization !== "all" ? specialization : undefined,
    fromDate: dateRange.from ? new Date(dateRange.from).toISOString() : undefined,
    toDate: dateRange.to ? new Date(dateRange.to).toISOString() : undefined,
    sortBy,
    sortOrder,
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ["doctors", queryParams],
    queryFn: () => doctorService.getDoctors(queryParams),
  });

  const doctors = response?.data || [];
  const pagination = response?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };
  const specializations = response?.meta?.specializations || [];

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
  const allSelected = doctors.length > 0 && doctors.every((d) => selected.includes(d._id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(selected.filter((id) => !doctors.some((d) => d._id === id)));
    } else {
      setSelected(Array.from(new Set([...selected, ...doctors.map((d) => d._id)])));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Delete
  const handleDeleteDoctor = async (doctor: IDoctor) => {
    try {
      const res = await doctorService.deleteDoctor(doctor._id);
      toast.success(res.message);
      setSelected((prev) => prev.filter((id) => id !== doctor._id));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
      ]);
    } catch (err: any) {
      toast.error("Failed to delete doctor", {
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      const res = await doctorService.bulkDeleteDoctors(selected);
      toast.success(res.message);
      setSelected([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["doctors"] }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
      ]);
    } catch (err: any) {
      toast.error("Bulk delete failed", {
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  // Export to CSV
  const handleExportCSV = (exportSelectedOnly: boolean = false) => {
    const listToExport = exportSelectedOnly
      ? doctors.filter((d) => selected.includes(d._id))
      : doctors;

    if (listToExport.length === 0) {
      toast.error("No doctors to export");
      return;
    }

    exportToCSV("doctors_roster", listToExport, [
      { key: "name", label: "Doctor Name" },
      { key: "specialization", label: "Specialization" },
      { key: "hospital", label: "Hospital" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "patientsCount", label: "Assigned Patients", transform: (v) => String(v || 0) },
      { key: "createdAt", label: "Registration Date", transform: (v) => formatDate(v) },
    ]);
    toast.success(`Exported ${listToExport.length} doctors to CSV`);
  };

  const resetFilters = () => {
    setSearch("");
    setSpecialization("all");
    setDateRange(defaultRange());
    setPage(1);
  };

  const maxPatientCount = Math.max(...doctors.map((d) => d.patientsCount || 0), 10);
  const totalAssignedInView = doctors.reduce((acc, d) => acc + (d.patientsCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Directory"
        title="Doctor Management"
        description="Search, filter, and manage licensed physicians, hospital affiliations, and active patient rosters."
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
                setEditingDoctor(null);
                setCreateModalOpen(true);
              }}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Doctor
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-4">
        {/* Metric Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Doctors"
            value={pagination.total}
            icon={Users}
            accent="primary"
          />
          <StatCard
            label="Departments / Specialties"
            value={specializations.length}
            icon={Building2}
            accent="info"
          />
          <StatCard
            label="Patients in Current View"
            value={totalAssignedInView}
            icon={Activity}
            accent="success"
          />
          <StatCard
            label="Average Load per View"
            value={
              doctors.length > 0
                ? (totalAssignedInView / doctors.length).toFixed(1)
                : 0
            }
            icon={UserCheck}
            accent="warning"
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="surface-card p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by physician name, specialty, hospital, phone, email..."
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

            {/* Specialization Filter */}
            <div className="w-full sm:w-56">
              <Select
                value={specialization}
                onValueChange={(val) => {
                  setSpecialization(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
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
              className="h-9 w-full sm:w-auto"
            />

            {/* Reset Filters */}
            {(search || specialization !== "all" || dateRange.preset !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
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
                  {selected.length} doctor{selected.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportCSV(true)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Download className="h-3 w-3" /> Export Selected
                </Button>
                <ConfirmAction
                  title={`Delete ${selected.length} Doctors?`}
                  description="Are you sure you want to delete the selected doctors? All their assigned patients will safely remain in the system marked as Unassigned."
                  confirmLabel="Delete Doctors"
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

          {doctors.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title={search || specialization !== "all" ? "No matching doctors found" : "No doctors in directory"}
                description={
                  search || specialization !== "all"
                    ? "Try adjusting your search terms or clearing active filters."
                    : "Add your first licensed physician to start managing patient caseloads."
                }
                action={
                  search || specialization !== "all" ? (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingDoctor(null);
                        setCreateModalOpen(true);
                      }}
                      className="gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Doctor
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
                      aria-label="Select all doctors"
                    />
                  </Th>
                  <Th
                    sortable
                    sorted={sortBy === "name" ? sortOrder : false}
                    onSort={() => handleSort("name")}
                  >
                    Doctor Name
                  </Th>
                  <Th
                    sortable
                    sorted={sortBy === "specialization" ? sortOrder : false}
                    onSort={() => handleSort("specialization")}
                  >
                    Specialization
                  </Th>
                  <Th
                    sortable
                    sorted={sortBy === "hospital" ? sortOrder : false}
                    onSort={() => handleSort("hospital")}
                  >
                    Hospital
                  </Th>
                  <Th>Contact Details</Th>
                  <Th
                    sortable
                    sorted={sortBy === "patientsCount" ? sortOrder : false}
                    onSort={() => handleSort("patientsCount")}
                  >
                    Caseload
                  </Th>
                  <Th
                    align="right"
                    sortable
                    sorted={sortBy === "createdAt" ? sortOrder : false}
                    onSort={() => handleSort("createdAt")}
                  >
                    Added On
                  </Th>
                  <Th align="right" className="w-12">
                    Actions
                  </Th>
                </Thead>
                <tbody>
                  {doctors.map((doc) => {
                    const isSelected = selected.includes(doc._id);
                    return (
                      <Tr key={doc._id} className={isSelected ? "bg-muted/30" : ""}>
                        <Td>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(doc._id)}
                            aria-label={`Select ${doc.name}`}
                          />
                        </Td>
                        <Td>
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="group flex items-center gap-2.5 font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0">
                              {doc.name.replace(/^Dr\.\s*/i, "").charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold group-hover:underline">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                ID: {doc._id.slice(-6)}
                              </div>
                            </div>
                          </Link>
                        </Td>
                        <Td>
                          <Badge variant="outline" className="text-[11px] font-medium">
                            {doc.specialization}
                          </Badge>
                        </Td>
                        <Td className="text-muted-foreground max-w-[200px] truncate">
                          {doc.hospital}
                        </Td>
                        <Td>
                          <div className="text-[11px] font-medium text-foreground">{doc.phone}</div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                            {doc.email}
                          </div>
                        </Td>
                        <Td>
                          <MiniBar value={doc.patientsCount || 0} max={maxPatientCount} />
                        </Td>
                        <Td align="right" className="font-mono text-[11px] text-muted-foreground">
                          {formatDate(doc.createdAt)}
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
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/doctors/${doc._id}`}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  <span>View Patients</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingDoctor(doc);
                                  setCreateModalOpen(true);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit Doctor</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <ConfirmAction
                                title={`Delete ${doc.name}?`}
                                description={`Are you sure you want to delete ${doc.name}? Any currently assigned patients will remain in the system and be marked as Unassigned.`}
                                confirmLabel="Delete"
                                onConfirm={() => handleDeleteDoctor(doc)}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Doctor</span>
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
                label="doctors"
              />
            </>
          )}
        </div>
      </div>

      <DoctorFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        doctor={editingDoctor}
      />
    </div>
  );
}
