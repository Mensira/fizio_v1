import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Activity,
  Dumbbell,
  TrendingUp,
  CreditCard,
  BarChart3,
  Settings,
  FolderOpen,
  BookOpen,
  ClipboardCheck,
  UserCircle,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Randevular', href: '/randevular', icon: Calendar },
  { label: 'Hastalar', href: '/hastalar', icon: Users },
  { label: 'Tedavi Planları', href: '/tedavi-planlari', icon: ClipboardList },
  { label: 'Seanslar', href: '/seanslar', icon: Activity },
  { label: 'Egzersiz Programları', href: '/egzersiz-programlari', icon: Dumbbell },
  { label: 'İlerleme Takibi', href: '/ilerleme', icon: TrendingUp },
  { label: 'Ödemeler', href: '/odemeler', icon: CreditCard },
  { label: 'Raporlar', href: '/raporlar', icon: BarChart3 },
  { label: 'Ayarlar', href: '/ayarlar', icon: Settings },
];


// Patient-only navigation items (shown only in patient portal)
export const PATIENT_NAV_ITEMS = [
  { label: 'Belgelerim', href: '/belgelerim', icon: FolderOpen },
  { label: 'Bilgilendirme', href: '/bilgilendirme', icon: BookOpen },
  { label: 'Seans Özetleri', href: '/seans-ozetleri', icon: ClipboardCheck },
  { label: 'Profilim', href: '/profilim', icon: UserCircle },
];

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  Planlandi: '#2F80ED',
  Tamamlandi: '#27AE60',
  Iptal: '#F39C12',
  Gelmedi: '#E74C3C',
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  Planlandi: 'Planlandı',
  Tamamlandi: 'Tamamlandı',
  Iptal: 'İptal Edildi',
  Gelmedi: 'Gelmedi',
};

export const MOTIVATIONAL_QUOTES = [
  'Hareket en iyi ilaçtır. - Hippokrates',
  'Düzenli egzersiz kas ağrılarını azaltabilir ve yaşam kalitesini artırır.',
  'Her adım iyileşmeye yaklaştıran bir adımdır. Pes etmeyin.',
  'Bedeninize iyi bakın, yaşamak için tek yeriniz orası. - Jim Rohn',
  'Sağlık en büyük zenginliktir. - Vergilius',
  'Bugünkü egzersiz, yarının sağlığı için yapılan en iyi yatırımdır.',
  'Acıya rağmen hareket, iyileşmenin anahtarıdır.',
  'Küçük adımlar büyük değişimler yaratır. Bugünden başlayın.',
  'Sabırla yapılan tedavi kalıcı sonuçlar verir.',
  'Güçlü bir beden, güçlü bir zihinle başlar.',
  'Vücudunuz mucizevi bir iyileşme kapasitesine sahiptir.',
  'Rehabilitasyon bir maraton, sprint değil. Sabırlı olun.',
  'En iyi doktor kendi bedeninizdir, sadece ona fırsat verin.',
  'Movement is medicine. - Hareket ilaçtır.',
  'Her gün yapılan küçük egzersizler, büyük iyileşmeler getirir.',
];

export const WATER_TIPS = [
  'Su, kaslarınıza oksijen taşır ve iyileşmeyi hızlandırır.',
  'Yeterli su içmek eklem ağrılarını azaltır ve esnekliği artırır.',
  'Susuz kalan kaslar daha kolay krampa girer. Su için, kaslarınızı koruyun.',
  'Vücudunuzun %60\'ı sudur. Her yudum iyileşmenize katkı sağlar.',
  'Su içmek iltihabı azaltır ve doku onarımını destekler.',
  'Egzersiz öncesi su içmek performansınızı %20 artırabilir.',
  'Bir bardak su, eklem kıkırdaklarınızın en iyi dostudur.',
  'Dehidrasyon ağrı eşiğinizi düşürür. Su için, ağrınızı azaltın.',
  'Düzenli su içmek kas yorgunluğunu önler ve toparlanmayı hızlandırır.',
  'Su, vücudunuzun doğal ağrı kesicisidir.',
  'Sabah ilk iş bir bardak su içmek metabolizmanızı uyandırır.',
  'Su içmek kan dolaşımını artırır, hasarlı dokulara besin taşır.',
];
