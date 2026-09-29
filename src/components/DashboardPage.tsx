import React, { useMemo } from 'react';
import { TeacherUser, EducationalDocument, DocType } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { NavigationTarget } from './Sidebar';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import {
  Sparkles,
  Archive,
  BarChart3,
  BookOpen,
  ArrowRight,
  Clock,
  FileText,
  Layers,
  HelpCircle,
  Target,
  Calendar,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react';

interface DashboardPageProps {
  currentUser: TeacherUser;
  documents: EducationalDocument[];
  pendingCount: number;
  onNavigate: (target: NavigationTarget) => void;
  onSelectDocument: (doc: EducationalDocument) => void;
}

const DOC_ICONS: Record<DocType, React.ReactNode> = {
  modul_ajar: <FileText className="h-4 w-4" />,
  rpp: <Layers className="h-4 w-4" />,
  soal_ujian: <HelpCircle className="h-4 w-4" />,
  lkpd: <BookOpen className="h-4 w-4" />,
  kktp_atp: <Target className="h-4 w-4" />,
  prota_promes: <Calendar className="h-4 w-4" />,
  modul_p5: <Sparkles className="h-4 w-4" />,
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  documents,
  pendingCount,
  onNavigate,
  onSelectDocument,
}) => {
  const firstName = currentUser.name.split(',')[0].split(' ').slice(0, 2).join(' ');
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const myDocs = useMemo(
    () => documents.filter(d => d.authorId === currentUser.id || d.authorName === currentUser.name),
    [documents, currentUser]
  );

  const recentDocs = useMemo(
    () => [...documents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [documents]
  );

  const weekCount = useMemo(
    () => documents.filter(d => Date.now() - new Date(d.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length,
    [documents]
  );

  const byType = useMemo(() => {
    const counts = (Object.keys(DOC_TYPE_INFO) as DocType[]).map(type => ({
      type,
      label: DOC_TYPE_INFO[type].label,
      count: documents.filter(d => d.docType === type).length,
    }));
    const max = Math.max(1, ...counts.map(c => c.count));
    return { counts, max };
  }, [documents]);

  const isPending = currentUser.status === 'PENDING';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const quickActions: Array<{ label: string; desc: string; icon: React.ReactNode; target: NavigationTarget }> = [
    { label: 'Susun perangkat', desc: 'Modul, RPP, soal, LKPD…', icon: <Sparkles className="h-5 w-5" />, target: 'modul_ajar' },
    { label: 'Buka arsip', desc: `${documents.length} dokumen tersimpan`, icon: <Archive className="h-5 w-5" />, target: 'repository' },
    { label: 'Statistik', desc: 'Produktivitas & lencana', icon: <BarChart3 className="h-5 w-5" />, target: 'stats' },
    { label: 'Panduan', desc: 'Regulasi 046/2025 & 020/2026', icon: <BookOpen className="h-5 w-5" />, target: 'guide' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Sapaan */}
      <section className="hero-surface p-6 sm:p-8">
        <div className="relative z-10">
          <p className="apple-eyebrow">{today}</p>
          <h2 className="page-title mt-2">
            {greeting()}, {firstName}.
          </h2>
          <p className="page-subtitle mt-2 max-w-xl">
            {myDocs.length > 0
              ? `Anda telah menyusun ${myDocs.length} perangkat. Lanjutkan pekerjaan atau mulai yang baru.`
              : 'Mulai susun perangkat ajar pertama Anda — cukup tiga langkah singkat.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => onNavigate('modul_ajar')} className="btn-apple">
              <Sparkles className="h-4 w-4" />
              Susun perangkat baru
            </button>
            {recentDocs.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectDocument(recentDocs[0])}
                className="btn-apple-secondary"
              >
                Lanjutkan: {recentDocs[0].title.slice(0, 32)}{recentDocs[0].title.length > 32 ? '…' : ''}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Peringatan status */}
      {isPending && (
        <div className="apple-card flex items-start gap-3 p-4 sm:p-5" role="status">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--app-warning)]" />
          <div className="text-[13.5px] leading-6">
            <span className="font-bold">Akun menunggu verifikasi admin.</span>
            <span className="text-[var(--app-text-secondary)]"> Anda tetap bisa menyusun draf; akses penuh terbuka setelah disetujui.</span>
          </div>
        </div>
      )}
      {isAdmin && pendingCount > 0 && (
        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="apple-card flex w-full items-center gap-3 p-4 text-left sm:p-5"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-[var(--app-warning)]" />
          <div className="flex-1 text-[13.5px]">
            <span className="font-bold">{pendingCount} guru menunggu verifikasi.</span>
            <span className="text-[var(--app-text-secondary)]"> Tinjau sekarang</span>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--app-text-tertiary)]" />
        </button>
      )}

      {/* Ringkasan */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan">
        {[
          { value: documents.length, label: 'Total perangkat' },
          { value: myDocs.length, label: 'Karya saya' },
          { value: weekCount, label: '7 hari terakhir' },
          { value: byType.counts.filter(c => c.count > 0).length, label: 'Jenis terisi' },
        ].map(stat => (
          <div key={stat.label} className="metric-card">
            <p className="text-[26px] font-bold tracking-[-.03em]">{stat.value}</p>
            <p className="mt-0.5 text-[12px] text-[var(--app-text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Aksi cepat + aktivitas */}
        <div className="space-y-4 lg:col-span-3">
          <section className="apple-card p-5 sm:p-6" aria-label="Aksi cepat">
            <h3 className="text-[15px] font-bold tracking-[-.02em]">Aksi cepat</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate(action.target)}
                  className="group flex items-center gap-3 rounded-2xl border border-[var(--app-border)] p-3.5 text-left transition-all hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-soft)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    {action.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold">{action.label}</span>
                    <span className="block truncate text-[12px] text-[var(--app-text-secondary)]">{action.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--app-text-tertiary)] transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </section>

          <section className="apple-card p-5 sm:p-6" aria-label="Aktivitas terbaru">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold tracking-[-.02em]">Aktivitas terbaru</h3>
              {documents.length > 5 && (
                <button
                  type="button"
                  onClick={() => onNavigate('repository')}
                  className="text-[12.5px] font-semibold text-[var(--app-accent)] hover:underline"
                >
                  Lihat semua
                </button>
              )}
            </div>
            {recentDocs.length === 0 ? (
              <EmptyState
                icon={<LayoutDashboard className="h-6 w-6" />}
                title="Belum ada aktivitas"
                description="Dokumen yang Anda susun akan muncul di sini beserta riwayat pembukaannya."
                action={
                  <button type="button" onClick={() => onNavigate('modul_ajar')} className="btn-apple btn-sm">
                    Mulai menyusun
                  </button>
                }
              />
            ) : (
              <ul className="mt-2 divide-y divide-[var(--app-border)]">
                {recentDocs.map(doc => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => onSelectDocument(doc)}
                      className="group flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-muted)] text-[var(--app-text-secondary)]">
                        {DOC_ICONS[doc.docType]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold group-hover:text-[var(--app-accent)]">
                          {doc.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-[var(--app-text-secondary)]">
                          {doc.mataPelajaran} • {timeAgo(doc.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Status dokumen */}
        <section className="apple-card h-fit p-5 sm:p-6 lg:col-span-2" aria-label="Status dokumen">
          <h3 className="text-[15px] font-bold tracking-[-.02em]">Status dokumen</h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--app-text-secondary)]">
            Sebaran 7 jenis perangkat di arsip
          </p>
          <div className="mt-4 space-y-3">
            {byType.counts.map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => onNavigate(item.type)}
                className="group block w-full text-left"
                title={`Buka penyusun ${item.label}`}
              >
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="truncate font-semibold">{item.label}</span>
                  <Badge tone={item.count > 0 ? 'info' : 'neutral'}>{item.count}</Badge>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-muted)]"
                  role="img"
                  aria-label={`${item.label}: ${item.count} dokumen`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--app-accent)] transition-all"
                    style={{ width: `${Math.round((item.count / byType.max) * 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
