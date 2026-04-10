export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'Erkek' | 'Kadin';
  diagnosis: string;
  notes: string;
  createdAt: string;
}

export interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
}

export type AppointmentStatus = 'Planlandi' | 'Tamamlandi' | 'Iptal' | 'Gelmedi';
export type AppointmentType = 'Degerlendirme' | 'Tedavi Seansi' | 'Kontrol' | 'Ilk Muayene';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  date: string;
  endDate: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  status: 'Aktif' | 'Tamamlandi' | 'Askida';
  goals: string[];
  modalities: string[];
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  treatmentPlanId: string;
  date: string;
  duration: number;
  completed: boolean;
  notes: string;
  applications: string[];
  painLevelBefore: number;
  painLevelAfter: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  sets: number;
  reps: number;
  videoUrl: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
}

export interface ExerciseProgram {
  id: string;
  patientId: string;
  patientName: string;
  treatmentPlanId: string;
  exercises: ExerciseProgramItem[];
  startDate: string;
  frequency: string;
}

export interface ExerciseProgramItem {
  exerciseId: string;
  sets: number;
  reps: number;
  notes: string;
}

export interface ProgressRecord {
  id: string;
  patientId: string;
  date: string;
  painLevel: number;
  rangeOfMotion: number;
  notes: string;
}

export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  method: 'Nakit' | 'Kredi Karti' | 'Havale';
  status: 'Odendi' | 'Bekliyor' | 'Iptal' | 'NakitOnayBekliyor';
  description: string;
}
