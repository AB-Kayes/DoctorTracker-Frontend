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
import { FieldError } from "@/components/nexus/interaction-bits";
import { doctorService } from "@/services/doctorService";
import { IDoctor } from "@/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface DoctorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: IDoctor | null;
  onSuccess?: (doctor: IDoctor) => void;
}

export function DoctorFormModal({
  open,
  onOpenChange,
  doctor,
  onSuccess,
}: DoctorFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!doctor;

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    hospital: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        specialization: doctor.specialization || "",
        hospital: doctor.hospital || "",
        phone: doctor.phone || "",
        email: doctor.email || "",
      });
    } else {
      setFormData({
        name: "",
        specialization: "",
        hospital: "",
        phone: "",
        email: "",
      });
    }
    setErrors({});
  }, [doctor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Doctor name is required";
    if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
    if (!formData.hospital.trim()) newErrors.hospital = "Hospital affiliation is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email address required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      if (isEditing && doctor) {
        const res = await doctorService.updateDoctor(doctor._id || doctor.id!, formData);
        toast.success("Doctor updated", { description: `${formData.name} details saved` });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["doctors"] }),
          queryClient.invalidateQueries({ queryKey: ["doctor", doctor._id || doctor.id] }),
          queryClient.invalidateQueries({ queryKey: ["patients"] }),
          queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
        ]);
        if (onSuccess) onSuccess(res.data);
      } else {
        const res = await doctorService.createDoctor(formData);
        toast.success("Doctor created", { description: `${formData.name} added to directory` });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["doctors"] }),
          queryClient.invalidateQueries({ queryKey: ["patients"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics-overview"] }),
        ]);
        if (onSuccess) onSuccess(res.data);
      }
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save doctor";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update medical credentials, hospital affiliation, and contact details."
              : "Register a new medical specialist to manage patient rosters."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div>
            <Label htmlFor="doc-name">Full Name</Label>
            <Input
              id="doc-name"
              placeholder="Dr. Gregory House"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doc-spec">Specialization</Label>
              <Input
                id="doc-spec"
                placeholder="Cardiology"
                value={formData.specialization}
                onChange={(e) => {
                  setFormData({ ...formData, specialization: e.target.value });
                  if (errors.specialization) setErrors({ ...errors, specialization: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.specialization}</FieldError>
            </div>

            <div>
              <Label htmlFor="doc-hosp">Hospital / Clinic</Label>
              <Input
                id="doc-hosp"
                placeholder="St. Jude Hospital"
                value={formData.hospital}
                onChange={(e) => {
                  setFormData({ ...formData, hospital: e.target.value });
                  if (errors.hospital) setErrors({ ...errors, hospital: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.hospital}</FieldError>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doc-phone">Phone Number</Label>
              <Input
                id="doc-phone"
                placeholder="+1 (555) 000-0000"
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
              <Label htmlFor="doc-email">Email Address</Label>
              <Input
                id="doc-email"
                type="email"
                placeholder="doctor@hospital.org"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className="mt-1"
                required
              />
              <FieldError>{errors.email}</FieldError>
            </div>
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
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
