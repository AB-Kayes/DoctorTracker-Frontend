export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
}

export interface IDoctor {
  _id: string;
  id?: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientsCount?: number;
  patients?: IPatient[];
  createdAt: string;
  updatedAt: string;
}

export interface IPatient {
  _id: string;
  id?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  condition: string;
  status: 'Admitted' | 'Outpatient' | 'Discharged';
  doctor?: IDoctor | string | null;
  admissionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IAnalyticsOverview {
  summary: {
    totalDoctors: number;
    totalPatients: number;
    avgPatientsPerDoctor: number;
    admittedPatients: number;
    outpatientPatients: number;
    dischargedPatients: number;
    unassignedPatients: number;
    totalHospitals: number;
    doctorTrend?: number;
    patientTrend?: number;
  };
  specializations: {
    name: string;
    doctors: number;
    patients: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  timeline: {
    date: string;
    total: number;
    admitted: number;
    outpatient: number;
    discharged: number;
  }[];
  topDoctors: {
    _id: string;
    name: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }[];
  recentPatients: IPatient[];
  recentDoctors: IDoctor[];
}
