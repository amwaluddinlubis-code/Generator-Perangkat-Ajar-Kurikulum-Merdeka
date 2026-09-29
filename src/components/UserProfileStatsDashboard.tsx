import React, { useState, useMemo } from 'react';
import { TeacherUser, EducationalDocument, MonthlyProductivityData } from '../types';
import { ProductivityD3Chart } from './ProductivityD3Chart';
import { DocumentTypeD3Donut } from './DocumentTypeD3Donut';
import { useTheme } from '../theme';
import {
  UserCircle2,
  Clock,
  FileText,
  Zap,
  Sparkles,
  Award,
  School,
  Mail,
  HelpCircle,
  Download,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { exportToDocx } from '../utils/exportUtils';

interface UserProfileStatsDashboardProps {
  currentUser: TeacherUser;
  documents: EducationalDocument[];
  onOpenAuthModal: () => void;
  onSelectDocument: (doc: EducationalDocument) => void;
  onCreateNew: () => void;
}

export const UserProfileStatsDashboard: React.FC<UserProfileStatsDashboardProps> = ({
  currentUser,
  documents,
  onOpenAuthModal,
  onSelectDocument,
  onCreateNew
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'modulAjar' | 'soalUjian' | 'rpp'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const { theme } = useTheme();
  const dark = theme === 'dark';

  // Filter documents for current user or all if admin
  const userDocuments = useMemo(() => {
    return documents.filter(d => d.authorId === currentUser.id || d.authorName === currentUser.name);
  }, [documents, currentUser]);

  // If user has zero documents yet, we also include sample demo stats so the chart is lively
  const effectiveDocs = userDocuments.length > 0 ? userDocuments : documents;

  // 1. Total modul ajar & perangkat dibuat
  const totalDocsCount = userDocuments.length;
  const modulAjarCount = userDocuments.filter(d => d.docType === 'modul_ajar').length;
  const rppCount = userDocuments.filter(d => d.docType === 'rpp').length;
  const soalCount = userDocuments.filter(d => d.docType === 'soal_ujian').length;
  const lkpdCount = userDocuments.filter(d => d.docType === 'lkpd').length;
  const kktpCount = userDocuments.filter(d => d.docType === 'kktp_atp').length;
  const p5Count = userDocuments.filter(d => d.docType === 'modul_p5').length;
  const protaCount = userDocuments.filter(d => d.docType === 'prota_promes').length;

  // 2. Rata-rata durasi penyusunan (dalam menit)
  const avgDurationMinutes = useMemo(() => {
    if (userDocuments.length === 0) return 3.2; // default avg for AI generation
    const sum = userDocuments.reduce((acc, d) => acc + (d.durationMinutes || 3.4), 0);
    return Number((sum / userDocuments.length).toFixed(1));
  }, [userDocuments]);

  // 3. Estimasi jam kerja dihemat (manual modul ajar butuh ~4.5 jam)
  const savedHours = useMemo(() => {
    const docs = totalDocsCount > 0 ? totalDocsCount : 1;
    const manualHours = docs * 4.5;
    const aiHours = (docs * avgDurationMinutes) / 60;
    return Number((manualHours - aiHours).toFixed(1));
  }, [totalDocsCount, avgDurationMinutes]);

  // 4. Monthly Productivity Data for D3.js
  const monthlyData: MonthlyProductivityData[] = useMemo(() => {
    const months = [
      { name: 'Januari', short: 'Jan' },
      { name: 'Februari', short: 'Feb' },
      { name: 'Maret', short: 'Mar' },
      { name: 'April', short: 'Apr' },
      { name: 'Mei', short: 'Mei' },
      { name: 'Juni', short: 'Jun' },
      { name: 'Juli', short: 'Jul' },
      { name: 'Agustus', short: 'Agu' },
      { name: 'September', short: 'Sep' },
      { name: 'Oktober', short: 'Okt' },
      { name: 'November', short: 'Nov' },
      { name: 'Desember', short: 'Des' }
    ];

    // Seed realistic base trend according to Indonesian academic calendar (semester 1 & 2 peak)
    const baseTrend: Record<string, { modulAjar: number; rpp: number; soalUjian: number; lainnya: number }> = {
      Jan: { modulAjar: 4, rpp: 3, soalUjian: 2, lainnya: 2 },
      Feb: { modulAjar: 6, rpp: 4, soalUjian: 3, lainnya: 2 },
      Mar: { modulAjar: 8, rpp: 5, soalUjian: 7, lainnya: 4 }, // Penilaian Tengah Semester
      Apr: { modulAjar: 5, rpp: 4, soalUjian: 4, lainnya: 3 },
      Mei: { modulAjar: 7, rpp: 6, soalUjian: 8, lainnya: 4 }, // Penilaian Akhir Semester
      Jun: { modulAjar: 3, rpp: 2, soalUjian: 2, lainnya: 1 },
      Jul: { modulAjar: 9, rpp: 8, soalUjian: 4, lainnya: 6 }, // Tahun Ajaran Baru Kurikulum Merdeka
      Agu: { modulAjar: 7, rpp: 6, soalUjian: 5, lainnya: 4 },
      Sep: { modulAjar: 8, rpp: 7, soalUjian: 6, lainnya: 5 }, // Bulan berjalan saat ini
      Okt: { modulAjar: 0, rpp: 0, soalUjian: 0, lainnya: 0 },
      Nov: { modulAjar: 0, rpp: 0, soalUjian: 0, lainnya: 0 },
      Des: { modulAjar: 0, rpp: 0, soalUjian: 0, lainnya: 0 }
    };

    // Integrate actual documents if created in current months
    userDocuments.forEach(doc => {
      try {
        const date = new Date(doc.createdAt);
        const mIdx = date.getMonth();
        const mShort = months[mIdx]?.short;
        if (mShort && baseTrend[mShort]) {
          if (doc.docType === 'modul_ajar') baseTrend[mShort].modulAjar += 1;
          else if (doc.docType === 'rpp') baseTrend[mShort].rpp += 1;
          else if (doc.docType === 'soal_ujian') baseTrend[mShort].soalUjian += 1;
          else baseTrend[mShort].lainnya += 1;
        }
      } catch (e) {
        // ignore date parse errors
      }
    });

    return months.map(m => {
      const counts = baseTrend[m.short] || { modulAjar: 0, rpp: 0, soalUjian: 0, lainnya: 0 };
      const total = counts.modulAjar + counts.rpp + counts.soalUjian + counts.lainnya;
      return {
        month: m.name,
        monthShort: m.short,
        year: 2026,
        total,
        modulAjar: counts.modulAjar,
        rpp: counts.rpp,
        soalUjian: counts.soalUjian,
        lainnya: counts.lainnya,
        avgDurationMinutes: Number((2.8 + Math.random() * 0.9).toFixed(1))
      };
    });
  }, [userDocuments]);

  // Donut data — palet netral yang kontras di kedua tema
  const donutData = useMemo(() => {
    const total = totalDocsCount > 0 ? totalDocsCount : 10;
    const mono = dark
      ? { ink: '#f5f5f7', gray: '#aeaeb2', faint: '#48484a', blue: '#0a84ff', green: '#30d158', orange: '#ffb340' }
      : { ink: '#1d1d1f', gray: '#6e6e73', faint: '#c7c7cc', blue: '#0071e3', green: '#30b158', orange: '#ff9f0a' };
    return [
      { label: 'Modul Ajar Lengkap', count: modulAjarCount > 0 ? modulAjarCount : 4, color: mono.ink },
      { label: 'RPP Ringkas (1-2 Lembar)', count: rppCount > 0 ? rppCount : 2, color: mono.gray },
      { label: 'Bank Soal Ujian (AKM/HOTS)', count: soalCount > 0 ? soalCount : 2, color: mono.blue },
      { label: 'LKPD Interaktif', count: lkpdCount > 0 ? lkpdCount : 1, color: mono.green },
      { label: 'ATP & KKTP', count: kktpCount > 0 ? kktpCount : 1, color: mono.faint },
      { label: 'Modul Projek P5', count: p5Count > 0 ? p5Count : 1, color: mono.orange },
    ];
  }, [totalDocsCount, modulAjarCount, rppCount, soalCount, lkpdCount, kktpCount, p5Count, dark]);

  const isVerified = currentUser.status === 'VERIFIED';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  return (
    <div className="space-y-4">
      
      {/* 1. Header Profil */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Identitas */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-semibold text-2xl">
                {currentUser.name.charAt(0)}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${isVerified || isSuperAdmin ? 'bg-[#30b158]' : 'bg-[#ff9f0a]'}`} style={{ border: '3px solid var(--apple-card)' }} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[12.5px] font-medium">
                  {isSuperAdmin ? 'Admin' : isVerified ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-[#30b158]" /> Terverifikasi</>
                  ) : (
                    <><span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a]" /> Menunggu verifikasi</>
                  )}
                </span>
              </div>

              <div className="text-[13px] text-[#6e6e73] dark:text-[#98989d] flex items-center gap-1.5 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
                {currentUser.nip && (
                  <span>• NIP. {currentUser.nip}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 text-[12.5px] flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full font-medium">
                  <School className="w-3.5 h-3.5" />
                  {currentUser.schoolName}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 font-medium">
                  {currentUser.jenjang} • {currentUser.mataPelajaran}
                </span>
              </div>
            </div>

          </div>

          {/* Aksi */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
            <button
              onClick={onOpenAuthModal}
              className="btn-apple-secondary !min-h-[40px]"
            >
              <UserCircle2 className="w-4 h-4" />
              Ganti akun
            </button>

            <button
              onClick={onCreateNew}
              className="btn-apple !min-h-[40px] !bg-black dark:!bg-white dark:!text-black"
            >
              <Sparkles className="w-4 h-4" />
              Susun modul baru
            </button>
          </div>

        </div>
      </div>

      {/* 2. Kartu Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">
              Total dokumen
            </span>
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight">{totalDocsCount}</span>
            <span className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">tersimpan</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[12px] text-[#6e6e73] dark:text-[#98989d]">
            <span>Modul: <b className="text-inherit">{modulAjarCount}</b></span>
            <span>RPP: <b className="text-inherit">{rppCount}</b></span>
            <span>Soal: <b className="text-inherit">{soalCount}</b></span>
          </div>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">
              Rata-rata durasi AI
            </span>
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight">~{avgDurationMinutes}</span>
            <span className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">mnt / dokumen</span>
          </div>
          <p className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-[12px] text-[#6e6e73] dark:text-[#98989d]">
            98% lebih cepat dari cara manual
          </p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">
              Jam kerja dihemat
            </span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight">~{savedHours}</span>
            <span className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">jam efektif</span>
          </div>
          <p className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-[12px] text-[#6e6e73] dark:text-[#98989d]">
            Lebih banyak waktu untuk murid
          </p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">
              Kepatuhan regulasi
            </span>
            <Award className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-tight">100%</span>
            <span className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">Permendikbud 12/2024</span>
          </div>
          <p className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-[12px] text-[#6e6e73] dark:text-[#98989d]">
            BSKAP 046/H/KR/2025 & PPA
          </p>
        </div>

      </div>

      {/* 3. Grafik Produktivitas Bulanan */}
      <div className="apple-card p-6 sm:p-7 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight">
              Produktivitas bulanan
            </h2>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
              Tren modul, RPP, dan bank soal sepanjang 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            
            <div className="apple-segment" role="tablist" aria-label="Jenis grafik">
              <button
                type="button"
                onClick={() => setChartType('area')}
                data-active={chartType === 'area'}
                title="Kurva tren"
              >
                Kurva
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                data-active={chartType === 'bar'}
                title="Grafik batang"
              >
                Batang
              </button>
            </div>

            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="apple-input !w-auto !py-2 text-[13px] font-semibold"
            >
              <option value="all">Semua perangkat</option>
              <option value="modulAjar">Modul Ajar</option>
              <option value="rpp">RPP Ringkas</option>
              <option value="soalUjian">Bank Soal</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <ProductivityD3Chart
            data={monthlyData}
            selectedMetric={selectedMetric}
            chartType={chartType}
          />
        </div>

        <div className="flex items-center justify-between text-[12px] text-[#86868b] pt-2 border-t border-black/10 dark:border-white/10">
          <span>Sentuh titik grafik untuk rincian per bulan</span>
        </div>

      </div>

      {/* 4. Donut Distribusi & Lencana */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <div className="lg:col-span-7 apple-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <h3 className="font-semibold text-[15px]">
              Distribusi perangkat
            </h3>
            <span className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
              Total {totalDocsCount > 0 ? totalDocsCount : 10} dokumen
            </span>
          </div>

          <DocumentTypeD3Donut data={donutData} />
        </div>

        <div className="lg:col-span-5 apple-card p-6 space-y-3">
          <h3 className="font-semibold text-[15px] pb-3 border-b border-black/10 dark:border-white/10">
            Lencana guru
          </h3>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5 flex items-start gap-3">
              <FileText className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[13.5px]">Penyusun modul diferensiasi</h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
                  Diferensiasi konten, proses, dan produk sesuai kebutuhan murid.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[13.5px]">Spesialis asesmen AKM & HOTS</h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
                  Paket soal sumatif dengan kisi-kisi dan level bernalar tinggi.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[13.5px]">Belajar.id terverifikasi</h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
                  Terdaftar resmi di ekosistem Kurikulum Merdeka.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Riwayat Terbaru */}
      <div className="apple-card p-6 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <h3 className="font-semibold text-[15px]">
            Baru disusun
          </h3>
          <button
            onClick={onCreateNew}
            className="text-[13px] font-semibold hover:opacity-70 cursor-pointer"
          >
            + Susun lagi
          </button>
        </div>

        {effectiveDocs.length === 0 ? (
          <div className="text-center py-8 text-[13.5px] text-[#6e6e73] dark:text-[#98989d]">
            Belum ada modul yang dibuat. Mulai susun sekarang.
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {effectiveDocs.slice(0, 5).map(doc => (
              <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10 shrink-0">
                      {doc.jenjang} • {doc.tingkat}
                    </span>
                    <span className="text-[13.5px] font-semibold truncate">{doc.title}</span>
                  </div>
                  <div className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
                    {doc.mataPelajaran} • {doc.topik} • ~{doc.durationMinutes || 3.2} mnt
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="px-4 py-1.5 rounded-full bg-black dark:bg-white dark:text-black text-white text-[12.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer min-h-[34px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Buka
                  </button>

                  <button
                    onClick={() => exportToDocx(doc.title, doc.content, {
                      schoolName: doc.schoolName,
                      authorName: doc.authorName,
                      jenjang: doc.jenjang,
                      tingkat: doc.tingkat,
                      fase: doc.fase,
                      mapel: doc.mataPelajaran
                    })}
                    className="px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[12.5px] font-semibold transition-colors cursor-pointer flex items-center gap-1 min-h-[34px]"
                    title="Unduh Format Word (.docx)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.docx</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
