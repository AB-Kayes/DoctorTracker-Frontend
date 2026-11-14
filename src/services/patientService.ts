import { api } from "@/lib/api";
import { IPatient, IPaginationMeta } from "@/types";

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  condition?: string;
  doctorId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const patientService = {
  async getPatients(params: GetPatientsParams = {}): Promise<{
    data: IPatient[];
    pagination: IPaginationMeta;
    meta: {
      counts: { all: number; admitted: number; outpatient: number; discharged: number };
      conditions: string[];
      doctors: { _id: string; name: string; specialization: string; hospital: string }[];
    };
  }> {
    const res = await api.get("/patients", { params });
    return res.data;
  },

  async getPatientById(id: string): Promise<{ data: IPatient }> {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },

  async createPatient(data: Partial<IPatient>): Promise<{ data: IPatient; message: string }> {
    const res = await api.post("/patients", data);
    return res.data;
  },

  async updatePatient(id: string, data: Partial<IPatient>): Promise<{ data: IPatient; message: string }> {
    const res = await api.put(`/patients/${id}`, data);
    return res.data;
  },

  async deletePatient(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/patients/${id}`);
    return res.data;
  },

  async bulkDeletePatients(ids: string[]): Promise<{ message: string; deletedCount: number }> {
    const res = await api.post("/patients/bulk-delete", { ids });
    return res.data;
  },

  async bulkUpdatePatientStatus(ids: string[], status: 'Admitted' | 'Outpatient' | 'Discharged'): Promise<{ message: string; modifiedCount: number }> {
    const res = await api.post("/patients/bulk-status", { ids, status });
    return res.data;
  },
};
