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

  const fieldErr = (k: string) =>
    errors[k] ? (
      <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">{errors[k]}</p>
    ) : null;

  const labelCls = 'block text-[13px] font-semibold mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 no-print"
      onClick={onBatal}
    >
      <div
        className="apple-card max-w-lg w-full p-6 ux-pop-in !rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Kop dan lembar pengesahan"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[17px] font-semibold tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Kop &amp; Lembar Pengesahan 🏫
          </h3>
          <button
            onClick={onBatal}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mb-4">
          Isi sekali, otomatis dipakai di semua ekspor dokumen (Word/PDF). Kolom bertanda{' '}
          <span className="text-red-500 font-semibold">*</span> wajib diisi. Data tersimpan di perangkat ini.
        </p>

        {/* Nama sekolah */}
        <div className="mb-3">
          <label className={labelCls}>
            Nama sekolah <span className="text-red-500">*</span>
          </label>
          <input
            value={form.namaSekolah ?? ''}
            onChange={(e) => set('namaSekolah', e.target.value)}
            className="apple-input"
            placeholder="Contoh: SMP Negeri 3 Sinunukan"
          />
          {fieldErr('namaSekolah')}
        </div>

        {/* Alamat */}
        <div className="mb-3">
          <label className={labelCls}>Alamat sekolah</label>
          <textarea
            value={form.alamatSekolah ?? ''}
            onChange={(e) => set('alamatSekolah', e.target.value)}
            rows={2}
            className="apple-input resize-none"
            placeholder="Contoh: Jl. Pendidikan No. 12, Kec. Sinunukan, Kab. Mandailing Natal"
          />
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label className={labelCls}>Logo sekolah</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePilihLogo}
          />
          {form.logoDataUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/5">
              <img
                src={form.logoDataUrl}
                alt="Pratinjau logo sekolah"
                className="h-16 w-16 object-contain rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={() => set('logoDataUrl', undefined)}
                className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Hapus logo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-black/15 dark:border-white/20 text-[13px] font-semibold text-[#6e6e73] dark:text-[#98989d] hover:bg-black/[0.03] dark:hover:bg-white/5 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Pilih gambar logo (maks 500KB)
            </button>
          )}
          {logoError && (
            <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">{logoError}</p>
          )}
        </div>

        {/* Tahun ajaran + semester */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>
              Tahun ajaran <span className="text-red-500">*</span>
            </label>
            <input
              value={form.tahunAjaran ?? ''}
              onChange={(e) => set('tahunAjaran', e.target.value)}
              className="apple-input"
              placeholder="Contoh: 2026/2027"
            />
            {fieldErr('tahunAjaran')}
          </div>
          <div>
            <label className={labelCls}>Semester</label>
            <select
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>
              Nama guru <span className="text-red-500">*</span>
            </label>
            <input
              value={form.namaGuru ?? ''}
              onChange={(e) => set('namaGuru', e.target.value)}
              className="apple-input"
              placeholder="Nama lengkap beserta gelar"
            />
            {fieldErr('namaGuru')}
          </div>
          <div>
            <label className={labelCls}>NIP guru</label>
            <input
              value={form.nipGuru ?? ''}
              onChange={(e) => set('nipGuru', e.target.value)}
              className="apple-input"
              placeholder="18 digit bila PNS/PPPK"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Kepsek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>
              Nama kepala satuan pendidikan <span className="text-red-500">*</span>
            </label>
            <input
              value={form.namaKepsek ?? ''}
              onChange={(e) => set('namaKepsek', e.target.value)}
              className="apple-input"
              placeholder="Nama lengkap beserta gelar"
            />
            {fieldErr('namaKepsek')}
          </div>
          <div>
            <label className={labelCls}>NIP kepala satuan pendidikan</label>
            <input
              value={form.nipKepsek ?? ''}
              onChange={(e) => set('nipKepsek', e.target.value)}
              className="apple-input"
              placeholder="18 digit bila PNS/PPPK"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Kota & tanggal */}
        <div className="mb-4">
          <label className={labelCls}>
            Kota &amp; tanggal <span className="text-red-500">*</span>
          </label>
          <input
            value={form.kotaTanggal ?? ''}
            onChange={(e) => set('kotaTanggal', e.target.value)}
            className="apple-input"
            placeholder="Contoh: Panyabungan, 17 Oktober 2026"
          />
          {fieldErr('kotaTanggal')}
        </div>

        {/* Aksi */}
        <div className="flex gap-3 sticky bottom-0 -mx-6 -mb-6 px-6 pb-1 pt-3 bg-[var(--apple-card)] rounded-b-3xl">
          <button
            type="button"
            onClick={onBatal}
            className="flex-1 py-3 rounded-2xl font-semibold text-[14px] bg-black/[0.06] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSimpan}
            className="flex-1 py-3 rounded-2xl font-semibold text-[14px] text-white bg-[#0071e3] hover:bg-[#0077ed] cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
