import React, { useEffect, useState } from 'react';
import { TeacherUser, SchoolConfig } from '../types';
import { Building2, Save, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';

interface SchoolSettingsPageProps {
  currentUser: TeacherUser;
  onSchoolUpdated: (school: SchoolConfig) => void;
}

const ACCREDITATIONS = ['', 'A', 'B', 'C', 'Belum Terakreditasi'];

export const SchoolSettingsPage: React.FC<SchoolSettingsPageProps> = ({
  currentUser,
  onSchoolUpdated,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const [schoolId, setSchoolId] = useState<string>(currentUser.schoolId);
  const [schoolList, setSchoolList] = useState<Array<{ id: string; name: string; jenjang: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [name, setName] = useState('');
  const [npsn, setNpsn] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalNip, setPrincipalNip] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const loadSchool = async (id: string) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/schools/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Gagal memuat data sekolah');
      const s = data.school as SchoolConfig;
      setName(s.name || '');
      setNpsn(s.npsn || '');
      setAddress(s.address || '');
      setCity(s.city || '');
      setAccreditation(s.accreditation || '');
      setPrincipalName(s.principalName || '');
      setPrincipalNip(s.principalNip || '');
      setLogoUrl(s.logoUrl || '');
    } catch (err: any) {
      setMsg({ ok: false, text: err.message || 'Gagal memuat data sekolah' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (isSuperAdmin) {
        try {
          const res = await fetch('/api/admin/schools');
          const data = await res.json();
          if (res.ok && Array.isArray(data.schools)) setSchoolList(data.schools);
        } catch { /* abaikan */ }
      }
      await loadSchool(schoolId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSchool(schoolId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, npsn, address, city, accreditation, principalName, principalNip })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Gagal menyimpan');
      onSchoolUpdated(data.school as SchoolConfig);
      setMsg({ ok: true, text: 'Identitas sekolah tersimpan — kop dokumen kini memakainya.' });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message || 'Gagal menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setMsg({ ok: false, text: 'Logo harus PNG, JPEG, atau WebP.' });
      return;
    }
    if (file.size > 500 * 1024) {
      setMsg({ ok: false, text: 'Ukuran logo maksimal 500KB.' });
      return;
    }
    setUploading(true);
    setMsg(null);
    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Gagal membaca berkas'));
        reader.readAsDataURL(file);
      });
      const res = await fetch(`/api/admin/schools/${schoolId}/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Gagal mengunggah logo');
      setLogoUrl((data.school as SchoolConfig).logoUrl || '');
      onSchoolUpdated(data.school as SchoolConfig);
      setMsg({ ok: true, text: 'Logo berhasil diunggah.' });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message || 'Gagal mengunggah logo' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="text-center max-w-xl mx-auto">
        <p className="apple-eyebrow">Administrasi</p>
        <h2 className="apple-headline !text-[28px] sm:!text-[34px] mt-1">Identitas sekolah.</h2>
        <p className="apple-sub mt-2 !text-[15px]">
          Kop, logo, dan pengesahan di semua dokumen memakai data ini — isi sekali, berlaku selamanya.
        </p>
      </div>

      {isSuperAdmin && schoolList.length > 0 && (
        <div className="apple-card p-4 flex items-center gap-3">
          <Building2 className="w-5 h-5 shrink-0" />
          <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="apple-input" aria-label="Pilih sekolah">
            {schoolList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.jenjang})</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="apple-card p-12 text-center text-[14px] text-[#6e6e73] dark:text-[#98989d]">
          Memuat data sekolah...
        </div>
      ) : (
        <>
          {/* Pratinjau kop mini */}
          <div className="apple-card p-6 text-center" style={{ fontFamily: 'Calibri, Segoe UI, Arial, sans-serif' }}>
            <div className="flex items-center justify-center gap-3">
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />}
              <div>
                <p className="text-[10px] font-bold tracking-wider">KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</p>
                <p className="text-[10px] font-bold tracking-wider">DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</p>
                <p className="text-[17px] font-bold uppercase leading-tight">{name || 'Nama Sekolah'}</p>
              </div>
            </div>
            <p className="text-[10px] italic text-[#555] mt-1">
              {address ? `${address} • ` : ''}NPSN: {npsn || '............'}{accreditation ? ` • Akreditasi ${accreditation}` : ''}
            </p>
            <div className="border-t-[3px] border-double border-black mt-2 pt-2 text-[11px] text-left grid grid-cols-2 gap-4">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p><b>Kepala Satuan Pendidikan</b></p>
                <p className="mt-8 font-bold underline underline-offset-4">{principalName || '( Nama Kepala Sekolah )'}</p>
                <p className="text-[10px]">NIP. {principalNip || '........................'}</p>
              </div>
              <div className="text-center">
                <p>{city || 'Kota'}, .................... 20....</p>
                <p><b>Guru Mata Pelajaran / Kelas</b></p>
                <p className="mt-8 font-bold underline underline-offset-4">( Nama Guru )</p>
                <p className="text-[10px]">NIP. ........................</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-3.5">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Nama sekolah *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="apple-input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">NPSN</label>
                <input value={npsn} onChange={(e) => setNpsn(e.target.value)} className="apple-input" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Akreditasi</label>
                <select value={accreditation} onChange={(e) => setAccreditation(e.target.value)} className="apple-input">
                  <option value="">— Belum diatur —</option>
                  <option value="A">A (Unggul)</option>
                  <option value="B">B (Baik Sekali)</option>
                  <option value="C">C (Baik)</option>
                  <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Alamat</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Pendidikan No. 1" className="apple-input" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Kota (tempat tanda tangan)</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jakarta" className="apple-input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Nama kepala sekolah</label>
                <input value={principalName} onChange={(e) => setPrincipalName(e.target.value)} placeholder="Drs. ..., M.Pd." className="apple-input" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">NIP kepala sekolah</label>
                <input value={principalNip} onChange={(e) => setPrincipalNip(e.target.value)} className="apple-input" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5">Logo sekolah (PNG/JPG/WebP, ≤500KB)</label>
              <div className="flex items-center gap-3">
                {logoUrl && <img src={logoUrl} alt="Logo sekolah" className="w-12 h-12 object-contain rounded-xl bg-black/5 dark:bg-white/10 p-1" />}
                <label className="btn-apple-secondary !min-h-[40px] cursor-pointer">
                  {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Mengunggah...' : logoUrl ? 'Ganti logo' : 'Unggah logo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>

            {msg && (
              <div className={`rounded-xl px-4 py-3 text-[13px] flex items-center gap-2 ${msg.ok ? 'bg-[#30b158]/10' : 'bg-[#ff3b30]/10'}`}>
                {msg.ok && <CheckCircle2 className="w-4 h-4 text-[#30b158] shrink-0" />}
                {msg.text}
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-apple w-full">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan identitas sekolah'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
