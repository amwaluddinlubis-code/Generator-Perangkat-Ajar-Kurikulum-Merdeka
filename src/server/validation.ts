import { LIMITS, isNonEmptyString, exceedsLength } from './security.js';

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

  return { ok: true, value: { email, name, schoolName, mataPelajaran }, errors: [] };
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

  if (input.soalConfig !== undefined) {
    if (!input.soalConfig || typeof input.soalConfig !== 'object' || Array.isArray(input.soalConfig)) {
      errors.push('Konfigurasi soal tidak valid.');
    } else {
      const config = input.soalConfig as Record<string, unknown>;
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
      if (config.levelKognitif !== undefined && (typeof config.levelKognitif !== 'string' || config.levelKognitif.length > 100)) {
        errors.push('Level kognitif tidak valid.');
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
    JSON.stringify(input.catatanTambahan || {})
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
