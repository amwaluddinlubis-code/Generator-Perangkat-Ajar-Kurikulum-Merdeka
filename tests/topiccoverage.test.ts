import assert from 'node:assert/strict';
import test from 'node:test';
import { JENJANG_CONFIGS } from '../src/data/curriculumData.ts';
import { CURRICULUM_TOPICS, getContextualTopics } from '../src/data/topicCatalog.ts';
import type { Jenjang } from '../src/types/index.ts';

/** Aturan cocok mapel (cermin getContextualTopics): substring dua arah. */
function mapelMatches(configName: string, key: string, displayName: string): boolean {
  const norm = configName.toLowerCase().trim();
  const k = key.toLowerCase();
  const n = displayName.toLowerCase();
  return norm.includes(k) || k.includes(norm) || norm.includes(n) || n.includes(norm);
}

test('setiap mapel dropdown punya topik presisi di jenjangnya', () => {
  const missing: string[] = [];
  for (const jenjang of ['SD', 'SMP', 'SMA', 'SMK'] as Jenjang[]) {
    for (const mapel of JENJANG_CONFIGS[jenjang].defaultMapel) {
      const hit = CURRICULUM_TOPICS.some(
        item => item.jenjang === jenjang && mapelMatches(mapel, item.mataPelajaranKey, item.mataPelajaranName)
      );
      if (!hit) missing.push(`${jenjang} / ${mapel}`);
    }
  }
  assert.deepEqual(missing, [], `Mapel tanpa topik: ${missing.join('; ')}`);
});

test('enam agama 020/2026 terwakili di semua jenjang', () => {
  const religions = ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'khonghucu'];
  const missing: string[] = [];
  for (const jenjang of ['SD', 'SMP', 'SMA', 'SMK'] as Jenjang[]) {
    for (const religion of religions) {
      const count = CURRICULUM_TOPICS.filter(
        item => item.jenjang === jenjang && item.mataPelajaranKey.includes(religion)
      ).length;
      if (count < 1) missing.push(`${jenjang}/${religion} (hanya ${count})`);
    }
  }
  assert.deepEqual(missing, [], `Cakupan agama kurang: ${missing.join('; ')}`);
});

test('budi pekerti generik ada untuk mapel agama generik SMP/SMA/SMK', () => {
  for (const jenjang of ['SMP', 'SMA', 'SMK'] as Jenjang[]) {
    const count = CURRICULUM_TOPICS.filter(
      item => item.jenjang === jenjang && item.mataPelajaranKey === 'pendidikan agama'
    ).length;
    assert.ok(count >= 2, `${jenjang} butuh ≥2 topik budi pekerti generik`);
  }
});

test('saran kontekstual presisi untuk kombinasi yang dilengkapi', () => {
  const cases: Array<[Jenjang, string, string, string]> = [
    ['SD', 'Fase A', 'Kelas 1', 'Seni Musik'],
    ['SMP', 'Fase D', 'Kelas 8', 'Prakarya (Kerajinan, Rekayasa, Budidaya, Pengolahan)'],
    ['SMA', 'Fase E', 'Kelas 10', 'Informatika'],
    ['SMK', 'Fase E', 'Kelas 10', 'Matematika Terapan'],
    ['SMP', 'Fase D', 'Kelas 8', 'Pendidikan Agama dan Budi Pekerti']
  ];
  for (const [jenjang, fase, tingkat, mapel] of cases) {
    const results = getContextualTopics(jenjang, fase, tingkat, mapel);
    assert.ok(results.length > 0, `saran kosong untuk ${jenjang} ${mapel}`);
    assert.ok(
      results.every(item => item.jenjang === jenjang),
      `saran lintas jenjang untuk ${jenjang} ${mapel}`
    );
  }
});

test('id topik unik dan field wajib terisi', () => {
  const ids = CURRICULUM_TOPICS.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length, 'id duplikat ditemukan');
  for (const item of CURRICULUM_TOPICS) {
    assert.ok(item.topik.length > 10, `topik terlalu pendek: ${item.id}`);
    assert.ok(item.deskripsiTP.length > 20, `TP terlalu pendek: ${item.id}`);
    assert.ok(item.kataKunci.length >= 2, `kata kunci kurang: ${item.id}`);
    assert.ok([1, 2].includes(item.semester), `semester invalid: ${item.id}`);
  }
});
