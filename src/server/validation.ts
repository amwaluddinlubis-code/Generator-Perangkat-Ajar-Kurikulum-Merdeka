import { LIMITS, PASSWORD_MIN_LENGTH, isNonEmptyString, exceedsLength } from './security.js';
import { isAgamaMapel } from './curriculumRefs.js';

export const DOC_TYPES = [
  'modul_ajar',
  'rpp',
  'soal_ujian',
  'kktp_atp',
  'lkpd',
  'prota_promes',
  'modul_p5'
] as const;

export const JENJANGS = ['SD', 'SMP', 'SMA', 'SMK'] as const;

type Jenjang = typeof JENJANGS[number];
type DocType = typeof DOC_TYPES[number];

export interface ValidationResult<T = unknown> {
  ok: boolean;
  value?: T;
  errors: string[];
}

function cleanOptionalText(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || exceedsLength(value, maxLength)) return undefined;
  return value.trim();
}

export function validateLoginPayload(body: unknown): ValidationResult<{
  email: string;
  name?: string;
  schoolName?: string;
  mataPelajaran?: string;
  password?: string;
}> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload login harus berupa object.'] };
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === 'string' ? input.email.toLowerCase().trim() : '';
  if (!isNonEmptyString(email, LIMITS.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, errors: ['Email tidak valid.'] };
  }

  const name = cleanOptionalText(input.name, LIMITS.name);
  const schoolName = cleanOptionalText(input.schoolName, LIMITS.schoolName);
  const mataPelajaran = cleanOptionalText(input.mataPelajaran, LIMITS.subject);

  if (input.name !== undefined && input.name !== null && !name) return { ok: false, errors: ['Nama tidak valid.'] };
  if (input.schoolName !== undefined && input.schoolName !== null && !schoolName) return { ok: false, errors: ['Nama sekolah tidak valid.'] };
  if (input.mataPelajaran !== undefined && input.mataPelajaran !== null && !mataPelajaran) return { ok: false, errors: ['Mata pelajaran tidak valid.'] };

  let password: string | undefined;
  if (input.password !== undefined && input.password !== null && input.password !== '') {
    if (typeof input.password !== 'string' || input.password.length > LIMITS.password) {
      return { ok: false, errors: ['Kata sandi tidak valid.'] };
    }
    password = input.password;
  }

  return { ok: true, value: { email, name, schoolName, mataPelajaran, password }, errors: [] };
}

export function validateUserPatch(body: unknown): ValidationResult<Record<string, unknown>> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload profil harus berupa object.'] };
  }

  const input = body as Record<string, unknown>;
  const errors: string[] = [];

  if (input.name !== undefined && !isNonEmptyString(input.name, LIMITS.name)) errors.push('Nama tidak valid.');
  if (input.schoolName !== undefined && !isNonEmptyString(input.schoolName, LIMITS.schoolName)) errors.push('Nama sekolah tidak valid.');
  if (input.mataPelajaran !== undefined && !isNonEmptyString(input.mataPelajaran, LIMITS.subject)) errors.push('Mata pelajaran tidak valid.');
  if (input.nip !== undefined && typeof input.nip !== 'string') errors.push('NIP tidak valid.');
  if (input.npsn !== undefined && (typeof input.npsn !== 'string' || input.npsn.length > 30)) errors.push('NPSN tidak valid.');
  if (input.jenjang !== undefined && !JENJANGS.includes(input.jenjang as Jenjang)) errors.push('Jenjang tidak valid.');
  if (input.role !== undefined && !['GURU', 'ADMIN'].includes(String(input.role))) errors.push('Peran tidak valid.');

  return errors.length ? { ok: false, errors } : { ok: true, value: input, errors: [] };
}

export function validateDocumentPayload(body: unknown): ValidationResult<Record<string, unknown>> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload dokumen harus berupa object.'] };
  }

  const input = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!isNonEmptyString(input.title, 240)) errors.push('Judul dokumen wajib diisi.');
  if (!isNonEmptyString(input.content, LIMITS.documentContent)) errors.push('Konten dokumen tidak valid.');
  if (!DOC_TYPES.includes(input.docType as DocType)) errors.push('Jenis dokumen tidak valid.');
  if (input.tingkat !== undefined && (typeof input.tingkat !== 'string' || input.tingkat.length > 80)) errors.push('Tingkat tidak valid.');
  if (input.fase !== undefined && (typeof input.fase !== 'string' || input.fase.length > 40)) errors.push('Fase tidak valid.');
  if (input.mataPelajaran !== undefined && (typeof input.mataPelajaran !== 'string' || input.mataPelajaran.length > LIMITS.subject)) errors.push('Mata pelajaran tidak valid.');
  if (input.topik !== undefined && (typeof input.topik !== 'string' || input.topik.length > LIMITS.topic)) errors.push('Topik tidak valid.');
  if (input.durationMinutes !== undefined && (
    typeof input.durationMinutes !== 'number' ||
    !Number.isFinite(input.durationMinutes) ||
    input.durationMinutes < 0 ||
    input.durationMinutes > 999
  )) errors.push('Durasi dokumen tidak valid.');

  return errors.length ? { ok: false, errors } : { ok: true, value: input, errors: [] };
}

export function validateGeneratorPayload(body: unknown): ValidationResult<Record<string, unknown>> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload generator harus berupa object.'] };
  }

  const input = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!DOC_TYPES.includes(input.docType as DocType)) errors.push('Jenis dokumen generator tidak valid.');
  if (!isNonEmptyString(input.mataPelajaran, LIMITS.subject)) errors.push('Mata pelajaran wajib diisi.');
  if (!isNonEmptyString(input.topik, LIMITS.topic)) errors.push('Topik wajib diisi.');

  for (const key of ['tingkat', 'fase', 'alokasiWaktu', 'modelPembelajaran', 'targetPeserta'] as const) {
    if (input[key] !== undefined && (typeof input[key] !== 'string' || exceedsLength(input[key], LIMITS.generatorField))) {
      errors.push(`Field ${key} terlalu panjang atau tidak valid.`);
    }
  }

  if (input.dimensiP5 !== undefined && (
    !Array.isArray(input.dimensiP5) ||
    input.dimensiP5.length > 12 ||
    input.dimensiP5.some(value => typeof value !== 'string' || value.length > 200)
  )) {
    errors.push('Dimensi P5 tidak valid.');
  }

  if (input.soalConfig !== undefined && input.docType === 'soal_ujian') {
    if (!input.soalConfig || typeof input.soalConfig !== 'object' || Array.isArray(input.soalConfig)) {
      errors.push('Konfigurasi soal tidak valid.');
    } else {
      const config = input.soalConfig as Record<string, unknown>;
      // Cara baru: jumlah per bentuk (panel kartu). Hadir bila salah satu kunci jumlah* diisi.
      const perBentukKeys = ['jumlahPG', 'jumlahPGKompleks', 'jumlahMenjodohkan', 'jumlahIsianSingkat', 'jumlahUraian'];
      const hasPerBentuk = perBentukKeys.some(key => config[key] !== undefined);
      if (hasPerBentuk) {
        let total = 0;
        for (const key of perBentukKeys) {
          const v = config[key];
          if (v === undefined || v === null) continue;
          if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 50) {
            errors.push('Jumlah tiap bentuk soal harus bilangan bulat 0–50.');
            break;
          }
          total += v;
        }
        if (total < 1 || total > 200) errors.push('Total soal per bentuk harus 1–200 butir.');
      }
      if (config.jumlahSoal !== undefined && (
        typeof config.jumlahSoal !== 'number' ||
        !Number.isInteger(config.jumlahSoal) ||
        config.jumlahSoal < 1 ||
        config.jumlahSoal > 200
      )) errors.push('Jumlah soal harus antara 1 dan 200.');
      if (config.bentukSoal !== undefined && (
        !Array.isArray(config.bentukSoal) ||
        config.bentukSoal.length > 10 ||
        config.bentukSoal.some(value => typeof value !== 'string' || value.length > 100)
      )) errors.push('Bentuk soal tidak valid.');
      if (config.jumlahOpsiPilihanGanda !== undefined && (
        typeof config.jumlahOpsiPilihanGanda !== 'number' ||
        !Number.isInteger(config.jumlahOpsiPilihanGanda) ||
        config.jumlahOpsiPilihanGanda < 2 || config.jumlahOpsiPilihanGanda > 6
      )) errors.push('Jumlah opsi pilihan ganda harus antara 2 dan 6.');
      if (config.levelKognitif !== undefined && (typeof config.levelKognitif !== 'string' || config.levelKognitif.length > 100)) {
        errors.push('Level kognitif tidak valid.');
      }
      if (config.komposisi !== undefined) {
        const k = config.komposisi as Record<string, unknown>;
        const parts = ['mudah', 'sedang', 'sukar'].map(key => Number((k as any)?.[key]));
        if (
          !k || typeof k !== 'object' || Array.isArray(k) ||
          parts.some(v => !Number.isFinite(v) || v < 0 || v > 100)
        ) {
          errors.push('Komposisi kesulitan harus angka 0–100 per tingkat.');
        } else if (parts[0] + parts[1] + parts[2] !== 100) {
          errors.push('Komposisi kesulitan harus total 100%.');
        }
      }
    }
  }

  if (input.catatanTambahan !== undefined) {
    if (!input.catatanTambahan || typeof input.catatanTambahan !== 'object' || Array.isArray(input.catatanTambahan)) {
      errors.push('Catatan tambahan tidak valid.');
    } else {
      const notes = input.catatanTambahan as Record<string, unknown>;
      if (notes.temaP5 !== undefined && (typeof notes.temaP5 !== 'string' || notes.temaP5.length > LIMITS.generatorField)) errors.push('Tema P5 terlalu panjang.');
      if (notes.instruksiKhusus !== undefined && (typeof notes.instruksiKhusus !== 'string' || notes.instruksiKhusus.length > LIMITS.generatorField)) errors.push('Instruksi khusus terlalu panjang.');
      if (notes.lampiran !== undefined && (!Array.isArray(notes.lampiran) || notes.lampiran.length > 10 || notes.lampiran.some(v => typeof v !== 'string' || v.length > 100))) errors.push('Daftar lampiran tidak valid.');
      for (const field of ['fokusRpp', 'pendekatanKktp', 'semesterProta', 'tahunAjaran']) {
        const v = notes[field];
        if (v !== undefined && (typeof v !== 'string' || v.length > 100)) errors.push(`Kolom ${field} tidak valid.`);
      }
      if (notes.jumlahAktivitas !== undefined && (typeof notes.jumlahAktivitas !== 'number' || !Number.isInteger(notes.jumlahAktivitas) || notes.jumlahAktivitas < 1 || notes.jumlahAktivitas > 10)) errors.push('Jumlah aktivitas tidak valid.');
      if (notes.kunciLkpd !== undefined && typeof notes.kunciLkpd !== 'boolean') errors.push('Flag kunci LKPD tidak valid.');
    }
  }

  if (input.classroomContext !== undefined) {
    if (!input.classroomContext || typeof input.classroomContext !== 'object' || Array.isArray(input.classroomContext)) {
      errors.push('Konteks kelas tidak valid.');
    } else {
      const context = input.classroomContext as Record<string, unknown>;
      for (const field of ['teacherStory', 'studentProfile', 'learningNeeds', 'localContext', 'priorKnowledge', 'emotionalConsiderations', 'teacherIntent']) {
        if (context[field] !== undefined && (typeof context[field] !== 'string' || exceedsLength(context[field], LIMITS.generatorField))) {
          errors.push(`Konteks ${field} terlalu panjang atau tidak valid.`);
        }
      }
      if (context.teacherVoice !== undefined && !['hangat', 'reflektif', 'praktis', 'dialogis', 'kreatif'].includes(String(context.teacherVoice))) {
        errors.push('Gaya suara guru tidak valid.');
      }
    }
  }

  const promptSize = [
    input.mataPelajaran,
    input.topik,
    input.alokasiWaktu,
    input.modelPembelajaran,
    input.targetPeserta,
    Array.isArray(input.dimensiP5) ? input.dimensiP5.join(',') : '',
    JSON.stringify(input.soalConfig || {}),
    JSON.stringify(input.catatanTambahan || {}),
    JSON.stringify(input.classroomContext || {})
  ].join('\n').length;

  if (promptSize > LIMITS.generatorPromptTotal) errors.push('Total input generator terlalu panjang.');

  return errors.length ? { ok: false, errors } : { ok: true, value: input, errors: [] };
}

export function validateImagePayload(body: unknown): ValidationResult<{ prompt: string; aspectRatio?: string }> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, errors: ['Payload gambar tidak valid.'] };
  const input = body as Record<string, unknown>;
  if (!isNonEmptyString(input.prompt, LIMITS.imagePrompt)) return { ok: false, errors: ['Prompt gambar wajib diisi.'] };
  if (input.aspectRatio !== undefined && !['1:1', '4:3', '3:4', '16:9', '9:16'].includes(String(input.aspectRatio))) {
    return { ok: false, errors: ['Rasio gambar tidak didukung.'] };
  }
  return { ok: true, value: { prompt: input.prompt.trim(), aspectRatio: input.aspectRatio ? String(input.aspectRatio) : undefined }, errors: [] };
}

export function validatePasswordPayload(body: unknown): ValidationResult<{
  currentPassword?: string;
  newPassword: string;
}> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload kata sandi harus berupa object.'] };
  }

  const input = body as Record<string, unknown>;
  const { newPassword } = input;
  if (
    typeof newPassword !== 'string' ||
    newPassword.length < PASSWORD_MIN_LENGTH ||
    newPassword.length > LIMITS.password
  ) {
    return { ok: false, errors: [`Kata sandi baru minimal ${PASSWORD_MIN_LENGTH} karakter dan maksimal ${LIMITS.password} karakter.`] };
  }

  let currentPassword: string | undefined;
  if (input.currentPassword !== undefined && input.currentPassword !== null && input.currentPassword !== '') {
    if (typeof input.currentPassword !== 'string' || (input.currentPassword as string).length > LIMITS.password) {
      return { ok: false, errors: ['Kata sandi saat ini tidak valid.'] };
    }
    currentPassword = input.currentPassword as string;
  }

  return { ok: true, value: { currentPassword, newPassword }, errors: [] };
}

export function validateGeneratedDocument(title: unknown, content: unknown): ValidationResult<{ title: string; content: string }> {
  if (!isNonEmptyString(title, 240) || !isNonEmptyString(content, LIMITS.documentContent)) {
    return { ok: false, errors: ['Output generator kosong atau melebihi batas ukuran.'] };
  }

  const text = String(content);
  const suspiciousSecretPatterns = [
    /AIza[0-9A-Za-z_-]{30,}/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    /(?:api[_ -]?key|secret[_ -]?key)\s*[:=]\s*[A-Za-z0-9_-]{20,}/i
  ];

  if (suspiciousSecretPatterns.some(pattern => pattern.test(text))) {
    return { ok: false, errors: ['Output generator mengandung pola kredensial yang tidak boleh diteruskan.'] };
  }

  return {
    ok: true,
    value: { title: String(title).trim(), content: text },
    errors: []
  };
}

export const SCHOOL_ACCREDITATIONS = ['A', 'B', 'C', 'Belum Terakreditasi'] as const;

/** Logo sekolah: data-URL PNG/JPEG/WebP, maksimal ~500KB. */
export const LOGO_MAX_BASE64_CHARS = 700_000;

export function validateSchoolPayload(body: unknown): ValidationResult<Record<string, string>> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload sekolah harus berupa object.'] };
  }

  const input = body as Record<string, unknown>;
  const value: Record<string, string> = {};
  const rules: Array<[string, number, string?]> = [
    ['name', 200],
    ['npsn', 20],
    ['address', 300],
    ['city', 100],
    ['principalName', 160],
    ['principalNip', 30]
  ];

  for (const [field, max] of rules) {
    const raw = input[field];
    if (raw === undefined || raw === null || raw === '') continue;
    if (typeof raw !== 'string' || !raw.trim() || raw.trim().length > max) {
      return { ok: false, errors: [`Kolom ${field} tidak valid (maksimal ${max} karakter).`] };
    }
    value[field] = raw.trim();
  }

  const accreditation = input.accreditation;
  if (accreditation !== undefined && accreditation !== null && accreditation !== '') {
    if (typeof accreditation !== 'string' || !(SCHOOL_ACCREDITATIONS as readonly string[]).includes(accreditation)) {
      return { ok: false, errors: ['Akreditasi tidak valid.'] };
    }
    value.accreditation = accreditation;
  }

  if (Object.keys(value).length === 0) {
    return { ok: false, errors: ['Tidak ada perubahan yang dikirim.'] };
  }

  return { ok: true, value, errors: [] };
}

export function validateLogoPayload(body: unknown): ValidationResult<{ imageData: string; ext: string }> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: ['Payload logo harus berupa object.'] };
  }

  const imageData = (body as Record<string, unknown>).imageData;
  if (typeof imageData !== 'string') {
    return { ok: false, errors: ['Data gambar wajib diisi.'] };
  }

  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(imageData.trim());
  if (!match) {
    return { ok: false, errors: ['Format logo harus PNG, JPEG, atau WebP (data-URL).'] };
  }
  if (imageData.length > LOGO_MAX_BASE64_CHARS) {
    return { ok: false, errors: ['Ukuran logo maksimal ~500KB.'] };
  }

  return { ok: true, value: { imageData: imageData.trim(), ext: match[1] === 'jpeg' ? 'jpg' : match[1] }, errors: [] };
}

export interface DocumentQuality {
  status: 'AI' | 'fallback' | 'needs_review';
  issues: string[];
  stats: { chars: number; tables: number; questions: number };
}

const PLACEHOLDER_PATTERNS = [
  /\[isi[^\]]*\]/i,
  /\[contoh[^\]]*\]/i,
  /\[tulis[^\]]*\]/i,
  /\blorem ipsum\b/i,
  /\bTBD\b/,
  /TODO:\s*isi/i,
  /\(dan seterusnya/i,
  /contoh untuk nomor/i,
  /\(nomor \d+\s*[-–]/i,
  /disesuaikan dengan variasi/i
];

/** Penanda struktur minimum per jenis dokumen (case-insensitive). */
const STRUCTURE_MARKERS: Record<string, Array<{ label: string; patterns: RegExp[] }>> = {
  modul_ajar: [
    { label: 'Informasi Umum', patterns: [/informasi umum/i] },
    { label: 'Capaian/Tujuan Pembelajaran', patterns: [/capaian pembelajaran/i, /tujuan pembelajaran/i] },
    { label: 'Kegiatan pembelajaran', patterns: [/kegiatan (pembelajaran|inti|pendahuluan|penutup)/i, /langkah(-langkah)? pembelajaran/i] },
    { label: 'Asesmen/KKTP', patterns: [/asesmen/i, /kktp/i, /rubrik/i] },
    { label: 'LKPD/lampiran', patterns: [/lkpd/i, /lampiran/i, /glosarium/i] }
  ],
  rpp: [
    { label: 'Tujuan Pembelajaran', patterns: [/tujuan pembelajaran/i] },
    { label: 'Langkah pembelajaran', patterns: [/langkah(-langkah)?/i, /pendahuluan/i, /penutup/i] },
    { label: 'Asesmen', patterns: [/asesmen/i, /penilaian/i] }
  ],
  soal_ujian: [
    { label: 'Kisi-kisi', patterns: [/kisi-?kisi/i] },
    { label: 'Butir soal', patterns: [/soal\s*\d/i, /pilihan ganda/i] },
    { label: 'Kunci/pembahasan', patterns: [/kunci/i, /pembahasan/i, /pedoman/i, /penskoran/i] }
  ],
  lkpd: [
    { label: 'Petunjuk', patterns: [/petunjuk/i] },
    { label: 'Aktivitas/tabel isian', patterns: [/aktivitas/i, /\|.*\|/] },
    { label: 'Refleksi/penilaian', patterns: [/refleksi/i, /rubrik/i, /penilaian/i, /kesimpulan/i] }
  ],
  kktp_atp: [
    { label: 'ATP', patterns: [/\batp\b/i, /alur tujuan/i] },
    { label: 'KKTP', patterns: [/kktp/i, /ketercapaian/i, /ketuntasan/i] },
    { label: 'Rubrik/interval', patterns: [/rubrik/i, /interval/i, /remedial/i] }
  ],
  prota_promes: [
    { label: 'Prota', patterns: [/prota/i, /program tahunan/i] },
    { label: 'Promes/semester', patterns: [/promes/i, /semester/i] },
    { label: 'Alokasi/minggu', patterns: [/alokasi/i, /minggu/i, /jp\b/i] }
  ],
  modul_p5: [
    { label: 'Tema/profil modul', patterns: [/tema/i, /profil modul/i, /dimensi/i] },
    { label: 'Tahapan projek', patterns: [/tahap/i, /pengenalan/i, /aksi/i] },
    { label: 'Asesmen/refleksi', patterns: [/asesmen/i, /refleksi/i, /gelar karya/i, /rubrik/i] }
  ]
};

/**
 * Validasi struktur minimum hasil dokumen.
 * Mengembalikan status jujur: AI / fallback / needs_review + daftar masalah.
 */
export function validateDocumentStructure(
  docType: string,
  content: string,
  opts?: { expectedQuestions?: number; modelUsed?: string; mapel?: string; classroomContext?: Record<string, unknown> }
): DocumentQuality {
  const text = String(content || '');
  const stats = {
    chars: text.length,
    tables: (text.match(/^\s*\|.*\|\s*$/gm) || []).filter(line => !/^\s*\|[\s:\-|]*\|\s*$/.test(line)).length,
    questions: (text.match(/(?:^|\n)\s*(?:\*\*)?(?:soal|nomor|butir)\s+\d+/gi) || []).length
  };
  const issues: string[] = [];

  const humanContext = opts?.classroomContext;
  const humanFields = humanContext ? ['studentProfile', 'learningNeeds', 'localContext', 'priorKnowledge', 'emotionalConsiderations'] : [];
  const humanFilled = humanFields.filter(field => typeof humanContext?.[field] === 'string' && String(humanContext[field]).trim().length >= 10).length;
  if (humanContext) {
    if (String(humanContext.teacherStory || '').trim().length < 20) issues.push('Cerita guru terlalu singkat; tambahkan pengalaman atau alasan pedagogis yang nyata.');
    if (String(humanContext.teacherIntent || '').trim().length < 10) issues.push('Niat guru belum cukup jelas untuk memandu keputusan pembelajaran.');
    if (humanFilled < 2) issues.push('Profil/kebutuhan/konteks murid belum cukup untuk personalisasi dokumen.');
  }

  if (stats.chars < 800) issues.push('Dokumen terlalu pendek (di bawah 800 karakter) — kemungkinan terpotong.');
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(text)) {
      issues.push('Ditemukan placeholder kosong ([...], lorem, TBD) yang harus dilengkapi manual.');
      break;
    }
  }

  const markers = STRUCTURE_MARKERS[docType];
  if (markers) {
    for (const marker of markers) {
      if (!marker.patterns.some(pattern => pattern.test(text))) {
        issues.push(`Bagian "${marker.label}" tidak terdeteksi — periksa kelengkapan dokumen.`);
      }
    }
  }

  // Mapel Agama & Budi Pekerti (BKPDM 020/2026): wajib memuat dimensi pengamalan.
  if (opts?.mapel && isAgamaMapel(opts.mapel)) {
    if (!/(pengamalan|mengamalkan|akhlak)/i.test(text)) {
      issues.push('Dokumen mapel Agama belum memuat dimensi "pengamalan nilai" sesuai BKPDM 020 Tahun 2026.');
    }
  }

  if (docType === 'soal_ujian' && opts?.expectedQuestions && opts.expectedQuestions > 0) {
    if (stats.questions > 0 && stats.questions < opts.expectedQuestions) {
      issues.push(`Jumlah soal terdeteksi (${stats.questions}) kurang dari permintaan (${opts.expectedQuestions}).`);
    }
    if (stats.questions === 0) {
      issues.push('Tidak terdeteksi penomoran soal — periksa format butir soal.');
    }
    // Cakupan kunci: setiap nomor 1..N wajib muncul di seksi kunci (format "No 1:",
    // "Nomor 3-5:", atau baris tabel "| 1 | ..."). Menangkap dokumen yang hanya
    // memberi kunci contoh (mis. No 1, 11, 41 dari 50 soal).
    const kunciIdx = text.search(/kunci jawaban/i);
    if (kunciIdx >= 0) {
      const kunciText = text.slice(kunciIdx);
      const covered = new Set<number>();
      const collect = (pattern: RegExp) => {
        for (const m of kunciText.matchAll(pattern)) {
          const groups = m.slice(1).map(Number).filter(n => n >= 1 && n <= (opts.expectedQuestions as number));
          if (groups.length >= 2) {
            const a = Math.min(groups[0], groups[1]);
            const b = Math.max(groups[0], groups[1]);
            for (let n = a; n <= b; n++) covered.add(n);
          } else if (groups.length === 1) {
            covered.add(groups[0]);
          }
        }
      };
      collect(/(?:no|nomor)\.?\s*(\d+)\s*[-–]\s*(\d+)/gi);
      collect(/(?:no|nomor)\.?\s*(\d+)/gi);
      collect(/^\s*\|\s*(\d+)\s*\|/gim);
      if (covered.size === 0) {
        issues.push('Kunci jawaban tidak memuat nomor soal yang jelas — gunakan format "No 1:", "No 2:", dst.');
      } else if (covered.size < (opts.expectedQuestions as number)) {
        issues.push(`Kunci jawaban hanya mencakup ${covered.size} dari ${opts.expectedQuestions} soal — lengkapi kunci untuk semua nomor.`);
      }
    }
  }

  const isAi = /gemini/i.test(opts?.modelUsed || '');
  return { status: !isAi ? 'fallback' : issues.length > 0 ? 'needs_review' : 'AI', issues, stats };
}
