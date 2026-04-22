import { Patient, Therapist, Appointment, TreatmentPlan, Session, Exercise, ExerciseProgram, ProgressRecord, Payment } from './types';

export const therapists: Therapist[] = [
  { id: 't1', firstName: 'Ceydanur', lastName: 'Congaz', title: 'Fzt.Dr.', specialty: 'Nörolojik Rehabilitasyon' },
];

export const patients: Patient[] = [
  { id: 'p1', firstName: 'Ahmet', lastName: 'Yılmaz', phone: '0532 111 2233', email: 'ahmet@email.com', birthDate: '1985-03-15', gender: 'Erkek', diagnosis: 'Bel Fıtığı', notes: 'L4-L5 disk hernisi', createdAt: '2024-01-10' },
  { id: 'p2', firstName: 'Fatma', lastName: 'Öztürk', phone: '0533 222 3344', email: 'fatma@email.com', birthDate: '1990-07-22', gender: 'Kadin', diagnosis: 'Omuz Sıkışma Sendromu', notes: 'Sağ omuz', createdAt: '2024-02-05' },
  { id: 'p3', firstName: 'Mustafa', lastName: 'Çelik', phone: '0534 333 4455', email: 'mustafa@email.com', birthDate: '1978-11-03', gender: 'Erkek', diagnosis: 'Diz Artroskopisi Sonrası', notes: 'Sol diz, menisküs tamiri', createdAt: '2024-01-20' },
  { id: 'p4', firstName: 'Zeynep', lastName: 'Arslan', phone: '0535 444 5566', email: 'zeynep@email.com', birthDate: '1995-05-18', gender: 'Kadin', diagnosis: 'Boyun Fıtığı', notes: 'C5-C6 disk hernisi', createdAt: '2024-03-01' },
  { id: 'p5', firstName: 'Ali', lastName: 'Şahin', phone: '0536 555 6677', email: 'ali@email.com', birthDate: '1982-09-30', gender: 'Erkek', diagnosis: 'Frozen Shoulder', notes: 'Sol omuz, 3 aydır', createdAt: '2024-02-15' },
  { id: 'p6', firstName: 'Aysel', lastName: 'Doğan', phone: '0537 666 7788', email: 'aysel@email.com', birthDate: '1988-12-25', gender: 'Kadin', diagnosis: 'Karpal Tünel Sendromu', notes: 'Bilateral', createdAt: '2024-03-10' },
  { id: 'p7', firstName: 'Hasan', lastName: 'Kılıç', phone: '0538 777 8899', email: 'hasan@email.com', birthDate: '1970-06-14', gender: 'Erkek', diagnosis: 'Total Diz Protezi', notes: 'Sağ diz, postop 6. hafta', createdAt: '2024-01-05' },
  { id: 'p8', firstName: 'Merve', lastName: 'Aydın', phone: '0539 888 9900', email: 'merve@email.com', birthDate: '1992-02-08', gender: 'Kadin', diagnosis: 'Skolyoz', notes: 'Torakal bölge, 15 derece', createdAt: '2024-02-20' },
  { id: 'p9', firstName: 'Emre', lastName: 'Yıldız', phone: '0531 999 0011', email: 'emre@email.com', birthDate: '2000-04-12', gender: 'Erkek', diagnosis: 'ACL Rekonstrüksiyonu', notes: 'Sağ diz, postop 3. ay', createdAt: '2024-03-05' },
  { id: 'p10', firstName: 'Seda', lastName: 'Kara', phone: '0532 000 1122', email: 'seda@email.com', birthDate: '1975-08-20', gender: 'Kadin', diagnosis: 'Fibromiyalji', notes: 'Yaygın ağrı', createdAt: '2024-01-15' },
];

function today(hour: number, minute: number = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function todayEnd(hour: number, minute: number = 0, durationMin: number = 45): string {
  const d = new Date();
  d.setHours(hour, minute + durationMin, 0, 0);
  return d.toISOString();
}

function dateAt(daysOffset: number, hour: number, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateAtEnd(daysOffset: number, hour: number, minute: number = 0, dur: number = 45): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute + dur, 0, 0);
  return d.toISOString();
}

export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: today(9), endDate: todayEnd(9), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: 'Manuel terapi + TENS' },
  { id: 'a2', patientId: 'p2', patientName: 'Fatma Öztürk', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: today(10), endDate: todayEnd(10), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: 'Ultrason + egzersiz' },
  { id: 'a3', patientId: 'p3', patientName: 'Mustafa Çelik', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: today(11), endDate: todayEnd(11), duration: 45, type: 'Kontrol', status: 'Tamamlandi', notes: 'Kontrol muayenesi' },
  { id: 'a4', patientId: 'p4', patientName: 'Zeynep Arslan', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: today(13), endDate: todayEnd(13), duration: 45, type: 'Ilk Muayene', status: 'Planlandi', notes: 'İlk değerlendirme' },
  { id: 'a5', patientId: 'p5', patientName: 'Ali Şahin', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: today(14), endDate: todayEnd(14), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: 'Mobilizasyon' },
  { id: 'a6', patientId: 'p6', patientName: 'Aysel Doğan', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: today(15), endDate: todayEnd(15), duration: 30, type: 'Tedavi Seansi', status: 'Gelmedi', notes: '' },
  { id: 'a7', patientId: 'p7', patientName: 'Hasan Kılıç', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-1, 9), endDate: dateAtEnd(-1, 9), duration: 45, type: 'Tedavi Seansi', status: 'Tamamlandi', notes: 'Güçlendirme' },
  { id: 'a8', patientId: 'p8', patientName: 'Merve Aydın', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-1, 10), endDate: dateAtEnd(-1, 10), duration: 45, type: 'Tedavi Seansi', status: 'Tamamlandi', notes: 'Postüral egzersiz' },
  { id: 'a9', patientId: 'p9', patientName: 'Emre Yıldız', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-1, 14), endDate: dateAtEnd(-1, 14), duration: 45, type: 'Tedavi Seansi', status: 'Iptal', notes: 'Hasta tarafından iptal' },
  { id: 'a10', patientId: 'p10', patientName: 'Seda Kara', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-2, 11), endDate: dateAtEnd(-2, 11), duration: 45, type: 'Kontrol', status: 'Tamamlandi', notes: '' },
  { id: 'a19', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-14, 9), endDate: dateAtEnd(-14, 9), duration: 45, type: 'Tedavi Seansi', status: 'Tamamlandi', notes: 'Manuel terapi + TENS uygulandı' },
  { id: 'a20', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-12, 9), endDate: dateAtEnd(-12, 9), duration: 45, type: 'Tedavi Seansi', status: 'Tamamlandi', notes: 'Ultrason + egzersiz' },
  { id: 'a21', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(-10, 9), endDate: dateAtEnd(-10, 9), duration: 45, type: 'Tedavi Seansi', status: 'Tamamlandi', notes: 'Kor stabilite egzersizleri' },
  { id: 'a11', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(1, 9), endDate: dateAtEnd(1, 9), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a12', patientId: 'p3', patientName: 'Mustafa Çelik', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(1, 11), endDate: dateAtEnd(1, 11), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a13', patientId: 'p5', patientName: 'Ali Şahin', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(2, 10), endDate: dateAtEnd(2, 10), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a14', patientId: 'p7', patientName: 'Hasan Kılıç', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(2, 14), endDate: dateAtEnd(2, 14), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a15', patientId: 'p2', patientName: 'Fatma Öztürk', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(3, 9), endDate: dateAtEnd(3, 9), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a16', patientId: 'p4', patientName: 'Zeynep Arslan', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(3, 13), endDate: dateAtEnd(3, 13), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a17', patientId: 'p8', patientName: 'Merve Aydın', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(4, 10), endDate: dateAtEnd(4, 10), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a18', patientId: 'p9', patientName: 'Emre Yıldız', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(5, 11), endDate: dateAtEnd(5, 11), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a19', patientId: 'p10', patientName: 'Seda Kara', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(5, 15), endDate: dateAtEnd(5, 15), duration: 30, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
  { id: 'a20', patientId: 'p6', patientName: 'Aysel Doğan', therapistId: 't1', therapistName: 'Ceydanur Congaz', date: dateAt(6, 10), endDate: dateAtEnd(6, 10), duration: 45, type: 'Tedavi Seansi', status: 'Planlandi', notes: '' },
];

export const treatmentPlans: TreatmentPlan[] = [
  { id: 'tp1', patientId: 'p1', patientName: 'Ahmet Yılmaz', diagnosis: 'Bel Fıtığı Rehabilitasyonu', description: 'L4-L5 disk hernisi tedavi programı', startDate: '2024-01-15', endDate: '2024-04-15', totalSessions: 10, completedSessions: 7, status: 'Aktif', goals: ['Ağrı azaltma', 'Kor stabilitesi', 'Günlük aktivitelere dönüş'], modalities: ['Manuel Terapi', 'TENS', 'Ultrason', 'Egzersiz'] },
  { id: 'tp2', patientId: 'p2', patientName: 'Fatma Öztürk', diagnosis: 'Omuz Sıkışma Sendromu', description: 'Sağ omuz rehabilitasyon programı', startDate: '2024-02-10', endDate: '2024-05-10', totalSessions: 12, completedSessions: 5, status: 'Aktif', goals: ['Ağrı kontrolü', 'ROM artışı', 'Güçlendirme'], modalities: ['Manuel Terapi', 'Buz', 'Egzersiz'] },
  { id: 'tp3', patientId: 'p3', patientName: 'Mustafa Çelik', diagnosis: 'Diz Artroskopisi Rehabilitasyonu', description: 'Sol diz menisküs tamiri sonrası', startDate: '2024-01-25', endDate: '2024-04-25', totalSessions: 15, completedSessions: 12, status: 'Aktif', goals: ['Tam ROM', 'Güç kazanımı', 'Spora dönüş'], modalities: ['Egzersiz', 'Elektroterapi', 'Kriyoterapi'] },
  { id: 'tp4', patientId: 'p7', patientName: 'Hasan Kılıç', diagnosis: 'Total Diz Protezi Rehabilitasyonu', description: 'Sağ diz TDP sonrası rehabilitasyon', startDate: '2024-01-10', endDate: '2024-04-10', totalSessions: 20, completedSessions: 18, status: 'Aktif', goals: ['120 derece fleksiyon', 'Bağımsız yürüyüş', 'Merdiven çıkma'], modalities: ['Egzersiz', 'Manuel Terapi', 'Hidroterapi'] },
  { id: 'tp5', patientId: 'p9', patientName: 'Emre Yıldız', diagnosis: 'ACL Rekonstrüksiyonu Rehabilitasyonu', description: 'Sağ diz ACL rekonstrüksiyonu sonrası', startDate: '2024-03-10', endDate: '2024-09-10', totalSessions: 24, completedSessions: 4, status: 'Aktif', goals: ['Tam ROM', 'Kuadriseps gücü', 'Spora dönüş'], modalities: ['Egzersiz', 'Elektroterapi', 'Propriosepsiyon'] },
];

export const sessions: Session[] = [
  { id: 's1', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp1', date: dateAt(-14, 9), duration: 45, completed: true, notes: 'Manuel terapi + TENS uygulandı', applications: ['Manuel Terapi', 'TENS'] },
  { id: 's2', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp1', date: dateAt(-12, 9), duration: 45, completed: true, notes: 'Ultrason + egzersiz', applications: ['Ultrason', 'Egzersiz'] },
  { id: 's3', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp1', date: dateAt(-10, 9), duration: 45, completed: true, notes: 'Kor stabilite egzersizleri', applications: ['Egzersiz'] },
  { id: 's4', patientId: 'p2', patientName: 'Fatma Öztürk', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp2', date: dateAt(-7, 10), duration: 45, completed: true, notes: 'Omuz mobilizasyonu', applications: ['Manuel Terapi', 'Buz'] },
  { id: 's5', patientId: 'p2', patientName: 'Fatma Öztürk', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp2', date: dateAt(-5, 10), duration: 45, completed: true, notes: 'Güçlendirme başlandı', applications: ['Egzersiz', 'Buz'] },
  { id: 's6', patientId: 'p3', patientName: 'Mustafa Çelik', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp3', date: dateAt(-3, 11), duration: 45, completed: true, notes: 'ROM artışı sağlandı', applications: ['Egzersiz', 'Elektroterapi'] },
  { id: 's7', patientId: 'p7', patientName: 'Hasan Kılıç', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp4', date: dateAt(-1, 9), duration: 45, completed: true, notes: 'Merdiven egzersizi', applications: ['Egzersiz', 'Manuel Terapi'] },
  { id: 's8', patientId: 'p9', patientName: 'Emre Yıldız', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp5', date: dateAt(-2, 14), duration: 45, completed: true, notes: 'Propriosepsiyon egzersizleri', applications: ['Egzersiz', 'Propriosepsiyon'] },
  { id: 's9', patientId: 'p1', patientName: 'Ahmet Yılmaz', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp1', date: today(9), duration: 45, completed: false, notes: '', applications: ['Manuel Terapi', 'TENS'] },
  { id: 's10', patientId: 'p2', patientName: 'Fatma Öztürk', therapistId: 't1', therapistName: 'Ceydanur Congaz', treatmentPlanId: 'tp2', date: today(10), duration: 45, completed: false, notes: '', applications: ['Ultrason', 'Egzersiz'] },
];

export const exercises: Exercise[] = [
  { id: 'e1', name: 'Hamstring Germe', description: 'Sırt üstü yatarak hamstring germe egzersizi', category: 'Bel', sets: 3, reps: 10, videoUrl: 'https://www.youtube.com/embed/FDwpEdxZ4H4', difficulty: 'Kolay' },
  { id: 'e2', name: 'Kuadriseps Güçlenme', description: 'Oturarak kuadriseps kuvvetlendirme', category: 'Diz', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/YyvSfVjQeL0', difficulty: 'Orta' },
  { id: 'e3', name: 'Omuz Pendulum', description: 'Öne eğilip kolu sarkıtarak daire çizme', category: 'Omuz', sets: 3, reps: 15, videoUrl: 'https://www.youtube.com/embed/W5GnsBIqmak', difficulty: 'Kolay' },
  { id: 'e4', name: 'Bird Dog', description: 'Emekleme pozisyonunda karşıt kol-bacak kaldırma', category: 'Bel', sets: 3, reps: 10, videoUrl: 'https://www.youtube.com/embed/wiFNA3sqjCA', difficulty: 'Orta' },
  { id: 'e5', name: 'Wall Slide', description: 'Duvara yaslanarak kayma egzersizi', category: 'Omuz', sets: 3, reps: 10, videoUrl: 'https://www.youtube.com/embed/d6V2Exzb324', difficulty: 'Kolay' },
  { id: 'e6', name: 'Plank', description: 'Ön kol desteği pozisyonunda durma', category: 'Bel', sets: 3, reps: 1, videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c', difficulty: 'Zor' },
  { id: 'e7', name: 'Diz Fleksiyonu', description: 'Yüzüstü yatarak diz bükme', category: 'Diz', sets: 3, reps: 15, videoUrl: 'https://www.youtube.com/embed/OvRFqMuGsHI', difficulty: 'Kolay' },
  { id: 'e8', name: 'Boyun Rotasyonu', description: 'Oturarak boyun sağa-sola çevirme', category: 'Boyun', sets: 3, reps: 10, videoUrl: 'https://www.youtube.com/embed/wQylqaCl8Zo', difficulty: 'Kolay' },
  { id: 'e9', name: 'Squat', description: 'Vücut ağırlığı ile squat', category: 'Diz', sets: 3, reps: 10, videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U', difficulty: 'Orta' },
  { id: 'e10', name: 'Dış Rotasyon', description: 'Elastik bant ile omuz dış rotasyonu', category: 'Omuz', sets: 3, reps: 12, videoUrl: 'https://www.youtube.com/embed/jd0TC7kUfKc', difficulty: 'Orta' },
];

export const exercisePrograms: ExerciseProgram[] = [
  {
    id: 'ep1', patientId: 'p1', patientName: 'Ahmet Yılmaz', treatmentPlanId: 'tp1', startDate: '2024-01-20', frequency: 'Günde 2 kez',
    exercises: [
      { exerciseId: 'e1', sets: 3, reps: 10, notes: 'Ağrı hissedilirse durulacak' },
      { exerciseId: 'e4', sets: 3, reps: 10, notes: '' },
      { exerciseId: 'e6', sets: 3, reps: 1, notes: '30 saniye tutma' },
    ],
  },
  {
    id: 'ep2', patientId: 'p2', patientName: 'Fatma Öztürk', treatmentPlanId: 'tp2', startDate: '2024-02-15', frequency: 'Günde 1 kez',
    exercises: [
      { exerciseId: 'e3', sets: 3, reps: 15, notes: '' },
      { exerciseId: 'e5', sets: 3, reps: 10, notes: '' },
      { exerciseId: 'e10', sets: 3, reps: 12, notes: 'Hafif bant kullanılacak' },
    ],
  },
  {
    id: 'ep3', patientId: 'p3', patientName: 'Mustafa Çelik', treatmentPlanId: 'tp3', startDate: '2024-02-01', frequency: 'Günde 2 kez',
    exercises: [
      { exerciseId: 'e2', sets: 3, reps: 12, notes: '' },
      { exerciseId: 'e7', sets: 3, reps: 15, notes: '' },
      { exerciseId: 'e9', sets: 3, reps: 10, notes: 'Ağrı olmadığı sürece' },
    ],
  },
];

export const progressRecords: ProgressRecord[] = [
  // Patient p1 - Ahmet Yılmaz
  { id: 'pr1', patientId: 'p1', date: dateAt(-28, 9), rangeOfMotion: 30, notes: '' },
  { id: 'pr2', patientId: 'p1', date: dateAt(-24, 9), rangeOfMotion: 35, notes: '' },
  { id: 'pr3', patientId: 'p1', date: dateAt(-20, 9), rangeOfMotion: 40, notes: '' },
  { id: 'pr4', patientId: 'p1', date: dateAt(-16, 9), rangeOfMotion: 50, notes: '' },
  { id: 'pr5', patientId: 'p1', date: dateAt(-12, 9), rangeOfMotion: 55, notes: '' },
  { id: 'pr6', patientId: 'p1', date: dateAt(-8, 9), rangeOfMotion: 60, notes: '' },
  { id: 'pr7', patientId: 'p1', date: dateAt(-4, 9), rangeOfMotion: 65, notes: '' },
  { id: 'pr8', patientId: 'p1', date: dateAt(0, 9), rangeOfMotion: 70, notes: '' },
  // Patient p2 - Fatma Öztürk
  { id: 'pr9', patientId: 'p2', date: dateAt(-21, 10), rangeOfMotion: 90, notes: '' },
  { id: 'pr10', patientId: 'p2', date: dateAt(-14, 10), rangeOfMotion: 110, notes: '' },
  { id: 'pr11', patientId: 'p2', date: dateAt(-7, 10), rangeOfMotion: 130, notes: '' },
  { id: 'pr12', patientId: 'p2', date: dateAt(0, 10), rangeOfMotion: 145, notes: '' },
  // Patient p3 - Mustafa Çelik
  { id: 'pr13', patientId: 'p3', date: dateAt(-21, 11), rangeOfMotion: 60, notes: '' },
  { id: 'pr14', patientId: 'p3', date: dateAt(-14, 11), rangeOfMotion: 80, notes: '' },
  { id: 'pr15', patientId: 'p3', date: dateAt(-7, 11), rangeOfMotion: 100, notes: '' },
  { id: 'pr16', patientId: 'p3', date: dateAt(0, 11), rangeOfMotion: 120, notes: '' },
  // Patient p4 - Zeynep Arslan
  { id: 'pr17', patientId: 'p4', date: dateAt(-25, 10), rangeOfMotion: 40, notes: '' },
  { id: 'pr18', patientId: 'p4', date: dateAt(-18, 10), rangeOfMotion: 50, notes: '' },
  { id: 'pr19', patientId: 'p4', date: dateAt(-11, 10), rangeOfMotion: 60, notes: '' },
  { id: 'pr20', patientId: 'p4', date: dateAt(-4, 10), rangeOfMotion: 70, notes: '' },
  // Patient p5 - Ali Şahin
  { id: 'pr21', patientId: 'p5', date: dateAt(-30, 9), rangeOfMotion: 20, notes: '' },
  { id: 'pr22', patientId: 'p5', date: dateAt(-22, 9), rangeOfMotion: 30, notes: '' },
  { id: 'pr23', patientId: 'p5', date: dateAt(-14, 9), rangeOfMotion: 45, notes: '' },
  { id: 'pr24', patientId: 'p5', date: dateAt(-7, 9), rangeOfMotion: 55, notes: '' },
  { id: 'pr25', patientId: 'p5', date: dateAt(0, 9), rangeOfMotion: 65, notes: '' },
  // Patient p6 - Aysel Doğan
  { id: 'pr26', patientId: 'p6', date: dateAt(-20, 14), rangeOfMotion: 70, notes: '' },
  { id: 'pr27', patientId: 'p6', date: dateAt(-13, 14), rangeOfMotion: 80, notes: '' },
  { id: 'pr28', patientId: 'p6', date: dateAt(-6, 14), rangeOfMotion: 90, notes: '' },
  { id: 'pr29', patientId: 'p6', date: dateAt(0, 14), rangeOfMotion: 95, notes: '' },
  // Patient p7 - Hasan Kılıç
  { id: 'pr30', patientId: 'p7', date: dateAt(-28, 10), rangeOfMotion: 25, notes: '' },
  { id: 'pr31', patientId: 'p7', date: dateAt(-21, 10), rangeOfMotion: 40, notes: '' },
  { id: 'pr32', patientId: 'p7', date: dateAt(-14, 10), rangeOfMotion: 60, notes: '' },
  { id: 'pr33', patientId: 'p7', date: dateAt(-7, 10), rangeOfMotion: 75, notes: '' },
  { id: 'pr34', patientId: 'p7', date: dateAt(0, 10), rangeOfMotion: 90, notes: '' },
  // Patient p8 - Merve Aydın
  { id: 'pr35', patientId: 'p8', date: dateAt(-18, 11), rangeOfMotion: 50, notes: '' },
  { id: 'pr36', patientId: 'p8', date: dateAt(-11, 11), rangeOfMotion: 60, notes: '' },
  { id: 'pr37', patientId: 'p8', date: dateAt(-4, 11), rangeOfMotion: 70, notes: '' },
  { id: 'pr38', patientId: 'p8', date: dateAt(0, 11), rangeOfMotion: 75, notes: '' },
  // Patient p9 - Emre Yıldız
  { id: 'pr39', patientId: 'p9', date: dateAt(-24, 9), rangeOfMotion: 35, notes: '' },
  { id: 'pr40', patientId: 'p9', date: dateAt(-16, 9), rangeOfMotion: 55, notes: '' },
  { id: 'pr41', patientId: 'p9', date: dateAt(-8, 9), rangeOfMotion: 70, notes: '' },
  { id: 'pr42', patientId: 'p9', date: dateAt(0, 9), rangeOfMotion: 85, notes: '' },
  // Patient p10 - Seda Kara
  { id: 'pr43', patientId: 'p10', date: dateAt(-26, 10), rangeOfMotion: 45, notes: '' },
  { id: 'pr44', patientId: 'p10', date: dateAt(-19, 10), rangeOfMotion: 50, notes: '' },
  { id: 'pr45', patientId: 'p10', date: dateAt(-12, 10), rangeOfMotion: 55, notes: '' },
  { id: 'pr46', patientId: 'p10', date: dateAt(-5, 10), rangeOfMotion: 60, notes: '' },
  { id: 'pr47', patientId: 'p10', date: dateAt(0, 10), rangeOfMotion: 65, notes: '' },
];

export const payments: Payment[] = [
  { id: 'pay1', patientId: 'p1', patientName: 'Ahmet Yılmaz', date: dateAt(-14, 10), amount: 1500, method: 'Kredi Karti', status: 'Odendi', description: 'Tedavi paketi - 5 seans' },
  { id: 'pay11', patientId: 'p1', patientName: 'Ahmet Yılmaz', date: dateAt(-20, 10), amount: 750, method: 'Kredi Karti', status: 'Bekliyor', description: 'Ek seans ücreti (3 seans)' },
  { id: 'pay12', patientId: 'p1', patientName: 'Ahmet Yılmaz', date: dateAt(-8, 14), amount: 500, method: 'Kredi Karti', status: 'Bekliyor', description: 'Kontrol muayenesi' },
  { id: 'pay2', patientId: 'p2', patientName: 'Fatma Öztürk', date: dateAt(-7, 11), amount: 800, method: 'Nakit', status: 'Odendi', description: 'Seans ücreti' },
  { id: 'pay3', patientId: 'p3', patientName: 'Mustafa Çelik', date: dateAt(-5, 14), amount: 2000, method: 'Havale', status: 'Odendi', description: 'Tedavi paketi - 10 seans' },
  { id: 'pay4', patientId: 'p4', patientName: 'Zeynep Arslan', date: dateAt(-3, 9), amount: 500, method: 'Kredi Karti', status: 'Bekliyor', description: 'İlk muayene' },
  { id: 'pay5', patientId: 'p5', patientName: 'Ali Şahin', date: dateAt(-2, 10), amount: 1200, method: 'Nakit', status: 'Odendi', description: 'Tedavi paketi - 4 seans' },
  { id: 'pay6', patientId: 'p7', patientName: 'Hasan Kılıç', date: dateAt(-1, 15), amount: 3000, method: 'Havale', status: 'Odendi', description: 'Tedavi paketi - 20 seans' },
  { id: 'pay7', patientId: 'p8', patientName: 'Merve Aydın', date: dateAt(0, 9), amount: 600, method: 'Kredi Karti', status: 'Bekliyor', description: 'Seans ücreti' },
  { id: 'pay8', patientId: 'p9', patientName: 'Emre Yıldız', date: dateAt(0, 10), amount: 2500, method: 'Kredi Karti', status: 'Odendi', description: 'Tedavi paketi - 12 seans' },
  { id: 'pay9', patientId: 'p10', patientName: 'Seda Kara', date: dateAt(-10, 11), amount: 900, method: 'Nakit', status: 'Odendi', description: 'Seans ücreti' },
  { id: 'pay10', patientId: 'p6', patientName: 'Aysel Doğan', date: dateAt(-8, 14), amount: 400, method: 'Kredi Karti', status: 'Iptal', description: 'İptal edilen seans' },
];

// Helper functions
export function getPatientById(id: string): Patient | undefined {
  return patients.find(p => p.id === id);
}

export function getAppointmentsByPatientId(id: string): Appointment[] {
  return appointments.filter(a => a.patientId === id);
}

export function getTreatmentPlansByPatientId(id: string): TreatmentPlan[] {
  return treatmentPlans.filter(tp => tp.patientId === id);
}

export function getSessionsByPatientId(id: string): Session[] {
  return sessions.filter(s => s.patientId === id);
}

export function getProgressByPatientId(id: string): ProgressRecord[] {
  return progressRecords.filter(pr => pr.patientId === id);
}

export function getPaymentsByPatientId(id: string): Payment[] {
  return payments.filter(p => p.patientId === id);
}

export function getTodayAppointments(): Appointment[] {
  const today = new Date();
  return appointments.filter(a => {
    const d = new Date(a.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(e => e.id === id);
}

export function getExerciseProgramByPatientId(id: string): ExerciseProgram | undefined {
  return exercisePrograms.find(ep => ep.patientId === id);
}
