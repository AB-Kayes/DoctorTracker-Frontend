"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/nexus/interaction-bits";
import { patientService } from "@/services/patientService";
import { doctorService } from "@/services/doctorService";
import { IPatient, IDoctor } from "@/types";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PatientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: IPatient | null;
  lockedDoctorId?: string;
  onSuccess?: (patient: IPatient) => void;
}

export function PatientFormModal({
  open,
  onOpenChange,
  patient,
  lockedDoctorId,
  onSuccess,
}: PatientFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!patient;

  // Load available doctors for selection if not locked
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors", "select-list"],
    queryFn: () => doctorService.getDoctors({ limit: 100 }),
    enabled: open && !lockedDoctorId,
  });

  const doctorsList = doctorsData?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    phone: "",
    email: "",
    condition: "",
    status: "Outpatient" as "Admitted" | "Outpatient" | "Discharged",
    doctorId: lockedDoctorId || "unassigned",
    admissionDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      const docId =
        lockedDoctorId ||
        (typeof patient.doctor === "object" && patient.doctor?._id
          ? patient.doctor._id
          : typeof patient.doctor === "string"
          ? patient.doctor
          : "unassigned");

      setFormData({
        name: patient.name || "",
        age: String(patient.age || ""),
        gender: patient.gender || "Male",
        phone: patient.phone || "",
        email: patient.email || "",
        condition: patient.condition || "",
        status: patient.status || "Outpatient",
        doctorId: docId || "unassigned",
        admissionDate: patient.admissionDate
          ? new Date(patient.admissionDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        notes: patient.notes || "",
      });
    } else {
      setFormData({
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        email: "",
        condition: "",
        status: "Outpatient",
        doctorId: lockedDoctorId || "unassigned",
        admissionDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    }
    setErrors({});
  }, [patient, open, lockedDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Patient name is required";
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      newErrors.age = "Please enter a valid age";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.condition.trim()) newErrors.condition = "Condition/Diagnosis is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email address required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const payload: Partial<IPatient> = {
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      condition: formData.condition.trim(),
      status: formData.status,
      doctor: formData.doctorId === "unassigned" ? null : (formData.doctorId as any),
      admissionDate: new Date(formData.admissionDate).toISOString() as any,
      notes: formData.notes.trim() || undefined,
    };

    try {
      if (isEditing && patient) {
        const res = await patientService.updatePatient(patient._id || patient.id!, payload);
        toast.success("Patient updated", { description: `${formData.name} record saved` });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["patients"] }),
          queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
          queryClient.invalidateQueries({ queryKey: ["doctor"] }),
          queryClient.invalidateQueries({ queryKey: ["doctors"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
        ]);
        if (onSuccess) onSuccess(res.data);
      } else {
        const res = await patientService.createPatient(payload);
        toast.success("Patient admitted", { description: `${formData.name} added to records` });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["patients"] }),
          queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
          queryClient.invalidateQueries({ queryKey: ["doctor"] }),
          queryClient.invalidateQueries({ queryKey: ["doctors"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
        ]);
        if (onSuccess) onSuccess(res.data);
      }
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save patient record";
      toast.error("Operation failed", { description: msg });
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Patient Record" : "Admit / Register New Patient"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update diagnosis, status, clinical notes, and assigned physician."
              : "Register clinical details, condition, and physician assignment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="pat-name">Full Name</Label>
              <Input
                id="pat-name"
                placeholder="Michael Scott"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.name}</FieldError>
            </div>

            <div>
              <Label htmlFor="pat-age">Age</Label>
              <Input
                id="pat-age"
                type="number"
                placeholder="42"
                min="0"
                max="130"
                value={formData.age}
                onChange={(e) => {
                  setFormData({ ...formData, age: e.target.value });
                  if (errors.age) setErrors({ ...errors, age: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.age}</FieldError>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pat-gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(val: any) => setFormData({ ...formData, gender: val })}
              >
                <SelectTrigger id="pat-gender" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pat-status">Clinical Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger id="pat-status" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admitted">Admitted</SelectItem>
                  <SelectItem value="Outpatient">Outpatient</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pat-phone">Phone Number</Label>
              <Input
                id="pat-phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.phone}</FieldError>
            </div>

            <div>
              <Label htmlFor="pat-email">Email (Optional)</Label>
              <Input
                id="pat-email"
                type="email"
                placeholder="patient@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className="mt-1"
              />
              <FieldError>{errors.email}</FieldError>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pat-condition">Condition / Diagnosis</Label>
              <Input
                id="pat-condition"
                placeholder="Hypertension, Migraine, Asthma..."
                value={formData.condition}
                onChange={(e) => {
                  setFormData({ ...formData, condition: e.target.value });
                  if (errors.condition) setErrors({ ...errors, condition: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.condition}</FieldError>
            </div>

            <div>
              <Label htmlFor="pat-date">Admission / Visit Date</Label>
              <Input
                id="pat-date"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pat-doc">Assigned Doctor (Optional)</Label>
            {lockedDoctorId ? (
              <div className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Locked to currently active doctor profile
              </div>
            ) : (
              <Select
                value={formData.doctorId}
                onValueChange={(val) => setFormData({ ...formData, doctorId: val })}
              >
                <SelectTrigger id="pat-doc" className="mt-1">
                  <SelectValue placeholder="Select a physician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
                  {doctorsList.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization} — {doc.hospital})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="pat-notes">Clinical Notes</Label>
            <textarea
              id="pat-notes"
              rows={2}
              placeholder="Initial symptoms, allergies, treatment plan notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 flex w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Record" : "Register Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
