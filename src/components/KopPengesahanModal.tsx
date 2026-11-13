import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Trash2, Building2 } from 'lucide-react';
import type { KopPengesahan } from '@/shared/kopPengesahan';
import { LOGO_MAX_BYTES, validasiKop } from '@/shared/kopPengesahan';

interface KopPengesahanModalProps {
  terbuka: boolean;
  kopAwal: Partial<KopPengesahan>;
  onSimpan: (kop: KopPengesahan) => void;
  onBatal: () => void;
}

type FormKop = Partial<KopPengesahan>;

const LABEL_WAJIB: Record<string, string> = {
  namaSekolah: 'Nama sekolah',
  tahunAjaran: 'Tahun ajaran',
  namaGuru: 'Nama guru',
  namaKepsek: 'Nama kepala satuan pendidikan',
  kotaTanggal: 'Kota & tanggal',
};

const labelCls = 'mb-1.5 block text-[12px] font-medium text-[var(--ink-soft)]';
const errCls = 'mt-1 text-[11.5px] text-[var(--danger)]';

export const KopPengesahanModal: React.FC<KopPengesahanModalProps> = ({
  terbuka,
  kopAwal,
  onSimpan,
  onBatal,
}) => {
  const [form, setForm] = useState<FormKop>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoError, setLogoError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Sinkronkan form setiap kali modal dibuka
  useEffect(() => {
    if (terbuka) {
      setForm({ ...kopAwal });
      setErrors({});
      setLogoError('');
    }
  }, [terbuka, kopAwal]);

  if (!terbuka) return null;

  const set = (k: keyof KopPengesahan, v: string | undefined) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handlePilihLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!f) return;
    if (f.size > LOGO_MAX_BYTES) {
      setLogoError(
        `Ukuran logo ${(f.size / 1024).toFixed(0)}KB melebihi batas ${Math.round(LOGO_MAX_BYTES / 1024)}KB. Perkecil gambar dulu lalu coba lagi.`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((s) => ({ ...s, logoDataUrl: String(reader.result) }));
      setLogoError('');
    };
    reader.onerror = () => setLogoError('Gagal membaca file logo. Coba file lain.');
    reader.readAsDataURL(f);
  };

  const handleSimpan = () => {
    const kosong = validasiKop(form);
    if (kosong.length > 0) {
      const errs: Record<string, string> = {};
      kosong.forEach((f) => {
        errs[f] = `${LABEL_WAJIB[f] ?? f} wajib diisi`;
      });
      setErrors(errs);
      return;
    }
    onSimpan(form as KopPengesahan);
  };

  const fieldErr = (k: string) => (errors[k] ? <p className={errCls}>{errors[k]}</p> : null);

  const wajib = <span className="text-[var(--danger)]">*</span>;

  return (
    <div
      className="modal modal-open no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Kop dan lembar pengesahan"
    >
      <div className="modal-box max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="relative shrink-0 border-b border-[var(--line)] px-5 py-4">
          <button
            onClick={onBatal}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
            Identitas dokumen
          </p>
          <h3 className="mt-1 flex items-center gap-2 pr-10 text-[16px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            <Building2 className="w-4 h-4 text-[var(--accent)]" />
            Kop &amp; lembar pengesahan
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            Isi sekali, otomatis dipakai di semua ekspor dokumen. Kolom bertanda {wajib} wajib diisi.
            Data tersimpan di perangkat ini.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3.5 overflow-y-auto p-5">
          {/* Nama sekolah */}
          <div>
            <label className={labelCls} htmlFor="kop-nama-sekolah">Nama sekolah {wajib}</label>
            <input
              id="kop-nama-sekolah"
              value={form.namaSekolah ?? ''}
              onChange={(e) => set('namaSekolah', e.target.value)}
              className="apple-input"
              placeholder="Contoh: SMP Negeri 3 Sinunukan"
            />
            {fieldErr('namaSekolah')}
          </div>

          {/* Alamat */}
          <div>
            <label className={labelCls} htmlFor="kop-alamat">Alamat sekolah</label>
            <textarea
              id="kop-alamat"
              value={form.alamatSekolah ?? ''}
              onChange={(e) => set('alamatSekolah', e.target.value)}
              rows={2}
              className="apple-input resize-none"
              placeholder="Contoh: Jl. Pendidikan No. 12, Kec. Sinunukan, Kab. Mandailing Natal"
            />
          </div>

          {/* Logo */}
          <div>
            <label className={labelCls}>Logo sekolah</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePilihLogo}
            />
            {form.logoDataUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
                <img
                  src={form.logoDataUrl}
                  alt="Pratinjau logo sekolah"
                  className="h-14 w-14 rounded-md bg-white object-contain p-1"
                />
                <button
                  type="button"
                  onClick={() => set('logoDataUrl', undefined)}
                  className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold text-[var(--danger)] hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus logo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] p-3.5 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--surface-3)] hover:text-[var(--ink-soft)]"
              >
                <Upload className="w-4 h-4" /> Pilih gambar logo (maks 500KB)
              </button>
            )}
            {logoError && <p className={errCls}>{logoError}</p>}
          </div>

          {/* Tahun ajaran + semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="kop-tahun">Tahun ajaran {wajib}</label>
              <input
                id="kop-tahun"
                value={form.tahunAjaran ?? ''}
                onChange={(e) => set('tahunAjaran', e.target.value)}
                className="apple-input"
                placeholder="Contoh: 2026/2027"
              />
              {fieldErr('tahunAjaran')}
            </div>
            <div>
              <label className={labelCls} htmlFor="kop-semester">Semester</label>
              <select
                id="kop-semester"
                value={form.semester ?? ''}
                onChange={(e) => set('semester', e.target.value || undefined)}
                className="apple-input"
              >
                <option value="">— Pilih —</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          {/* Guru */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="kop-nama-guru">Nama guru {wajib}</label>
              <input
                id="kop-nama-guru"
                value={form.namaGuru ?? ''}
                onChange={(e) => set('namaGuru', e.target.value)}
                className="apple-input"
                placeholder="Nama lengkap beserta gelar"
              />
              {fieldErr('namaGuru')}
            </div>
            <div>
              <label className={labelCls} htmlFor="kop-nip-guru">NIP guru</label>
              <input
                id="kop-nip-guru"
                value={form.nipGuru ?? ''}
                onChange={(e) => set('nipGuru', e.target.value)}
                className="apple-input"
                placeholder="18 digit bila PNS/PPPK"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Kepsek */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="kop-nama-kepsek">
                Nama kepala satuan pendidikan {wajib}
              </label>
              <input
                id="kop-nama-kepsek"
                value={form.namaKepsek ?? ''}
                onChange={(e) => set('namaKepsek', e.target.value)}
                className="apple-input"
                placeholder="Nama lengkap beserta gelar"
              />
              {fieldErr('namaKepsek')}
            </div>
            <div>
              <label className={labelCls} htmlFor="kop-nip-kepsek">NIP kepala satuan pendidikan</label>
              <input
                id="kop-nip-kepsek"
                value={form.nipKepsek ?? ''}
                onChange={(e) => set('nipKepsek', e.target.value)}
                className="apple-input"
                placeholder="18 digit bila PNS/PPPK"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Kota & tanggal */}
          <div>
            <label className={labelCls} htmlFor="kop-kota-tanggal">Kota &amp; tanggal {wajib}</label>
            <input
              id="kop-kota-tanggal"
              value={form.kotaTanggal ?? ''}
              onChange={(e) => set('kotaTanggal', e.target.value)}
              className="apple-input"
              placeholder="Contoh: Panyabungan, 17 Oktober 2026"
            />
            {fieldErr('kotaTanggal')}
          </div>
        </div>

        {/* Aksi */}
        <div className="modal-action shrink-0 border-t border-[var(--line)] px-5 py-3.5">
          <button type="button" onClick={onBatal} className="btn-apple-secondary">
            Batal
          </button>
          <button type="button" onClick={handleSimpan} className="btn-apple">
            Simpan
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onBatal} />
    </div>
  );
};
