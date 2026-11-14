"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Activity,
  UserCheck,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/nexus/primitives";
import { StatCard } from "@/components/nexus/stat-card";
import { AdminPanel, TableShell, Thead, Th, Td, Tr } from "@/components/nexus/admin-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdmissionsAreaChart } from "@/components/dashboard/AdmissionsAreaChart";
import { SpecializationBarChart } from "@/components/dashboard/SpecializationBarChart";
import { ConditionDonutChart } from "@/components/dashboard/ConditionDonutChart";
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { DateRangePicker, DateRange, defaultRange } from "@/components/nexus/date-range-picker";
import { analyticsService } from "@/services/analyticsService";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [createDoctorOpen, setCreateDoctorOpen] = useState(false);
  const [createPatientOpen, setCreatePatientOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange());

  const queryParams = {
    fromDate: dateRange.from ? new Date(dateRange.from).toISOString() : undefined,
    toDate: dateRange.to ? new Date(dateRange.to).toISOString() : undefined,
  };

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ["analytics-overview", queryParams],
    queryFn: () => analyticsService.getOverview(queryParams),
  });

  const analytics = analyticsRes?.data;
  const summary = analytics?.summary || {
    totalDoctors: 0,
    totalPatients: 0,
    avgPatientsPerDoctor: 0,
    admittedPatients: 0,
    outpatientPatients: 0,
    dischargedPatients: 0,
    unassignedPatients: 0,
    totalHospitals: 0,
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Clinical Intelligence"
        title="Administrative Overview"
        description="Comprehensive analytics, doctor-to-patient ratios, hospital volume, and real-time clinical activity."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateDoctorOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Doctor
            </Button>
            <Button
              size="sm"
              onClick={() => setCreatePatientOpen(true)}
              className="gap-1.5 shadow-xs"
            >
              <Activity className="h-3.5 w-3.5" /> Admit Patient
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Doctors"
            value={summary.totalDoctors}
            icon={Users}
            accent="primary"
            trend={summary.doctorTrend}
            description="Active licensed specialists"
          />
          <StatCard
            label="Total Patients"
            value={summary.totalPatients}
            icon={Activity}
            accent="info"
            trend={summary.patientTrend}
            description="Registered clinical records"
          />
          <StatCard
            label="Patients / Doctor Ratio"
            value={`${summary.avgPatientsPerDoctor} : 1`}
            icon={UserCheck}
            accent="success"
            description="Average physician caseload"
          />
          <StatCard
            label="Hospital Affiliations"
            value={summary.totalHospitals}
            icon={Building2}
            accent="warning"
            description="Connected medical centers"
          />
        </div>

        {/* Admissions Timeline Chart */}
        <AdminPanel
          title="Patient Admissions Timeline"
          description="Daily patient intake trend and admission status breakdown across all medical facilities."
          action={
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/patients">
                View all patients <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="p-4 sm:p-5">
            <AdmissionsAreaChart data={analytics?.timeline || []} />
          </div>
        </AdminPanel>

        {/* Charts Grid: Specializations & Patient Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminPanel
            title="Specialty Distribution & Patient Load"
            description="Number of specialist doctors and assigned patient count per medical department."
          >
            <div className="p-4 sm:p-5">
              <SpecializationBarChart data={analytics?.specializations || []} />
            </div>
          </AdminPanel>

          <AdminPanel
            title="Patient Clinical Status"
            description="Current proportion of Admitted, Outpatient, and Discharged patient records."
          >
            <div className="p-4 sm:p-5">
              <ConditionDonutChart data={analytics?.statusDistribution || []} />
            </div>
          </AdminPanel>
        </div>

        {/* Recent Activity Tables Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Patients */}
          <AdminPanel
            title="Recently Admitted Patients"
            description="Latest patient evaluations and physician assignments."
            action={
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/patients">View all</Link>
              </Button>
            }
          >
            <TableShell>
              <Thead>
                <Th>Patient</Th>
                <Th>Condition</Th>
                <Th>Status</Th>
                <Th align="right">Admission Date</Th>
              </Thead>
              <tbody>
                {(analytics?.recentPatients || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                      No recent patient registrations
                    </td>
                  </tr>
                ) : (
                  (analytics?.recentPatients || []).map((p) => (
                    <Tr key={p._id}>
                      <Td>
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.age} yrs · {p.gender}
                        </div>
                      </Td>
                      <Td>
                        <span className="font-medium text-foreground">{p.condition}</span>
                      </Td>
                      <Td>
                        <Badge
                          variant={
                            p.status === "Admitted"
                              ? "default"
                              : p.status === "Outpatient"
                              ? "info"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </Td>
                      <Td align="right" className="font-mono text-[11px] text-muted-foreground">
                        {formatDate(p.admissionDate)}
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </TableShell>
          </AdminPanel>

          {/* Top Doctors / Recent Doctors */}
          <AdminPanel
            title="Top Physicians by Patient Load"
            description="Specialists managing the highest number of active clinical patients."
            action={
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/doctors">Directory</Link>
              </Button>
            }
          >
            <TableShell>
              <Thead>
                <Th>Physician</Th>
                <Th>Specialization</Th>
                <Th>Hospital</Th>
                <Th align="right">Caseload</Th>
              </Thead>
              <tbody>
                {(analytics?.topDoctors || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                      No doctor records available
                    </td>
                  </tr>
                ) : (
                  (analytics?.topDoctors || []).map((doc) => (
                    <Tr key={doc._id}>
                      <Td>
                        <Link
                          href={`/doctors/${doc._id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {doc.name}
                        </Link>
                      </Td>
                      <Td>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.specialization}
                        </Badge>
                      </Td>
                      <Td className="truncate max-w-[160px] text-muted-foreground">
                        {doc.hospital}
                      </Td>
                      <Td align="right">
                        <span className="font-bold tabular-nums text-foreground">
                          {doc.patientCount} patients
                        </span>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </TableShell>
          </AdminPanel>
        </div>
      </div>

      <DoctorFormModal
        open={createDoctorOpen}
        onOpenChange={setCreateDoctorOpen}
      />

      <PatientFormModal
        open={createPatientOpen}
        onOpenChange={setCreatePatientOpen}
      />
    </div>
  );
}
