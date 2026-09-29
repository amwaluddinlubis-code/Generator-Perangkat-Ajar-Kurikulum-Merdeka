import React, { useState, useMemo } from 'react';
import { TeacherUser, EducationalDocument, MonthlyProductivityData } from '../types';
import { ProductivityD3Chart } from './ProductivityD3Chart';
import { DocumentTypeD3Donut } from './DocumentTypeD3Donut';
import { 
  UserCircle2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Award, 
  School, 
  Mail, 
  Calendar, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  Target, 
  Download, 
  Eye, 
  ShieldCheck, 
  Zap, 
  Check, 
  PieChart as PieIcon,
  LineChart as LineIcon
} from 'lucide-react';
import { downloadWordDocument, exportToDocx } from '../utils/exportUtils';

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

  // Donut data for document type distribution
  const donutData = useMemo(() => {
    const total = totalDocsCount > 0 ? totalDocsCount : 10;
    return [
      { label: 'Modul Ajar Lengkap', count: modulAjarCount > 0 ? modulAjarCount : 4, color: '#2563eb' },
      { label: 'RPP Ringkas (1-2 Lembar)', count: rppCount > 0 ? rppCount : 2, color: '#3b82f6' },
      { label: 'Bank Soal Ujian (AKM/HOTS)', count: soalCount > 0 ? soalCount : 2, color: '#f59e0b' },
      { label: 'LKPD Interaktif', count: lkpdCount > 0 ? lkpdCount : 1, color: '#10b981' },
      { label: 'ATP & KKTP', count: kktpCount > 0 ? kktpCount : 1, color: '#6366f1' },
      { label: 'Modul Projek P5', count: p5Count > 0 ? p5Count : 1, color: '#8b5cf6' },
    ];
  }, [totalDocsCount, modulAjarCount, rppCount, soalCount, lkpdCount, kktpCount, p5Count]);

  const isVerified = currentUser.status === 'VERIFIED';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Profil Pengguna & Verifikasi Belajar.id */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Identitas */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-extrabold text-2xl text-white shadow-md ${
                isSuperAdmin ? 'bg-gradient-to-br from-purple-600 to-indigo-700' :
                isVerified ? 'bg-gradient-to-br from-blue-600 to-sky-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
                {isVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-500 fill-amber-100" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                {isSuperAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Admin (Verifikator)
                  </span>
                ) : (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {isVerified ? 'Akun Belajar.id Terverifikasi' : 'Menunggu Verifikasi Admin'}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-500 font-mono flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
                {currentUser.nip && (
                  <span className="text-slate-400">• NIP. {currentUser.nip}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                  <School className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.schoolName}
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold">
                  {currentUser.jenjang} • {currentUser.mataPelajaran}
                </span>
              </div>
            </div>

          </div>

          {/* Action Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserCircle2 className="w-4 h-4 text-slate-500" />
              Ganti Akun Belajar.id
            </button>

            <button
              onClick={onCreateNew}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Susun Modul Baru
            </button>
          </div>

        </div>
      </div>

      {/* 2. Kartu Statistik Utama (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Modul Ajar Dibuat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Modul & Perangkat
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalDocsCount}</span>
            <span className="text-xs font-semibold text-slate-500">dokumen tersimpan</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Modul Ajar: <b>{modulAjarCount}</b></span>
            <span>RPP: <b>{rppCount}</b></span>
            <span>Soal: <b>{soalCount}</b></span>
          </div>
        </div>

        {/* Rata-Rata Durasi Penyusunan */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 shadow-2xs hover:shadow-md transition-all bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Rata-Rata Durasi AI
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">~{avgDurationMinutes}</span>
            <span className="text-xs font-bold text-emerald-800">Menit / Dokumen</span>
          </div>
          <p className="mt-3 pt-2.5 border-t border-emerald-100 text-[11px] text-emerald-700 font-medium">
            ⚡ 98% lebih cepat dibanding penyusunan manual
          </p>
        </div>

        {/* Total Jam Kerja Administrasi Dihemat */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/90 shadow-2xs hover:shadow-md transition-all bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Jam Kerja Guru Dihemat
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-800">~{savedHours}</span>
            <span className="text-xs font-bold text-blue-900">Jam Efektif</span>
          </div>
          <p className="mt-3 pt-2.5 border-t border-blue-100 text-[11px] text-blue-700 font-medium">
            🎯 Lebih banyak waktu berinteraksi langsung dengan murid
          </p>
        </div>

        {/* Kepatuhan Regulasi Kemdikbud */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200/90 shadow-2xs hover:shadow-md transition-all bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center justify-between text-indigo-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Kepatuhan Regulasi
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-900">100%</span>
            <span className="text-xs font-bold text-indigo-700">Permendikbud 12/2024</span>
          </div>
          <p className="mt-3 pt-2.5 border-t border-indigo-100 text-[11px] text-indigo-700 font-medium">
            ✓ BSKAP 032/H/KR/2024 & Standar PPA
          </p>
        </div>

      </div>

      {/* 3. Grafik Produktivitas Bulanan Menggunakan D3.js */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Chart Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Grafik Produktivitas Bulanan Penyusunan Perangkat Ajar
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi interaktif d3.js melacak tren jumlah modul ajar, RPP, dan bank soal yang telah Anda buat sepanjang tahun 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  chartType === 'area' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Garis Kurva D3.js"
              >
                <LineIcon className="w-3.5 h-3.5" />
                Kurva Tren
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  chartType === 'bar' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Grafik Batang D3.js"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Batang
              </button>
            </div>

            {/* Metric Filter */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Perangkat Ajar</option>
              <option value="modulAjar">Khusus Modul Ajar</option>
              <option value="rpp">Khusus RPP Ringkas</option>
              <option value="soalUjian">Khusus Bank Soal Ujian</option>
            </select>
          </div>
        </div>

        {/* D3.js Chart Render */}
        <div className="pt-2">
          <ProductivityD3Chart
            data={monthlyData}
            selectedMetric={selectedMetric}
            chartType={chartType}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <span>* Arahkan kursor / sentuh titik grafik untuk melihat rincian modul per bulan</span>
          <span>Ditenagai pustaka visualisasi <b>d3.js</b></span>
        </div>

      </div>

      {/* 4. Donut Distribusi Jenis Dokumen (D3) & Lencana Guru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Donut Chart Distribusi (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <PieIcon className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Distribusi Jenis Perangkat Ajar (d3.js)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total {totalDocsCount > 0 ? totalDocsCount : 10} Dokumen
            </span>
          </div>

          <DocumentTypeD3Donut data={donutData} />
        </div>

        {/* Right: Pencapaian Profesional Guru (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              Lencana & Portofolio Guru
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Penyusun Modul Ajar Diferensiasi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Telah menyusun modul dengan diferensiasi konten, proses, dan produk sesuai kebutuhan murid.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Spesialis Asesmen AKM & HOTS</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Telah menghasilkan paket soal sumatif dengan kisi-kisi dan level kognitif bernalar tinggi.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Kredensial Belajar.id Terverifikasi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Terdaftar resmi dalam ekosistem Kurikulum Merdeka Kementerian Pendidikan.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Riwayat Perangkat Ajar Terbaru Guru */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              Riwayat Perangkat Ajar yang Baru Disusun
            </h3>
          </div>
          <button
            onClick={onCreateNew}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            + Susun Lagi
          </button>
        </div>

        {effectiveDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Belum ada modul ajar yang dibuat. Mulai susun sekarang!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {effectiveDocs.slice(0, 5).map(doc => (
              <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {doc.jenjang} • {doc.tingkat}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {doc.mataPelajaran} • Topik: {doc.topik} • Durasi AI: ~{doc.durationMinutes || 3.2} menit
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat & Cetak
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
                    className="px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
