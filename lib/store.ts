import { create } from 'zustand';
import { Appointment, Patient, Session, Payment, ExerciseProgram, TreatmentPlan } from './types';
import { appointments as mockAppointments, patients as mockPatients, sessions as mockSessions, payments as mockPayments, exercisePrograms as mockExercisePrograms, treatmentPlans as mockTreatmentPlans } from './mock-data';
import { Language } from './i18n';

export interface ClinicSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxNo: string;
  city: string;
  district: string;
}

export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  title: string;
  specialty: string;
  license: string;
}

export interface WorkHoursSettings {
  [key: string]: string;
  mondayStart: string; mondayEnd: string;
  tuesdayStart: string; tuesdayEnd: string;
  wednesdayStart: string; wednesdayEnd: string;
  thursdayStart: string; thursdayEnd: string;
  fridayStart: string; fridayEnd: string;
  saturdayStart: string; saturdayEnd: string;
  sundayStart: string; sundayEnd: string;
  sessionDuration: string;
  breakBetween: string;
}

export interface PatientProfileSettings {
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  notes: string;
}

export interface NotificationSettings {
  [key: string]: boolean;
  appointmentReminder: boolean;
  sessionComplete: boolean;
  paymentReceived: boolean;
  dailySummary: boolean;
  smsNotification: boolean;
  emailNotification: boolean;
}

export interface ProgressNote {
  id: string;
  patientId: string;
  date: string;
  text: string;
  author: 'patient' | 'doctor';
}

export interface MoodEntry {
  id: string;
  patientId: string;
  date: string;
  mood: number; // 1-5
  painLevel: number; // 1-5
}

export interface ChatAttachment {
  type: 'image' | 'file';
  name: string;
  size?: string;
}

export interface ChatMessage {
  id: string;
  patientId: string;
  text: string;
  sender: 'patient' | 'doctor';
  date: string;
  read: boolean;
  replyTo?: string;
  attachment?: ChatAttachment;
  starred?: boolean;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  takenDates: string[]; // ISO date strings for days taken
}

export interface DailyGoal {
  id: string;
  patientId: string;
  text: string;
  icon: string;
  completedDates: string[]; // ISO date strings
}

export interface PainPoint {
  id: string;
  patientId: string;
  date: string;
  x: number;
  y: number;
  intensity: number; // 1-5
  label: string;
}

export interface SleepEntry {
  id: string;
  patientId: string;
  date: string;
  sleepHours: number;
  energyLevel: number; // 1-5
}

export interface AppNotification {
  id: string;
  type: 'appointment' | 'message' | 'medication' | 'exercise' | 'achievement';
  title: string;
  description: string;
  date: string;
  read: boolean;
  link?: string;
  targetRole?: 'doctor' | 'patient';
  targetPatientId?: string;
}

export interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  type: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ExerciseCompletion {
  patientId: string;
  date: string; // YYYY-MM-DD
}

export interface TreatmentPlanNote {
  id: string;
  planId: string;
  text: string;
  author: string;
  date: string;
}

interface AppStore {
  // Data state (mutable copies of mock data)
  appointments: Appointment[];
  patients: Patient[];
  sessions: Session[];
  payments: Payment[];
  treatmentPlans: TreatmentPlan[];
  exercisePrograms: ExerciseProgram[];

  // Treatment plan actions
  addTreatmentPlan: (plan: TreatmentPlan) => void;
  updateTreatmentPlan: (id: string, updates: Partial<TreatmentPlan>) => void;
  treatmentPlanNotes: TreatmentPlanNote[];
  addTreatmentPlanNote: (note: TreatmentPlanNote) => void;

  // Exercise program actions
  addExerciseProgram: (program: ExerciseProgram) => void;
  updateExerciseProgram: (id: string, program: Partial<ExerciseProgram>) => void;
  removeExerciseProgram: (id: string) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontSize: 'small' | 'normal' | 'large';
  setFontSize: (size: 'small' | 'normal' | 'large') => void;
  isLoggedIn: boolean;
  userRole: 'doctor' | 'patient';
  loggedInPatientId: string | null;
  logout: () => void;
  login: (role?: 'doctor' | 'patient', patientId?: string) => void;

  // Toast
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  clearToast: () => void;

  // Settings
  clinic: ClinicSettings;
  profile: ProfileSettings;
  workHours: WorkHoursSettings;
  notifications: NotificationSettings;
  updateClinic: (clinic: ClinicSettings) => void;
  updateProfile: (profile: ProfileSettings) => void;
  updateWorkHours: (workHours: WorkHoursSettings) => void;
  updateNotifications: (notifications: NotificationSettings) => void;

  // Patient profile settings (per-patient, keyed by patient ID)
  patientProfiles: Record<string, PatientProfileSettings>;
  updatePatientProfile: (patientId: string, profile: PatientProfileSettings) => void;

  // Progress notes (patient feelings / doctor observations)
  progressNotes: ProgressNote[];
  addProgressNote: (note: ProgressNote) => void;

  // Daily mood entries (patient self-assessment)
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: MoodEntry) => void;

  // Chat messages
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  markMessagesRead: (patientId: string, readerRole: 'patient' | 'doctor') => void;
  deleteChatMessage: (id: string) => void;
  toggleStarMessage: (id: string) => void;

  // Medications
  medications: Medication[];
  addMedication: (med: Medication) => void;
  toggleMedicationTaken: (id: string, date: string) => void;

  // Daily goals
  dailyGoals: DailyGoal[];
  toggleDailyGoal: (id: string, date: string) => void;

  // Water intake: record per patient per day
  waterIntake: Record<string, number>; // key: "patientId-YYYY-MM-DD", value: glasses
  addWaterGlass: (patientId: string) => void;

  // Pain points
  painPoints: PainPoint[];
  addPainPoint: (point: PainPoint) => void;
  removePainPoint: (id: string) => void;

  // Sleep & Energy
  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: SleepEntry) => void;

  // Notifications
  appNotifications: AppNotification[];
  addNotification: (n: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Appointment requests
  appointmentRequests: AppointmentRequest[];
  addAppointmentRequest: (req: AppointmentRequest) => void;
  updateAppointmentRequest: (id: string, status: 'approved' | 'rejected') => void;

  // Exercise completions (heatmap)
  exerciseCompletions: ExerciseCompletion[];
  addExerciseCompletion: (patientId: string, date: string) => void;

  // Actions
  addAppointment: (appointment: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addPatient: (patient: Patient) => void;
  toggleSessionComplete: (id: string) => void;
  addPayment: (payment: Payment) => void;
  completePayment: (id: string, method: Payment['method']) => void;
  requestCashPayment: (id: string) => void;
  approveCashPayment: (id: string) => void;
  rejectCashPayment: (id: string) => void;
}

const defaultClinic: ClinicSettings = {
  name: 'FizyoPanel Klinik',
  address: 'Atatürk Caddesi No: 45, Kadıköy, İstanbul',
  phone: '0216 555 0123',
  email: 'info@fizyopanel.com',
  taxNo: '1234567890',
  city: 'İstanbul',
  district: 'Kadıköy',
};

const defaultProfile: ProfileSettings = {
  fullName: 'Fzt.Dr. Ceydanur Congaz',
  email: 'ceydanur@fizyopanel.com',
  phone: '0532 123 4567',
  title: 'Fzt.Dr.',
  specialty: 'Nörolojik Rehabilitasyon',
  license: 'FZT-2024-001',
};

const defaultWorkHours: WorkHoursSettings = {
  mondayStart: '08:00', mondayEnd: '18:00',
  tuesdayStart: '08:00', tuesdayEnd: '18:00',
  wednesdayStart: '08:00', wednesdayEnd: '18:00',
  thursdayStart: '08:00', thursdayEnd: '18:00',
  fridayStart: '08:00', fridayEnd: '18:00',
  saturdayStart: '09:00', saturdayEnd: '14:00',
  sundayStart: '', sundayEnd: '',
  sessionDuration: '45',
  breakBetween: '15',
};

const defaultNotifications: NotificationSettings = {
  appointmentReminder: true,
  sessionComplete: true,
  paymentReceived: true,
  dailySummary: false,
  smsNotification: false,
  emailNotification: true,
};

export const useStore = create<AppStore>((set) => ({
  appointments: [...mockAppointments],
  patients: [...mockPatients],
  sessions: [...mockSessions],
  payments: [...mockPayments],

  treatmentPlans: [...mockTreatmentPlans],
  addTreatmentPlan: (plan) =>
    set((s) => ({ treatmentPlans: [...s.treatmentPlans, plan] })),
  updateTreatmentPlan: (id, updates) =>
    set((s) => ({
      treatmentPlans: s.treatmentPlans.map((tp) =>
        tp.id === id ? { ...tp, ...updates } : tp
      ),
    })),
  treatmentPlanNotes: [
    { id: 'tpn1', planId: 'tp1', text: 'Hasta tedaviye iyi yanıt veriyor. Manuel terapi sonrası belirgin rahatlama gözlemlendi.', author: 'Fzt.Dr. Ceydanur Congaz', date: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'tpn2', planId: 'tp1', text: 'TENS süresi 20 dakikaya çıkarıldı. Kor stabilite egzersizlerine başlandı.', author: 'Fzt.Dr. Ceydanur Congaz', date: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'tpn3', planId: 'tp1', text: 'Ağrı seviyesi 3/10\'a düştü. Güçlendirme fazına geçiş planlanıyor.', author: 'Fzt.Dr. Ceydanur Congaz', date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'tpn4', planId: 'tp2', text: 'Omuz ROM artışı gözlemlendi. Fleksiyon 130 dereceye ulaştı.', author: 'Fzt.Dr. Ceydanur Congaz', date: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'tpn5', planId: 'tp2', text: 'Güçlendirme egzersizlerine bant ile başlandı. Hasta uyumlu.', author: 'Fzt.Dr. Ceydanur Congaz', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'tpn6', planId: 'tp3', text: 'Fleksiyon 120 dereceye ulaştı. Spora dönüş protokolüne başlanabilir.', author: 'Fzt.Dr. Ceydanur Congaz', date: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  addTreatmentPlanNote: (note) =>
    set((s) => ({ treatmentPlanNotes: [...s.treatmentPlanNotes, note] })),

  exercisePrograms: [...mockExercisePrograms],
  addExerciseProgram: (program) =>
    set((s) => ({ exercisePrograms: [...s.exercisePrograms, program] })),
  updateExerciseProgram: (id, updates) =>
    set((s) => ({
      exercisePrograms: s.exercisePrograms.map((ep) =>
        ep.id === id ? { ...ep, ...updates } : ep
      ),
    })),
  removeExerciseProgram: (id) =>
    set((s) => ({ exercisePrograms: s.exercisePrograms.filter((ep) => ep.id !== id) })),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  language: 'tr',
  setLanguage: (lang) => set({ language: lang }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  fontSize: 'normal',
  setFontSize: (size) => set({ fontSize: size }),
  isLoggedIn: true,
  userRole: 'doctor',
  loggedInPatientId: null,
  logout: () => set({ isLoggedIn: false, userRole: 'doctor', loggedInPatientId: null }),
  login: (role = 'doctor', patientId) => set({ isLoggedIn: true, userRole: role, loggedInPatientId: patientId || null }),

  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  clearToast: () => set({ toast: null }),

  // Settings
  clinic: { ...defaultClinic },
  profile: { ...defaultProfile },
  workHours: { ...defaultWorkHours },
  notifications: { ...defaultNotifications },
  updateClinic: (clinic) => set({ clinic }),
  updateProfile: (profile) => set({ profile }),
  updateWorkHours: (workHours) => set({ workHours }),
  updateNotifications: (notifications) => set({ notifications }),

  patientProfiles: {},
  updatePatientProfile: (patientId, profile) =>
    set((s) => ({ patientProfiles: { ...s.patientProfiles, [patientId]: profile } })),

  progressNotes: [
    { id: 'pn1', patientId: 'p1', date: new Date(Date.now() - 5 * 86400000).toISOString(), text: 'Bel ağrım azaldı ama sabahları hâlâ sertlik hissediyorum.', author: 'patient' },
    { id: 'pn2', patientId: 'p1', date: new Date(Date.now() - 3 * 86400000).toISOString(), text: 'Egzersizleri düzenli yapıyor, kor stabilitesi gelişiyor. TENS süresini artırdık.', author: 'doctor' },
    { id: 'pn3', patientId: 'p1', date: new Date(Date.now() - 1 * 86400000).toISOString(), text: 'Bugün yürüyüş yapabildim, eskisi kadar acımıyor.', author: 'patient' },
    { id: 'pn4', patientId: 'p2', date: new Date(Date.now() - 4 * 86400000).toISOString(), text: 'Omzumu yukarı kaldırırken hâlâ ağrı var ama öncesine göre daha iyi.', author: 'patient' },
    { id: 'pn5', patientId: 'p2', date: new Date(Date.now() - 2 * 86400000).toISOString(), text: 'ROM artışı gözlemlendi. Güçlendirme fazına geçildi.', author: 'doctor' },
    { id: 'pn6', patientId: 'p3', date: new Date(Date.now() - 6 * 86400000).toISOString(), text: 'Diz şişliği azaldı, merdiven çıkarken daha rahatım.', author: 'patient' },
    { id: 'pn7', patientId: 'p3', date: new Date(Date.now() - 2 * 86400000).toISOString(), text: 'Fleksiyon 120 dereceye ulaştı. Spora dönüş protokolüne başlanabilir.', author: 'doctor' },
  ],
  addProgressNote: (note) =>
    set((s) => ({ progressNotes: [...s.progressNotes, note] })),

  moodEntries: [
    { id: 'me1', patientId: 'p1', date: new Date(Date.now() - 6 * 86400000).toISOString(), mood: 2, painLevel: 4 },
    { id: 'me2', patientId: 'p1', date: new Date(Date.now() - 5 * 86400000).toISOString(), mood: 3, painLevel: 3 },
    { id: 'me3', patientId: 'p1', date: new Date(Date.now() - 4 * 86400000).toISOString(), mood: 3, painLevel: 3 },
    { id: 'me4', patientId: 'p1', date: new Date(Date.now() - 3 * 86400000).toISOString(), mood: 4, painLevel: 2 },
    { id: 'me5', patientId: 'p1', date: new Date(Date.now() - 2 * 86400000).toISOString(), mood: 4, painLevel: 2 },
    { id: 'me6', patientId: 'p1', date: new Date(Date.now() - 1 * 86400000).toISOString(), mood: 5, painLevel: 1 },
    { id: 'me7', patientId: 'p2', date: new Date(Date.now() - 3 * 86400000).toISOString(), mood: 3, painLevel: 3 },
    { id: 'me8', patientId: 'p2', date: new Date(Date.now() - 1 * 86400000).toISOString(), mood: 4, painLevel: 2 },
    { id: 'me9', patientId: 'p3', date: new Date(Date.now() - 2 * 86400000).toISOString(), mood: 4, painLevel: 2 },
    { id: 'me10', patientId: 'p3', date: new Date(Date.now() - 1 * 86400000).toISOString(), mood: 5, painLevel: 1 },
  ],
  addMoodEntry: (entry) =>
    set((s) => ({ moodEntries: [...s.moodEntries, entry] })),

  chatMessages: [
    { id: 'cm1', patientId: 'p1', text: 'Merhaba doktor, egzersizleri yaparken hafif ağrı hissediyorum, normal mi?', sender: 'patient', date: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
    { id: 'cm2', patientId: 'p1', text: 'Hafif bir gerginlik hissi normal, ancak keskin ağrı olursa hemen bırakın ve beni bilgilendirin.', sender: 'doctor', date: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString(), read: true, starred: true },
    { id: 'cm3', patientId: 'p1', text: 'Teşekkürler, anladım. Bir de sıcak uygulama yapabilir miyim?', sender: 'patient', date: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
    { id: 'cm4', patientId: 'p1', text: 'Evet, egzersiz öncesi 15 dk sıcak uygulama yapabilirsiniz. İşte detaylı talimatlar:', sender: 'doctor', date: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(), read: true },
    { id: 'cm4b', patientId: 'p1', text: '', sender: 'doctor', date: new Date(Date.now() - 2 * 86400000 + 3700000).toISOString(), read: true, attachment: { type: 'file', name: 'Sicak_Uygulama_Talimatlari.pdf', size: '245 KB' } },
    { id: 'cm5', patientId: 'p1', text: 'Çok teşekkür ederim, hemen indirdim.', sender: 'patient', date: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString(), read: true },
    { id: 'cm6', patientId: 'p1', text: 'Bugünkü egzersiz sonrası bacağımın fotoğrafını gönderiyorum, şişlik var mı sizce?', sender: 'patient', date: new Date(Date.now() - 1 * 86400000).toISOString(), read: true },
    { id: 'cm6b', patientId: 'p1', text: '', sender: 'patient', date: new Date(Date.now() - 1 * 86400000 + 60000).toISOString(), read: true, attachment: { type: 'image', name: 'bacak_foto.jpg', size: '1.2 MB' } },
    { id: 'cm7', patientId: 'p1', text: 'Görüntüye baktım, normal görünüyor. Hafif ödem olabilir, buz uygulayın.', sender: 'doctor', date: new Date(Date.now() - 1 * 86400000 + 7200000).toISOString(), read: true },
    { id: 'cm8', patientId: 'p1', text: 'Doktor bey, bu sabah ağrısız uyandım! Çok mutluyum.', sender: 'patient', date: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: 'cm9', patientId: 'p1', text: 'Harika haber! Tedavi planına uyumunuz mükemmel, böyle devam edin.', sender: 'doctor', date: new Date(Date.now() - 1800000).toISOString(), read: false },

    { id: 'cm10', patientId: 'p2', text: 'Omzumda sabahları sertlik çok fazla, ne yapabilirim?', sender: 'patient', date: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
    { id: 'cm11', patientId: 'p2', text: 'Sabah duşta ılık su altında yavaşça omuz rotasyonu yapın, 5 dk yeterli.', sender: 'doctor', date: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString(), read: true, starred: true },
    { id: 'cm12', patientId: 'p2', text: 'Denedim, gerçekten iyi geldi! Teşekkürler.', sender: 'patient', date: new Date(Date.now() - 1 * 86400000).toISOString(), read: true },
    { id: 'cm13', patientId: 'p2', text: 'Egzersiz videosunu paylaşıyorum, her sabah bunu takip edin.', sender: 'doctor', date: new Date(Date.now() - 1 * 86400000 + 3600000).toISOString(), read: true, attachment: { type: 'file', name: 'Omuz_Egzersiz_Programi.pdf', size: '1.8 MB' } },
    { id: 'cm14', patientId: 'p2', text: 'Bu hafta çok daha iyi hissediyorum, ağrı neredeyse yok.', sender: 'patient', date: new Date(Date.now() - 5400000).toISOString(), read: false },

    { id: 'cm15', patientId: 'p3', text: 'Merhaba, diz egzersizlerini günde kaç kez yapmalıyım?', sender: 'patient', date: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
    { id: 'cm16', patientId: 'p3', text: 'Günde 2 kez, sabah ve akşam yapmanızı öneriyorum. Her sette 15 tekrar.', sender: 'doctor', date: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(), read: true },
    { id: 'cm17', patientId: 'p3', text: 'Peki yürüyüş yapabilir miyim? Hafif tempolu.', sender: 'patient', date: new Date(Date.now() - 1 * 86400000).toISOString(), read: true },
    { id: 'cm18', patientId: 'p3', text: 'Evet, günde 20-30 dk düz zeminde yürüyüş yapabilirsiniz. Merdivenden kaçının.', sender: 'doctor', date: new Date(Date.now() - 1 * 86400000 + 5400000).toISOString(), read: true },
    { id: 'cm19', patientId: 'p3', text: 'Bugün 30 dk yürüdüm, dizimde ağrı olmadı!', sender: 'patient', date: new Date(Date.now() - 7200000).toISOString(), read: false },
  ],
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  markMessagesRead: (patientId, readerRole) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.patientId === patientId && m.sender !== readerRole && !m.read
          ? { ...m, read: true }
          : m
      ),
    })),
  deleteChatMessage: (id) =>
    set((s) => ({ chatMessages: s.chatMessages.filter((m) => m.id !== id) })),
  toggleStarMessage: (id) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.id === id ? { ...m, starred: !m.starred } : m
      ),
    })),

  medications: [
    { id: 'med1', patientId: 'p1', name: 'Ibuprofen', dosage: '400mg', frequency: 'Günde 2 kez', takenDates: [] },
    { id: 'med2', patientId: 'p1', name: 'Vitamin D', dosage: '1000 IU', frequency: 'Günde 1 kez', takenDates: [] },
    { id: 'med3', patientId: 'p1', name: 'Magnezyum', dosage: '200mg', frequency: 'Günde 1 kez', takenDates: [] },
    { id: 'med4', patientId: 'p2', name: 'Paracetamol', dosage: '500mg', frequency: 'Gerektiğinde', takenDates: [] },
    { id: 'med5', patientId: 'p2', name: 'Omega-3', dosage: '1000mg', frequency: 'Günde 1 kez', takenDates: [] },
  ],
  addMedication: (med) =>
    set((s) => ({ medications: [...s.medications, med] })),
  toggleMedicationTaken: (id, date) =>
    set((s) => ({
      medications: s.medications.map((m) =>
        m.id === id
          ? { ...m, takenDates: m.takenDates.includes(date) ? m.takenDates.filter((d) => d !== date) : [...m.takenDates, date] }
          : m
      ),
    })),

  dailyGoals: [
    { id: 'dg1', patientId: 'p1', text: 'Egzersizleri yap', icon: 'dumbbell', completedDates: [] },
    { id: 'dg2', patientId: 'p1', text: '8 bardak su iç', icon: 'droplets', completedDates: [] },
    { id: 'dg3', patientId: 'p1', text: '30 dk yürüyüş yap', icon: 'footprints', completedDates: [] },
    { id: 'dg4', patientId: 'p1', text: 'İlaçlarını al', icon: 'pill', completedDates: [] },
    { id: 'dg5', patientId: 'p1', text: 'Germe egzersizi yap', icon: 'stretch', completedDates: [] },
    { id: 'dg6', patientId: 'p2', text: 'Omuz egzersizlerini yap', icon: 'dumbbell', completedDates: [] },
    { id: 'dg7', patientId: 'p2', text: '8 bardak su iç', icon: 'droplets', completedDates: [] },
    { id: 'dg8', patientId: 'p2', text: 'Buz uygula (15dk)', icon: 'snowflake', completedDates: [] },
    { id: 'dg9', patientId: 'p3', text: 'Diz egzersizlerini yap', icon: 'dumbbell', completedDates: [] },
    { id: 'dg10', patientId: 'p3', text: '8 bardak su iç', icon: 'droplets', completedDates: [] },
  ],
  toggleDailyGoal: (id, date) =>
    set((s) => ({
      dailyGoals: s.dailyGoals.map((g) =>
        g.id === id
          ? { ...g, completedDates: g.completedDates.includes(date) ? g.completedDates.filter((d) => d !== date) : [...g.completedDates, date] }
          : g
      ),
    })),

  waterIntake: {},
  addWaterGlass: (patientId) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${patientId}-${today}`;
    set((s) => ({ waterIntake: { ...s.waterIntake, [key]: (s.waterIntake[key] || 0) + 1 } }));
  },

  painPoints: [
    { id: 'pp1', patientId: 'p1', date: new Date(Date.now() - 2 * 86400000).toISOString(), x: 50, y: 62, intensity: 3, label: 'Bel' },
    { id: 'pp2', patientId: 'p2', date: new Date(Date.now() - 1 * 86400000).toISOString(), x: 68, y: 28, intensity: 4, label: 'Sağ Omuz' },
    { id: 'pp3', patientId: 'p3', date: new Date(Date.now() - 1 * 86400000).toISOString(), x: 42, y: 78, intensity: 2, label: 'Sol Diz' },
  ],
  addPainPoint: (point) =>
    set((s) => ({ painPoints: [...s.painPoints, point] })),
  removePainPoint: (id) =>
    set((s) => ({ painPoints: s.painPoints.filter((p) => p.id !== id) })),

  // Sleep & Energy
  sleepEntries: [
    { id: 'sl1', patientId: 'p1', date: new Date(Date.now() - 6 * 86400000).toISOString(), sleepHours: 6, energyLevel: 2 },
    { id: 'sl2', patientId: 'p1', date: new Date(Date.now() - 5 * 86400000).toISOString(), sleepHours: 7, energyLevel: 3 },
    { id: 'sl3', patientId: 'p1', date: new Date(Date.now() - 4 * 86400000).toISOString(), sleepHours: 6.5, energyLevel: 3 },
    { id: 'sl4', patientId: 'p1', date: new Date(Date.now() - 3 * 86400000).toISOString(), sleepHours: 8, energyLevel: 4 },
    { id: 'sl5', patientId: 'p1', date: new Date(Date.now() - 2 * 86400000).toISOString(), sleepHours: 7.5, energyLevel: 4 },
    { id: 'sl6', patientId: 'p1', date: new Date(Date.now() - 1 * 86400000).toISOString(), sleepHours: 8, energyLevel: 5 },
    { id: 'sl7', patientId: 'p2', date: new Date(Date.now() - 3 * 86400000).toISOString(), sleepHours: 7, energyLevel: 3 },
    { id: 'sl8', patientId: 'p2', date: new Date(Date.now() - 2 * 86400000).toISOString(), sleepHours: 7.5, energyLevel: 4 },
    { id: 'sl9', patientId: 'p2', date: new Date(Date.now() - 1 * 86400000).toISOString(), sleepHours: 6, energyLevel: 2 },
    { id: 'sl10', patientId: 'p3', date: new Date(Date.now() - 2 * 86400000).toISOString(), sleepHours: 8, energyLevel: 4 },
    { id: 'sl11', patientId: 'p3', date: new Date(Date.now() - 1 * 86400000).toISOString(), sleepHours: 7, energyLevel: 3 },
  ],
  addSleepEntry: (entry) =>
    set((s) => ({ sleepEntries: [...s.sleepEntries, entry] })),

  // Notifications
  appNotifications: [
    { id: 'n1', type: 'appointment', title: 'Randevu Hatırlatma', description: 'Yarın saat 10:00\'da randevunuz var.', date: new Date(Date.now() - 3600000).toISOString(), read: false, link: '/randevular', targetRole: 'patient', targetPatientId: 'p1' },
    { id: 'n2', type: 'medication', title: 'İlaç Saati', description: 'Ibuprofen 400mg almanızın zamanı geldi.', date: new Date(Date.now() - 7200000).toISOString(), read: false, targetRole: 'patient', targetPatientId: 'p1' },
    { id: 'n3', type: 'exercise', title: 'Egzersiz Zamanı', description: 'Günlük egzersiz programınızı henüz tamamlamadınız.', date: new Date(Date.now() - 10800000).toISOString(), read: false, link: '/egzersiz-programlari', targetRole: 'patient', targetPatientId: 'p1' },
    { id: 'n4', type: 'achievement', title: 'Yeni Rozet!', description: '3 gün üst üste su hedefinizi tutturdunuz!', date: new Date(Date.now() - 86400000).toISOString(), read: true, targetRole: 'patient', targetPatientId: 'p1' },
    { id: 'n5', type: 'message', title: 'Yeni Mesaj', description: 'Doktorunuzdan yeni bir mesaj var.', date: new Date(Date.now() - 2 * 86400000).toISOString(), read: true, targetRole: 'patient', targetPatientId: 'p1' },
    { id: 'n6', type: 'appointment', title: 'Yeni Randevu Talebi', description: 'Ahmet Yılmaz randevu talep etti.', date: new Date(Date.now() - 1800000).toISOString(), read: false, link: '/randevular', targetRole: 'doctor' },
    { id: 'n7', type: 'achievement', title: 'Tebrikler!', description: 'Tedavi planınızın %50\'sini tamamladınız.', date: new Date(Date.now() - 3 * 86400000).toISOString(), read: true, targetRole: 'patient', targetPatientId: 'p1' },
  ],
  addNotification: (n) =>
    set((s) => ({ appNotifications: [n, ...s.appNotifications] })),
  markNotificationRead: (id) =>
    set((s) => ({
      appNotifications: s.appNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      appNotifications: s.appNotifications.map((n) => ({ ...n, read: true })),
    })),

  // Appointment requests
  appointmentRequests: [
    { id: 'ar1', patientId: 'p1', patientName: 'Ahmet Yılmaz', preferredDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], preferredTime: '10:00', type: 'Tedavi Seansi', notes: 'Bel ağrım devam ediyor, kontrol istiyorum.', status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'ar2', patientId: 'p2', patientName: 'Elif Demir', preferredDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], preferredTime: '14:00', type: 'Kontrol', notes: 'Omuz durumumu değerlendirmek istiyorum.', status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'ar3', patientId: 'p3', patientName: 'Mehmet Kaya', preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], preferredTime: '11:00', type: 'Tedavi Seansi', notes: '', status: 'approved', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  ],
  addAppointmentRequest: (req) =>
    set((s) => {
      const notification: AppNotification = {
        id: `notif-arq-${Date.now()}`,
        type: 'appointment',
        title: 'Yeni Randevu Talebi',
        description: `${req.patientName} ${req.preferredDate} tarihinde saat ${req.preferredTime} için ${req.type} randevusu talep etti.`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'doctor',
      };
      return {
        appointmentRequests: [...s.appointmentRequests, req],
        appNotifications: [notification, ...s.appNotifications],
      };
    }),
  updateAppointmentRequest: (id, status) =>
    set((s) => {
      const request = s.appointmentRequests.find((r) => r.id === id);
      if (!request) return {};

      const notification: AppNotification = {
        id: `notif-ar-${Date.now()}`,
        type: 'appointment',
        title: status === 'approved' ? 'Randevu Onaylandı' : 'Randevu Reddedildi',
        description: status === 'approved'
          ? `${request.preferredDate} tarihli saat ${request.preferredTime} randevu talebiniz onaylandı.`
          : `${request.preferredDate} tarihli saat ${request.preferredTime} randevu talebiniz reddedildi.`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'patient',
        targetPatientId: request.patientId,
      };

      // If approved, create an actual appointment in the calendar
      let newAppointments = s.appointments;
      if (status === 'approved') {
        const startDate = new Date(`${request.preferredDate}T${request.preferredTime}:00`);
        const duration = 45;
        const endDate = new Date(startDate.getTime() + duration * 60000);
        const newAppt: Appointment = {
          id: `appt-ar-${Date.now()}`,
          patientId: request.patientId,
          patientName: request.patientName,
          therapistId: 't1',
          therapistName: 'Fzt.Dr. Ceydanur Congaz',
          date: startDate.toISOString(),
          endDate: endDate.toISOString(),
          duration,
          type: request.type as Appointment['type'],
          status: 'Planlandi',
          notes: request.notes || '',
        };
        newAppointments = [...s.appointments, newAppt];
      }

      // If approved, create a pending payment for the patient
      let newPayments = s.payments;
      const notifications: AppNotification[] = [notification];
      if (status === 'approved') {
        const newPayment: Payment = {
          id: `pay-ar-${Date.now()}`,
          patientId: request.patientId,
          patientName: request.patientName,
          date: new Date().toISOString(),
          amount: 500,
          method: 'Kredi Karti',
          status: 'Bekliyor',
          description: `Seans Ücreti - ${request.preferredDate} ${request.preferredTime}`,
        };
        newPayments = [...s.payments, newPayment];

        // Payment notification to patient
        notifications.push({
          id: `notif-pay-${Date.now()}`,
          type: 'appointment',
          title: 'Ödeme Bekliyor',
          description: `Randevunuz onaylandı. 500₺ seans ücreti ödemeniz beklenmektedir.`,
          date: new Date().toISOString(),
          read: false,
          targetRole: 'patient',
          targetPatientId: request.patientId,
        });
      }

      return {
        appointments: newAppointments,
        payments: newPayments,
        appointmentRequests: s.appointmentRequests.map((r) =>
          r.id === id ? { ...r, status } : r
        ),
        appNotifications: [...notifications, ...s.appNotifications],
      };
    }),

  // Exercise completions (heatmap)
  exerciseCompletions: (() => {
    const completions: ExerciseCompletion[] = [];
    const patients = ['p1', 'p2', 'p3'];
    for (const pid of patients) {
      for (let i = 0; i < 60; i++) {
        if (Math.random() > 0.35) {
          const d = new Date(Date.now() - i * 86400000);
          completions.push({ patientId: pid, date: d.toISOString().split('T')[0] });
        }
      }
    }
    return completions;
  })(),
  addExerciseCompletion: (patientId, date) =>
    set((s) => ({ exerciseCompletions: [...s.exerciseCompletions, { patientId, date }] })),

  addAppointment: (appointment) =>
    set((s) => ({ appointments: [...s.appointments, appointment] })),

  updateAppointmentStatus: (id, status) =>
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  addPatient: (patient) =>
    set((s) => ({ patients: [...s.patients, patient] })),

  toggleSessionComplete: (id) =>
    set((s) => ({
      sessions: s.sessions.map((session) =>
        session.id === id ? { ...session, completed: !session.completed } : session
      ),
    })),

  addPayment: (payment) =>
    set((s) => ({ payments: [...s.payments, payment] })),
  completePayment: (id, method) =>
    set((s) => {
      const payment = s.payments.find((p) => p.id === id);
      if (!payment) return {};

      // Notify doctor
      const notification: AppNotification = {
        id: `notif-payc-${Date.now()}`,
        type: 'appointment',
        title: 'Ödeme Alındı',
        description: `${payment.patientName} ${payment.amount}₺ ödeme yaptı. (${method === 'Kredi Karti' ? 'Kredi Kartı' : method})`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'doctor',
      };

      return {
        payments: s.payments.map((p) =>
          p.id === id ? { ...p, status: 'Odendi' as const, method, date: new Date().toISOString() } : p
        ),
        appNotifications: [notification, ...s.appNotifications],
      };
    }),

  requestCashPayment: (id) =>
    set((s) => {
      const payment = s.payments.find((p) => p.id === id);
      if (!payment) return {};

      const notification: AppNotification = {
        id: `notif-cashreq-${Date.now()}`,
        type: 'appointment',
        title: 'Nakit Ödeme Onay Bekliyor',
        description: `${payment.patientName} - ${payment.amount}₺ nakit ödeme onayınızı bekliyor.`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'doctor',
        link: '/odemeler',
      };

      const patientNotification: AppNotification = {
        id: `notif-cashreq-p-${Date.now()}`,
        type: 'appointment',
        title: 'Nakit Ödeme Talebi Gönderildi',
        description: `${payment.amount}₺ nakit ödeme talebiniz doktor onayına gönderildi.`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'patient',
        targetPatientId: payment.patientId,
      };

      return {
        payments: s.payments.map((p) =>
          p.id === id ? { ...p, status: 'NakitOnayBekliyor' as const, method: 'Nakit' as const } : p
        ),
        appNotifications: [notification, patientNotification, ...s.appNotifications],
      };
    }),

  approveCashPayment: (id) =>
    set((s) => {
      const payment = s.payments.find((p) => p.id === id);
      if (!payment) return {};

      const patientNotification: AppNotification = {
        id: `notif-cashapprove-${Date.now()}`,
        type: 'appointment',
        title: 'Nakit Ödeme Onaylandı',
        description: `${payment.amount}₺ nakit ödemeniz doktor tarafından onaylandı.`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'patient',
        targetPatientId: payment.patientId,
      };

      return {
        payments: s.payments.map((p) =>
          p.id === id ? { ...p, status: 'Odendi' as const, date: new Date().toISOString() } : p
        ),
        appNotifications: [patientNotification, ...s.appNotifications],
      };
    }),

  rejectCashPayment: (id) =>
    set((s) => {
      const payment = s.payments.find((p) => p.id === id);
      if (!payment) return {};

      const patientNotification: AppNotification = {
        id: `notif-cashreject-${Date.now()}`,
        type: 'appointment',
        title: 'Nakit Ödeme Reddedildi',
        description: `${payment.amount}₺ nakit ödemeniz onaylanmadı. Lütfen kliniğe başvurun.`,
        date: new Date().toISOString(),
        read: false,
        targetRole: 'patient',
        targetPatientId: payment.patientId,
      };

      return {
        payments: s.payments.map((p) =>
          p.id === id ? { ...p, status: 'Bekliyor' as const } : p
        ),
        appNotifications: [patientNotification, ...s.appNotifications],
      };
    }),
}));
