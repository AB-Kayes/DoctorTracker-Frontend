import { api } from "@/lib/api";
import { IDoctor, IPaginationMeta, IPatient } from "@/types";

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const doctorService = {
  async getDoctors(params: GetDoctorsParams = {}): Promise<{
    data: IDoctor[];
    pagination: IPaginationMeta;
    meta: { specializations: string[]; hospitals: string[] };
  }> {
    const res = await api.get("/doctors", { params });
    return res.data;
  },

  async getDoctorById(id: string): Promise<{
    data: IDoctor & {
      patientsCount: number;
      patients: IPatient[];
      stats: { totalPatients: number; admitted: number; outpatient: number; discharged: number };
    };
  }> {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  async createDoctor(data: {
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
    email: string;
  }): Promise<{ data: IDoctor; message: string }> {
    const res = await api.post("/doctors", data);
    return res.data;
  },

  async updateDoctor(id: string, data: Partial<IDoctor>): Promise<{ data: IDoctor; message: string }> {
    const res = await api.put(`/doctors/${id}`, data);
    return res.data;
  },

  async deleteDoctor(id: string): Promise<{ message: string; data: any }> {
    const res = await api.delete(`/doctors/${id}`);
    return res.data;
  },

  async bulkDeleteDoctors(ids: string[]): Promise<{ message: string; deletedCount: number; unassignedPatientsCount: number }> {
    const res = await api.post("/doctors/bulk-delete", { ids });
    return res.data;
  },

  async getDoctorPatients(id: string, params: { page?: number; limit?: number; search?: string; status?: string; condition?: string; fromDate?: string; toDate?: string } = {}): Promise<{
    data: IPatient[];
    pagination: IPaginationMeta;
  }> {
    const res = await api.get(`/doctors/${id}/patients`, { params });
    return res.data;
  },

  async addDoctorPatient(id: string, data: Partial<IPatient>): Promise<{ data: IPatient; message: string }> {
    const res = await api.post(`/doctors/${id}/patients`, data);
    return res.data;
  },

  async removeDoctorPatient(id: string, patientId: string): Promise<{ message: string }> {
    const res = await api.delete(`/doctors/${id}/patients/${patientId}`);
    return res.data;
  },
};
