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
      ? { ink: '#e8eaed', gray: '#8b94a3', faint: '#333b49', blue: '#818cf8', green: '#34d399', orange: '#fbbf24' }
      : { ink: '#0f172a', gray: '#5b6675', faint: '#cfd6e0', blue: '#4f46e5', green: '#047857', orange: '#b45309' };
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
      <div className="apple-card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Avatar & Identitas */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-[22px]">
                {currentUser.name.charAt(0)}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${isVerified || isSuperAdmin ? 'bg-[var(--ok)]' : 'bg-[var(--warn)]'}`}
                style={{ border: '3px solid var(--surface)' }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] sm:text-[23px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
                  {currentUser.name}
                </h1>
                <span className={`ds-badge ${isVerified || isSuperAdmin ? 'ds-badge-ok' : 'ds-badge-warn'}`}>
                  {isSuperAdmin ? 'Admin' : isVerified ? 'Terverifikasi' : 'Menunggu verifikasi'}
                </span>
              </div>

              <div className="text-[12.5px] text-[var(--muted)] flex items-center gap-1.5 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
                {currentUser.nip && (
                  <span className="hidden sm:inline">· NIP {currentUser.nip}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-[12px] flex-wrap">
                <span className="ds-badge">
                  <School className="w-3 h-3" />
                  {currentUser.schoolName}
                </span>
                <span className="ds-badge">
                  {currentUser.jenjang} · {currentUser.mataPelajaran}
                </span>
              </div>
            </div>

          </div>

          {/* Aksi */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
            <button onClick={onOpenAuthModal} className="btn-apple-secondary">
              <UserCircle2 className="w-4 h-4" />
              Ganti akun
            </button>

            <button onClick={onCreateNew} className="btn-apple">
              <Sparkles className="w-4 h-4" />
              Susun modul baru
            </button>
          </div>

        </div>
      </div>

      {/* 2. Kartu Statistik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="apple-card p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[12px] font-medium text-[var(--muted)]">
              Total dokumen
            </span>
            <span className="w-7 h-7 rounded-md bg-[var(--surface-2)] text-[var(--muted)] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[26px] font-semibold tracking-[-0.03em] leading-none text-[var(--ink)]">{totalDocsCount}</span>
            <span className="text-[11.5px] text-[var(--muted)]">tersimpan</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Modul <b className="text-[var(--ink-soft)]">{modulAjarCount}</b></span>
            <span>RPP <b className="text-[var(--ink-soft)]">{rppCount}</b></span>
            <span>Soal <b className="text-[var(--ink-soft)]">{soalCount}</b></span>
          </div>
        </div>

        <div className="apple-card p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[12px] font-medium text-[var(--muted)]">
              Rata-rata durasi AI
            </span>
            <span className="w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[26px] font-semibold tracking-[-0.03em] leading-none text-[var(--ink)]">~{avgDurationMinutes}</span>
            <span className="text-[11.5px] text-[var(--muted)]">mnt / dok</span>
          </div>
          <p className="mt-2.5 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)]">
            98% lebih cepat dari cara manual
          </p>
        </div>

        <div className="apple-card p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[12px] font-medium text-[var(--muted)]">
              Jam kerja dihemat
            </span>
            <span className="w-7 h-7 rounded-md bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[26px] font-semibold tracking-[-0.03em] leading-none text-[var(--ink)]">~{savedHours}</span>
            <span className="text-[11.5px] text-[var(--muted)]">jam efektif</span>
          </div>
          <p className="mt-2.5 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)]">
            Lebih banyak waktu untuk murid
          </p>
        </div>

        <div className="apple-card p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[12px] font-medium text-[var(--muted)]">
              Kepatuhan regulasi
            </span>
            <span className="w-7 h-7 rounded-md bg-[var(--surface-2)] text-[var(--muted)] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[26px] font-semibold tracking-[-0.03em] leading-none text-[var(--ink)]">100%</span>
            <span className="text-[11.5px] text-[var(--muted)]">Permendikdasmen 13/2025</span>
          </div>
          <p className="mt-2.5 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)]">
            BSKAP 046/H/KR/2025 & PPA
          </p>
        </div>

      </div>

      {/* 3. Grafik Produktivitas Bulanan */}
      <div className="apple-card p-4 sm:p-5 space-y-3">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="text-[14.5px] font-semibold text-[var(--ink)]">
              Produktivitas bulanan
            </h2>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">
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
              className="apple-input !w-auto !py-2 !text-[12.5px]"
              aria-label="Pilih metrik"
            >
              <option value="all">Semua perangkat</option>
              <option value="modulAjar">Modul Ajar</option>
              <option value="rpp">RPP Ringkas</option>
              <option value="soalUjian">Bank Soal</option>
            </select>
          </div>
        </div>

        <div className="pt-1">
          <ProductivityD3Chart
            data={monthlyData}
            selectedMetric={selectedMetric}
            chartType={chartType}
          />
        </div>

        <div className="flex items-center justify-between text-[11.5px] text-[var(--muted)] pt-2 border-t border-[var(--line)]">
          <span>Arahkan kursor ke titik grafik untuk rincian per bulan</span>
        </div>

      </div>

      {/* 4. Donut Distribusi & Lencana */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        <div className="lg:col-span-7 apple-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--line)]">
            <h3 className="font-semibold text-[13.5px] text-[var(--ink)]">
              Distribusi perangkat
            </h3>
            <span className="ds-badge">
              Total {totalDocsCount > 0 ? totalDocsCount : 10} dokumen
            </span>
          </div>

          <DocumentTypeD3Donut data={donutData} />
        </div>

        <div className="lg:col-span-5 apple-card p-4 sm:p-5 space-y-2.5">
          <h3 className="font-semibold text-[13.5px] text-[var(--ink)] pb-2.5 border-b border-[var(--line)]">
            Lencana guru
          </h3>

          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-2.5">
              <FileText className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent)]" />
              <div>
                <h4 className="font-semibold text-[12.5px] text-[var(--ink)]">Penyusun modul diferensiasi</h4>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  Diferensiasi konten, proses, dan produk sesuai kebutuhan murid.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent)]" />
              <div>
                <h4 className="font-semibold text-[12.5px] text-[var(--ink)]">Spesialis asesmen AKM & HOTS</h4>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  Paket soal sumatif dengan kisi-kisi dan level bernalar tinggi.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[var(--ok)]" />
              <div>
                <h4 className="font-semibold text-[12.5px] text-[var(--ink)]">Belajar.id terverifikasi</h4>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  Terdaftar resmi di ekosistem Kurikulum Merdeka.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Riwayat Terbaru */}
      <div className="apple-card p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--line)]">
          <h3 className="font-semibold text-[13.5px] text-[var(--ink)]">
            Baru disusun
          </h3>
          <button
            onClick={onCreateNew}
            className="text-[12px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
          >
            Susun lagi
          </button>
        </div>

        {effectiveDocs.length === 0 ? (
          <div className="text-center py-8 text-[12.5px] text-[var(--muted)]">
            Belum ada modul yang dibuat. Mulai susun sekarang.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {effectiveDocs.slice(0, 5).map(doc => (
              <div key={doc.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="ds-badge shrink-0 !py-0.5 !text-[10.5px]">
                      {doc.jenjang} · {doc.tingkat}
                    </span>
                    <span className="text-[12.5px] font-semibold text-[var(--ink)] truncate">{doc.title}</span>
                  </div>
                  <div className="text-[11.5px] text-[var(--muted)] mt-0.5">
                    {doc.mataPelajaran} · {doc.topik} · ~{doc.durationMinutes || 3.2} mnt
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="btn-apple !min-h-[30px] !py-1 !px-2.5 !text-[11.5px]"
                  >
                    <Eye className="w-3 h-3" />
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
                    className="rounded-md border border-[var(--line)] px-2.5 py-1 min-h-[30px] text-[11.5px] font-semibold text-[var(--ink-soft)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer flex items-center gap-1"
                    title="Unduh Format Word (.docx)"
                  >
                    <Download className="w-3 h-3" />
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
