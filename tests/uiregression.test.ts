import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { DOC_TYPE_INFO, JENJANG_CONFIGS } from '../src/data/curriculumData.ts';
import { getContextualTopics } from '../src/data/topicCatalog.ts';

const EXPECTED_DOC_TYPES = [
  'modul_ajar',
  'rpp',
  'soal_ujian',
  'lkpd',
  'kktp_atp',
  'prota_promes',
  'modul_p5'
];

test('katalog 7 jenis dokumen lengkap (label, deskripsi, badge)', () => {
  assert.deepEqual(Object.keys(DOC_TYPE_INFO).sort(), [...EXPECTED_DOC_TYPES].sort());
  for (const type of EXPECTED_DOC_TYPES) {
    const info = (DOC_TYPE_INFO as Record<string, any>)[type];
    assert.ok(info.label && info.label.length > 2, `${type} butuh label`);
    assert.ok(info.desc && info.desc.length > 10, `${type} butuh deskripsi`);
    assert.ok(info.badge && info.badge.length > 1, `${type} butuh badge`);
  }
});

test('konfigurasi jenjang konsisten (fase, kelas, mapel default)', () => {
  for (const jenjang of ['SD', 'SMP', 'SMA', 'SMK'] as const) {
    const cfg = JENJANG_CONFIGS[jenjang];
    assert.ok(cfg.fases.length > 0, `${jenjang} wajib punya fase`);
    for (const fase of cfg.fases) {
      assert.match(fase.fase, /^Fase [A-F]/, `format fase ${jenjang}`);
      assert.ok(fase.kelas.length > 0, `${fase.fase} wajib punya kelas`);
    }
    assert.ok(cfg.defaultMapel.length > 0, `${jenjang} wajib punya mapel default`);
  }
  // Struktur fase baku 046/H/KR/2025
  assert.ok(JENJANG_CONFIGS.SD.fases.some(f => f.fase === 'Fase A'));
  assert.ok(JENJANG_CONFIGS.SMP.fases.some(f => f.fase === 'Fase D'));
  assert.ok(JENJANG_CONFIGS.SMA.fases.some(f => f.fase === 'Fase E'));
});

test('saran topik kontekstual tersedia untuk kombinasi umum', () => {
  const sd = getContextualTopics('SD', 'Fase B', 'Kelas 4', 'IPAS (Ilmu Pengetahuan Alam & Sosial)');
  assert.ok(Array.isArray(sd) && sd.length > 0, 'topik SD Fase B IPAS');
  const smp = getContextualTopics('SMP', 'Fase D', 'Kelas 8', 'Matematika');
  assert.ok(Array.isArray(smp) && smp.length > 0, 'topik SMP Matematika');
  for (const item of [...sd, ...smp]) {
    assert.ok(item.topik && item.topik.length > 3, 'setiap topik punya judul');
    assert.ok(item.rekomendasiModel && item.rekomendasiModel.length > 3, 'setiap topik punya rekomendasi model');
  }
});

test('kontrak design system: token dan kelas wajib ada di CSS', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'src', 'index.css'), 'utf8');

  const tokens = [
    '--app-accent', '--app-success', '--app-warning', '--app-danger',
    '--app-radius-sm', '--app-radius-md', '--app-radius-lg',
    '--app-space-1', '--app-space-4', '--app-space-8'
  ];
  for (const token of tokens) {
    assert.ok(css.includes(token), `token ${token} wajib ada`);
  }

  const classes = [
    '.btn-apple', '.btn-apple-secondary', '.btn-danger', '.btn-sm',
    '.apple-input', '.apple-segment',
    '.badge-neutral', '.badge-success', '.badge-warning', '.badge-danger', '.badge-info',
    '.apple-card', '.metric-card',
    '.modal-panel', '.modal-header', '.modal-body', '.modal-footer',
    '.data-table', '.data-table-wrap',
    '.field-label', '.field-required', '.field-hint', '.field-error',
    '.skeleton', '.empty-state',
    '.apple-sidebar-item', '.check-hit'
  ];
  for (const cls of classes) {
    assert.ok(css.includes(cls), `class ${cls} wajib ada`);
  }

  assert.ok(css.includes('prefers-reduced-motion'), 'dukungan reduced-motion wajib ada');
  assert.ok(css.includes(':focus-visible') || css.includes('focus-visible'), 'gaya fokus terlihat wajib ada');
});

test('kontrak navigasi: semua target sidebar punya judul header', () => {
  const header = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'TopHeader.tsx'), 'utf8');
  const sidebar = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'Sidebar.tsx'), 'utf8');
  const typeMatch = sidebar.match(/export type NavigationTarget =([\s\S]*?);/);
  assert.ok(typeMatch, 'tipe NavigationTarget ditemukan');
  const targets = [...typeMatch![1].matchAll(/'([a-z_0-9]+)'/g)].map(m => m[1]);
  assert.ok(targets.includes('dashboard'), 'dashboard terdaftar');
  // Setiap target dokumen punya info katalog; setiap target non-dokumen punya judul di header/app
  const app = fs.readFileSync(path.join(process.cwd(), 'src', 'App.tsx'), 'utf8');
  for (const target of targets) {
    const inHeader = header.includes(`'${target}'`);
    const inApp = app.includes(`'${target}'`);
    const inCatalog = Object.keys(DOC_TYPE_INFO).includes(target);
    assert.ok(inHeader || inApp || inCatalog, `target '${target}' harus dirender di suatu view`);
  }
});
