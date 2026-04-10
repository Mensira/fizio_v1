'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  BookOpen, Clock, ChevronDown, ChevronUp, HelpCircle,
  AlertTriangle, CheckCircle2, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  relatedDiagnoses: string[];
  readTime: number;
  date: string;
  author: string;
  tips: string[];
  warnings: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const ARTICLES: Article[] = [
  {
    id: 'art1', title: 'Bel Fıtığında Yapılması ve Yapılmaması Gerekenler',
    category: 'Bel', relatedDiagnoses: ['Bel Fıtığı'], readTime: 5, date: '2024-01-20', author: 'Fzt.Dr. Ceydanur Congaz',
    content: 'Bel fıtığı, omurlar arasındaki disklerin yırtılması veya dışarı çıkması sonucu oluşur. Tedavi sürecinde doğru hareketler yapmak iyileşmeyi hızlandırırken, yanlış hareketler durumu kötüleştirebilir. Düzenli egzersiz, doğru postür ve yaşam tarzı değişiklikleri tedavinin önemli parçalarıdır.',
    tips: [
      'Ağır kaldırmaktan kaçının, kaldırmanız gerekiyorsa dizlerinizi bükün',
      'Uzun süre oturmayın, her 30 dakikada kalkıp yürüyün',
      'Uyurken dizlerinizin arasına yastık koyun',
      'Düzenli yürüyüş yapın (günde 20-30 dakika)',
      'Verilen egzersizleri aksatmadan yapın',
      'Sıcak uygulama ağrıyı rahatlatabilir',
    ],
    warnings: [
      'Öne eğilip ağırlık kaldırmayın',
      'Ani ve sert hareketlerden kaçının',
      'Yumuşak koltuk/yatak kullanmayın',
      'Bacaklarda uyuşma veya güçsüzlük olursa hemen doktorunuza bildirin',
    ],
  },
  {
    id: 'art2', title: 'Omuz Sıkışma Sendromu: Tedavi Süreci',
    category: 'Omuz', relatedDiagnoses: ['Omuz Sıkışma Sendromu', 'Frozen Shoulder'], readTime: 4, date: '2024-02-15', author: 'Fzt.Dr. Ceydanur Congaz',
    content: 'Omuz sıkışma sendromu, kol kaldırıldığında omuz tendonlarının sıkışması sonucu oluşan ağrılı bir durumdur. Fizik tedavi ile büyük çoğunluğu iyileşir. Tedavide amaç ağrıyı azaltmak, hareket açıklığını artırmak ve omuz kaslarını güçlendirmektir.',
    tips: [
      'Buz uygulaması günde 2-3 kez 15 dakika yapın',
      'Omuz seviyesinin üstünde çalışmaktan kaçının',
      'Pendulum egzersizleri ile başlayın',
      'Uyurken ağrılı omuz üzerine yatmayın',
      'Duş altında ılık su ile hafif omuz rotasyonu yapın',
    ],
    warnings: [
      'Ağrılı hareket aralığında zorlamayın',
      'Ağır çanta taşımayın',
      'Ani fırlatma hareketlerinden kaçının',
    ],
  },
  {
    id: 'art3', title: 'Diz Ameliyatı Sonrası Rehabilitasyon',
    category: 'Diz', relatedDiagnoses: ['Diz Artroskopisi Sonrası', 'ACL Rekonstrüksiyonu', 'Total Diz Protezi'], readTime: 6, date: '2024-01-25', author: 'Fzt.Dr. Ceydanur Congaz',
    content: 'Diz ameliyatı sonrası rehabilitasyon, tam iyileşme için kritik öneme sahiptir. Rehabilitasyon programı genellikle 3-6 ay sürer ve aşamalı olarak ilerler. İlk haftalarda ağrı ve şişlik kontrolü, sonrasında hareket açıklığı ve güçlendirme egzersizleri uygulanır.',
    tips: [
      'Ameliyat sonrası ilk günlerde buz uygulayın ve bacağı yüksekte tutun',
      'Fizik tedavi seanslarını asla atlamayın',
      'Evde verilen egzersizleri düzenli yapın',
      'Yürüme yardımcısı kullanımını doktorunuz söyleyene kadar bırakmayın',
      'Protein ve C vitamini açısından zengin beslenin',
    ],
    warnings: [
      'Doktor izni olmadan koşmayın veya zıplamayın',
      'Diz üzerine çökmeyin',
      'Şişlik veya kızarıklık artarsa hemen doktora başvurun',
      'Ağrı kesicileri doktor tavsiyesi dışında kullanmayın',
    ],
  },
  {
    id: 'art4', title: 'Boyun Fıtığında Günlük Yaşam Önerileri',
    category: 'Boyun', relatedDiagnoses: ['Boyun Fıtığı'], readTime: 4, date: '2024-03-05', author: 'Fzt.Dr. Ceydanur Congaz',
    content: 'Boyun fıtığı tedavisinde günlük yaşam düzenlemesi büyük önem taşır. Özellikle uzun süre bilgisayar başında çalışanlar ve telefon kullananlar risk grubundadır. Doğru ergonomi ve düzenli egzersizlerle semptomlar önemli ölçüde azaltılabilir.',
    tips: [
      'Bilgisayar ekranı göz hizasında olsun',
      'Telefona bakarken boynu öne eğmeyin',
      'Boyun germe egzersizlerini her gün yapın',
      'Ortopedik yastık kullanın',
      'Her 45 dakikada boyun egzersizi yapın',
    ],
    warnings: [
      'Boynu hızla çevirmeyin',
      'Ağır başlık veya kask takmayın',
      'Kolda uyuşma olursa egzersizi durdurun',
    ],
  },
  {
    id: 'art5', title: 'Egzersiz Öncesi ve Sonrası Doğru Beslenme',
    category: 'Genel', relatedDiagnoses: [], readTime: 3, date: '2024-02-28', author: 'Fzt.Dr. Ceydanur Congaz',
    content: 'Fizik tedavi egzersizlerinden en iyi sonucu almak için doğru beslenme çok önemlidir. Egzersiz öncesi enerji, sonrası ise toparlanma için doğru besinleri tüketmek iyileşme sürecini destekler.',
    tips: [
      'Egzersizden 1-2 saat önce hafif bir öğün yiyin',
      'Bol su için (egzersiz öncesi, sırası ve sonrası)',
      'Protein ağırlıklı beslenin (yumurta, tavuk, balık)',
      'Antienflamatuar gıdalar tüketin (zerdeçal, zencefil, omega-3)',
      'C vitamini (portakal, kivi) doku onarımını destekler',
    ],
    warnings: [
      'Egzersiz öncesi ağır yemek yemeyin',
      'Aşırı kafein tüketiminden kaçının',
      'İşlenmiş gıda ve şeker tüketimini azaltın',
    ],
  },
  {
    id: 'art6', title: 'Fibromiyalji ile Yaşam: Pratik Öneriler',
    category: 'Genel', relatedDiagnoses: ['Fibromiyalji'], readTime: 5, date: '2024-03-10', author: 'Fzt.Dr. Ceydanur Congaz',
    content: 'Fibromiyalji, yaygın kas ağrısı, yorgunluk ve uyku bozukluğu ile karakterize kronik bir durumdur. Tedavide egzersiz, stres yönetimi ve uyku düzeni büyük önem taşır. Düzenli fizik tedavi ve yaşam tarzı değişiklikleri ile semptomlar kontrol altına alınabilir.',
    tips: [
      'Düzenli ve hafif egzersiz yapın (yüzme, yürüyüş)',
      'Uyku düzeninize dikkat edin (her gün aynı saatte yatın/kalkın)',
      'Stres yönetimi tekniklerini öğrenin (nefes egzersizleri, meditasyon)',
      'Sıcak banyo veya duş ağrıları hafifletebilir',
      'Günlük aktivitelerinizi planlayın, aşırı yorulmayın',
    ],
    warnings: [
      'Aşırı fiziksel aktiviteden kaçının',
      'Stresli ortamlardan uzak durmaya çalışın',
      'İlaçlarınızı doktor bilgisi olmadan değiştirmeyin',
    ],
  },
];

const FAQS: FAQ[] = [
  { id: 'faq1', question: 'Fizik tedavi seansları ne kadar sürer?', answer: 'Her seans genellikle 30-45 dakika sürer. Tedavi planınıza göre süre değişebilir. İlk değerlendirme seansı biraz daha uzun (45-60 dakika) olabilir.', category: 'Tedavi' },
  { id: 'faq2', question: 'Seansa gelirken ne giymeliyim?', answer: 'Rahat ve hareket etmenizi engellemeyen kıyafetler giyin. Tedavi bölgesine kolay ulaşılabilecek kıyafetler tercih edin. Örneğin omuz tedavisi için kolsuz üst, diz tedavisi için şort uygun olacaktır.', category: 'Seans' },
  { id: 'faq3', question: 'Tedavi sırasında ağrı hissedersem ne yapmalıyım?', answer: 'Hafif bir gerginlik hissi normal olabilir ancak keskin veya şiddetli ağrı hissederseniz hemen terapistinize söyleyin. Egzersiz programınızda da benzer şekilde ağrı hissederseniz o hareketi durdurun ve doktorunuza bildirin.', category: 'Tedavi' },
  { id: 'faq4', question: 'Egzersizlerimi evde ne sıklıkla yapmalıyım?', answer: 'Egzersiz programınızdaki sıklığa uyun (genellikle günde 1-2 kez). Düzenlilik çok önemlidir - her gün aynı saatte yapmak alışkanlık oluşturur. Ağrı olmadıkça verilen tekrar sayısını tamamlayın.', category: 'Egzersiz' },
  { id: 'faq5', question: 'Randevumu iptal etmem veya değiştirmem gerekirse ne yapmalıyım?', answer: 'En az 24 saat önceden randevu iptal veya değişiklik yapmanız gerekmektedir. Uygulamadan randevu talebinde bulunabilir veya mesaj yoluyla doktorunuzla iletişime geçebilirsiniz.', category: 'Randevu' },
  { id: 'faq6', question: 'Sıcak mı soğuk mu uygulamalıyım?', answer: 'Akut (yeni oluşmuş) ağrı ve şişlikte soğuk uygulama, kronik (uzun süreli) ağrı ve sertlikte sıcak uygulama önerilir. Her iki uygulama da 15-20 dakikayı geçmemeli ve cilt ile arasına havlu konulmalıdır. Doktorunuzun önerisine göre hareket edin.', category: 'Tedavi' },
  { id: 'faq7', question: 'Tedavi ne kadar sürer?', answer: 'Tedavi süresi tanınıza, hastalığın ciddiyetine ve kişisel iyileşme hızınıza bağlıdır. Genellikle 4-12 hafta arasında değişir. Düzenli seanslara katılım ve evde egzersiz yapma tedavi süresini kısaltır.', category: 'Tedavi' },
  { id: 'faq8', question: 'Ödeme seçenekleri nelerdir?', answer: 'Kredi kartı, nakit ve havale/EFT ile ödeme yapabilirsiniz. Randevunuz onaylandıktan sonra uygulamadaki Ödemeler sayfasından ödeme işleminizi gerçekleştirebilirsiniz. NFC kart okutma özelliği de mevcuttur.', category: 'Ödeme' },
  { id: 'faq9', question: 'Spor yapabilir miyim?', answer: 'Tedavi sürecinize bağlı olarak bazı sporlar uygun olabilir. Ancak doktorunuzun izni olmadan yoğun spor aktiviteleri yapmaktan kaçının. Yürüyüş ve yüzme genellikle güvenli seçeneklerdir.', category: 'Egzersiz' },
  { id: 'faq10', question: 'Tedavi sonrası nüks olur mu?', answer: 'Düzenli egzersiz yapma, doğru postür alışkanlığı edinme ve yaşam tarzı değişiklikleri nüks riskini azaltır. Tedavi sonrası kontrol seanslarına gelmek ve verilen önerileri uygulamak önemlidir.', category: 'Tedavi' },
];

export default function BilgilendirmePage() {
  const language = useStore((s) => s.language);
  const loggedInPatientId = useStore((s) => s.loggedInPatientId);
  const patients = useStore((s) => s.patients);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const patient = patients.find((p) => p.id === loggedInPatientId);
  const patientDiagnosis = patient?.diagnosis || '';

  const filteredFaqs = useMemo(() => {
    if (!search) return FAQS;
    const q = search.toLowerCase();
    return FAQS.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [search]);

  const sortedArticles = useMemo(() => {
    let filtered = ARTICLES;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      const aRelated = a.relatedDiagnoses.some((d) => patientDiagnosis.includes(d));
      const bRelated = b.relatedDiagnoses.some((d) => patientDiagnosis.includes(d));
      if (aRelated && !bRelated) return -1;
      if (!aRelated && bRelated) return 1;
      return 0;
    });
  }, [patientDiagnosis, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          {t('info.title', language)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('info.subtitle', language)}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          placeholder={t('info.searchPlaceholder', language)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-text-main">
          {t('info.faq', language)}
        </h2>
        <div className="space-y-2">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <Card key={faq.id}>
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                  className="w-full text-left flex items-start gap-3"
                >
                  <HelpCircle className={`h-5 w-5 shrink-0 mt-0.5 ${isExpanded ? 'text-primary' : 'text-text-secondary'}`} />
                  <p className="flex-1 text-sm font-medium text-text-main">{faq.question}</p>
                  {isExpanded
                    ? <ChevronUp className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                    : <ChevronDown className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border/50 pl-8">
                        <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
          {filteredFaqs.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              {t('info.noResultsFaq', language)}
            </p>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-text-main">
          {t('info.articles', language)}
        </h2>
        <div className="space-y-3">
          {sortedArticles.map((article) => {
            const isRelated = article.relatedDiagnoses.some((d) => patientDiagnosis.includes(d));
            const isExpanded = expandedArticle === article.id;
            return (
              <Card key={article.id}>
                <button
                  type="button"
                  onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isRelated ? 'bg-primary/10' : 'bg-background'}`}>
                      <BookOpen className={`h-5 w-5 ${isRelated ? 'text-primary' : 'text-text-secondary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-text-main">{article.title}</h3>
                        {isRelated && (
                          <Badge variant="success">
                            {t('info.forYou', language)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="info">{article.category}</Badge>
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <Clock className="h-3 w-3" />
                          {article.readTime} {t('info.minRead', language)}
                        </span>
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{article.content}</p>
                      )}
                    </div>
                    {isExpanded
                      ? <ChevronUp className="h-5 w-5 text-text-secondary shrink-0" />
                      : <ChevronDown className="h-5 w-5 text-text-secondary shrink-0" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        <p className="text-sm text-text-main leading-relaxed">{article.content}</p>

                        <div className="rounded-xl bg-health-green/5 border border-health-green/20 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-4 w-4 text-health-green" />
                            <span className="text-sm font-semibold text-health-green">
                              {t('info.dos', language)}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {article.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-green shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl bg-danger/5 border border-danger/20 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-danger" />
                            <span className="text-sm font-semibold text-danger">
                              {t('info.donts', language)}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {article.warnings.map((w, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-xs text-text-secondary">
                          {article.author} -{' '}
                          {new Date(article.date).toLocaleDateString(
                            language === 'tr' ? 'tr-TR' : 'en-US',
                            { day: 'numeric', month: 'long', year: 'numeric' },
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
          {sortedArticles.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              {t('info.noResultsArticles', language)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
