import { agamaCpGuidance, isAgamaMapel } from '../curriculumRefs.js';
import {
  KNOWLEDGE,
  PERSONA,
  PROMPT_VERSION,
  ROLE_STYLE,
  SECURITY_BOUNDARY,
  WRITING_GUIDE,
  renderUserData
} from './base.js';
import { kktpAtpSpec } from './kktp_atp.js';
import { lkpdSpec } from './lkpd.js';
import { modulAjarSpec } from './modul_ajar.js';
import { modulP5Spec } from './modul_p5.js';
import { protaPromesSpec } from './prota_promes.js';
import { rppSpec } from './rpp.js';
import { soalUjianSpec } from './soal_ujian.js';
import type { PromptContext, PromptSpec } from './types.js';

export { PROMPT_VERSION };
export { buildSectionPrompt } from './section.js';
export type { PromptContext, PromptSpec };

const REGISTRY: Record<string, PromptSpec> = {
  modul_ajar: modulAjarSpec,
  rpp: rppSpec,
  soal_ujian: soalUjianSpec,
  kktp_atp: kktpAtpSpec,
  lkpd: lkpdSpec,
  prota_promes: protaPromesSpec,
  modul_p5: modulP5Spec
};

export function getPromptSpec(docType: string): PromptSpec {
  return REGISTRY[docType] || modulAjarSpec;
}

/** Rakit prompt lengkap: persona + pengetahuan + data guru + instruksi spesifik + panduan. */
export function buildGeneratorPrompt(ctx: PromptContext): string {
  const spec = getPromptSpec(ctx.docType);
  const agama = isAgamaMapel(ctx.mataPelajaran) ? agamaCpGuidance(ctx.mataPelajaran, ctx.fase) : '';
  const userData = renderUserData(ctx, agama).replace('%specificInstructions%', spec.render(ctx));
  return [
    PERSONA,
    'Anda memiliki pemahaman operasional dan mendalam tentang:',
    ...KNOWLEDGE.map(line => `- ${line}`),
    '',
    ROLE_STYLE,
    '',
    SECURITY_BOUNDARY,
    '',
    userData,
    '',
    'PANDUAN PENULISAN & KUALITAS KONTEN (CRITICAL - WAJIB DIPATUHI):',
    ...WRITING_GUIDE.map((rule, index) => `${index + 1}. ${rule}`),
    ''
  ].join('\n');
}

/**
 * Validasi struktural prompt hasil rakitan.
 * Mengembalikan daftar masalah (kosong = valid).
 */
export function validateBuiltPrompt(prompt: string, ctx: PromptContext): string[] {
  const issues: string[] = [];
  if (!prompt || prompt.length < 500) issues.push('Prompt terlalu pendek.');
  if (prompt.length > 20000) issues.push('Prompt melebihi batas ukuran.');
  if (/\$\{[^}]+\}/.test(prompt)) issues.push('Ada interpolasi tak terisi (${...}).');
  if (!prompt.includes('<USER_DATA>')) issues.push('Blok USER_DATA hilang.');
  if (!prompt.includes('PANDUAN PENULISAN')) issues.push('Panduan penulisan hilang.');
  if (!prompt.includes(ctx.mataPelajaran) || !prompt.includes(ctx.topik)) {
    issues.push('Parameter guru (mapel/topik) hilang dari prompt.');
  }
  return issues;
}
