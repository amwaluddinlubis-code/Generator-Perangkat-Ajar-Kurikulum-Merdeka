/**
 * Unit test modul kontrak soal terstruktur Fase 1 (shared/soalTerstruktur.ts).
 * Murni fungsi lokal — tanpa AI / network.
 * Dijalankan via: npx tsx test/soal-terstruktur.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import {
  PENANDA_SOAL_V1,
  FORMAT_SOAL_V1,
  DAFTAR_BENTUK,
  DAFTAR_KOGNITIF,
  bagiKomposisiPreset,
  totalKognitif,
  bungkusSoalTerstruktur,
  adalahSoalTerstruktur,
  parseSoalTerstruktur,
  ekstrakJsonDariTeks,
  validasiPaketSoal,
  hitungKekuranganBentuk,
  normalisasiPaketSoal,
  ringkasanDistribusiKognitif,
  renderPaketSoalMarkdown,
  type PaketSoalTerstruktur,
  type IdentitasSoal,
  type ButirSoal,
} from '../shared/soalTerstruktur.ts';

let passed = 0, failed = 0;
function check(nama: string, kond: boolean, extra = '') {
  if (kond) { passed++; console.log(`  PASS ${nama}`); }
  else { failed++; console.log(`  FAIL ${nama} ${extra}`); }
}
function sama(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------- Fixture ----------
function identitas(over: Partial<IdentitasSoal> = {}): IdentitasSoal {
  return {
    satuanPendidikan: 'SMP Negeri 3 Sinunukan',
    mataPelajaran: 'Informatika',
    kelas: 'VII',
    fase: 'D',
    topik: 'Fotosintesis',
    waktu: '60 menit',
    guru: 'Amwaluddin',
    ...over,
  };
}
function butirPg(nomor: number, over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor,
    bentuk: 'pg_biasa',
    pertanyaan: 'Apa fungsi utama daun pada tumbuhan?',
    opsi: ['Menyerap air dari tanah', 'Tempat fotosintesis', 'Menopang batang', 'Menyimpan cadangan makanan'],
    kunci: 'B',
    pembahasan: 'Daun mengandung klorofil sehingga menjadi tempat utama fotosintesis.',
    levelKognitif: 'C2',
    indikator: 'Siswa dapat menjelaskan fungsi daun.',
    ...over,
  };
}
function butirUraian(nomor: number, over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor,
    bentuk: 'uraian',
    pertanyaan: 'Jelaskan faktor-faktor yang memengaruhi laju fotosintesis dan berikan satu contoh penerapannya!',
    kunci: 'Faktor: intensitas cahaya, konsentrasi CO2, suhu, air; penerapan: rumah kaca.',
    pembahasan: 'Laju fotosintesis naik dengan cahaya/CO2 hingga titik jenuh; suhu optimum enzim.',
    levelKognitif: 'C4',
    indikator: 'Siswa dapat menganalisis faktor laju fotosintesis.',
    rubrik: [
      { skor: 2, deskriptor: 'Menyebutkan minimal 3 faktor dengan penjelasan benar' },
      { skor: 1, deskriptor: 'Menyebutkan contoh penerapan dengan benar' },
    ],
    ...over,
  };
}
function paketValid(): PaketSoalTerstruktur {
  return {
    format: FORMAT_SOAL_V1,
    identitas: identitas(),
    komposisiBentuk: { pg_biasa: 1, pg_kompleks: 0, menjodohkan: 0, isian: 0, uraian: 1 },
    komposisiKognitif: { C1: 0, C2: 1, C3: 0, C4: 1, C5: 0, C6: 0 },
    items: [butirPg(1), butirUraian(2)],
    generatedAt: '2026-10-17T00:00:00.000Z',
  };
}
function klon<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

console.log('1. bagiKomposisiPreset\n');
{
  const presets = ['C1-C2', 'C1-C4', 'HOTS', 'LENGKAP'] as const;
  for (const p of presets) {
    const k = bagiKomposisiPreset(p, 15);
    check(`preset ${p} / 15 -> jumlah semua level = 15`, totalKognitif(k) === 15, JSON.stringify(k));
  }
  const lengkap15 = bagiKomposisiPreset('LENGKAP', 15);
  check('LENGKAP/15 -> C4=C5=C6 masing-masing 3',
    lengkap15.C4 === 3 && lengkap15.C5 === 3 && lengkap15.C6 === 3,
    JSON.stringify(lengkap15));
  check('LENGKAP/15 -> C1=C2=C3 masing-masing 2',
    lengkap15.C1 === 2 && lengkap15.C2 === 2 && lengkap15.C3 === 2,
    JSON.stringify(lengkap15));
  const c1c2_5 = bagiKomposisiPreset('C1-C2', 5);
  check('C1-C2/5 -> C2 dapat 3, C1 dapat 2 (sisa ke level tertinggi)',
    c1c2_5.C1 === 2 && c1c2_5.C2 === 3,
    JSON.stringify(c1c2_5));
  const c1c2_0 = bagiKomposisiPreset('C1-C2', 0);
  check('total 0 -> semua level 0', sama(c1c2_0, { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 }));
  const hots0 = bagiKomposisiPreset('HOTS', 0);
  check('HOTS total 0 -> semua 0', totalKognitif(hots0) === 0);
  const hots15 = bagiKomposisiPreset('HOTS', 15);
  check('HOTS tidak memberi ke C1-C3',
    hots15.C1 === 0 && hots15.C2 === 0 && hots15.C3 === 0,
    JSON.stringify(hots15));
  check('HOTS/15 -> C4=C5=C6 masing-masing 5',
    hots15.C4 === 5 && hots15.C5 === 5 && hots15.C6 === 5,
    JSON.stringify(hots15));
  const neg = bagiKomposisiPreset('LENGKAP', -7);
  check('total negatif -> semua 0', totalKognitif(neg) === 0);
}

console.log('\n2. totalKognitif\n');
{
  check('menjumlahkan dengan benar',
    totalKognitif({ C1: 2, C2: 3, C3: 0, C4: 1, C5: 4, C6: 5 }) === 15);
  check('semua nol -> 0',
    totalKognitif({ C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 }) === 0);
  const aneh = { C1: 'abc', C2: null, C3: -5, C4: 2.6, C5: NaN, C6: 1.4 } as any;
  check('tahan terhadap nilai non-angka (string/null/NaN/negatif diabaikan/dinormalkan)',
    totalKognitif(aneh) === 4, `dapat ${totalKognitif(aneh)}`); // round(2.6)=3, round(1.4)=1 -> 4
}

console.log('\n3. bungkus / adalahSoalTerstruktur / parseSoalTerstruktur\n');
{
  const p = paketValid();
  const content = bungkusSoalTerstruktur(p);
  check('bungkus -> adalahSoalTerstruktur true', adalahSoalTerstruktur(content));
  check('bungkus -> diawali penanda versi', content.startsWith(PENANDA_SOAL_V1));
  const kembali = parseSoalTerstruktur(content);
  check('parse mengembalikan struktur setara (deep equal)', kembali !== null && sama(kembali, p));
  check('parse markdown polos -> null', parseSoalTerstruktur('# Halo') === null);
  check('adalahSoalTerstruktur markdown polos -> false', adalahSoalTerstruktur('# Halo') === false);
  check('parse penanda + JSON rusak -> null',
    parseSoalTerstruktur(PENANDA_SOAL_V1 + '\n{ini bukan json') === null);
  check('parse penanda + JSON valid tapi format salah -> null',
    parseSoalTerstruktur(PENANDA_SOAL_V1 + '\n{"format":"bukan-rgm","items":[]}') === null);
  check('parse string kosong -> null', parseSoalTerstruktur('') === null);
}

console.log('\n4. ekstrakJsonDariTeks\n');
{
  check('JSON polos', sama(ekstrakJsonDariTeks('{"a":1}'), { a: 1 }));
  check('dibungkus code fence ```json',
    sama(ekstrakJsonDariTeks('```json\n{"a":2}\n```'), { a: 2 }));
  check('dibungkus code fence ``` tanpa label',
    sama(ekstrakJsonDariTeks('```\n{"a":3}\n```'), { a: 3 }));
  check('ada prosa sebelum dan sesudah JSON',
    sama(ekstrakJsonDariTeks('Berikut paket soalnya ya Pak:\n{"a":4}\nSemoga bermanfaat!'), { a: 4 }));
  check('teks tanpa JSON -> null', ekstrakJsonDariTeks('tidak ada json di sini') === null);
  check('teks kosong -> null', ekstrakJsonDariTeks('') === null);
}

console.log('\n5. validasiPaketSoal\n');
{
  const v = validasiPaketSoal(paketValid());
  check('paket valid -> valid=true tanpa error', v.valid === true && v.errors.length === 0, JSON.stringify(v.errors));
  check('paket valid -> perBentuk terhitung', v.perBentuk.pg_biasa === 1 && v.perBentuk.uraian === 1);
  check('paket valid -> perKognitif terhitung', v.perKognitif.C2 === 1 && v.perKognitif.C4 === 1);

  const kunciKosong = klon(paketValid());
  kunciKosong.items[0].kunci = '   ';
  const vKunci = validasiPaketSoal(kunciKosong);
  check('kunci kosong -> tidak valid & ada error kunci', !vKunci.valid && vKunci.errors.some(e => e.includes('kunci')), JSON.stringify(vKunci.errors));

  const tanpaRubrik = klon(paketValid());
  delete tanpaRubrik.items[1].rubrik;
  const vRubrik = validasiPaketSoal(tanpaRubrik);
  check('uraian tanpa rubrik -> tidak valid & ada error rubrik', !vRubrik.valid && vRubrik.errors.some(e => e.includes('rubrik')), JSON.stringify(vRubrik.errors));

  const satuOpsi = klon(paketValid());
  satuOpsi.items[0].opsi = ['Hanya satu opsi'];
  const vOpsi = validasiPaketSoal(satuOpsi);
  check('pg_biasa dengan 1 opsi -> tidak valid & ada error opsi', !vOpsi.valid && vOpsi.errors.some(e => e.includes('opsi')), JSON.stringify(vOpsi.errors));

  const c7 = klon(paketValid());
  (c7.items[0] as any).levelKognitif = 'C7';
  const vC7 = validasiPaketSoal(c7);
  check("levelKognitif 'C7' -> tidak valid & ada error kognitif", !vC7.valid && vC7.errors.some(e => e.includes('kognitif')), JSON.stringify(vC7.errors));

  const tanyaKosong = klon(paketValid());
  tanyaKosong.items[0].pertanyaan = '';
  const vTanya = validasiPaketSoal(tanyaKosong);
  check('pertanyaan kosong -> tidak valid & ada error pertanyaan', !vTanya.valid && vTanya.errors.some(e => e.includes('pertanyaan')), JSON.stringify(vTanya.errors));

  const kosong = klon(paketValid());
  kosong.items = [];
  const vKosong = validasiPaketSoal(kosong);
  check('items kosong -> tidak valid', !vKosong.valid && vKosong.errors.length > 0);
}

console.log('\n6. hitungKekuranganBentuk\n');
{
  const diminta = { pg_biasa: 5, pg_kompleks: 3, menjodohkan: 2, isian: 2, uraian: 3 };
  const mk = (bentuk: ButirSoal['bentuk'], n: number): ButirSoal[] =>
    Array.from({ length: n }, (_, i) => butirPg(100 + i, { bentuk } as Partial<ButirSoal>));
  const aktual = [
    ...mk('pg_biasa', 3),
    ...mk('pg_kompleks', 3),
    ...mk('menjodohkan', 2),
    ...mk('isian', 2),
    butirUraian(200), butirUraian(201), butirUraian(202),
  ];
  check('kurang 2 pg_biasa saja', sama(hitungKekuranganBentuk(aktual, diminta), { pg_biasa: 2 }), JSON.stringify(hitungKekuranganBentuk(aktual, diminta)));

  const pas = [
    ...mk('pg_biasa', 5), ...mk('pg_kompleks', 3), ...mk('menjodohkan', 2),
    ...mk('isian', 2), ...mk('uraian', 3),
  ];
  check('aktual pas semua -> {}', sama(hitungKekuranganBentuk(pas, diminta), {}));

  const lebih = [...mk('pg_biasa', 9), ...mk('uraian', 3)];
  check('kelebihan tidak dilaporkan sebagai kekurangan',
    sama(hitungKekuranganBentuk(lebih, { pg_biasa: 5, pg_kompleks: 0, menjodohkan: 0, isian: 0, uraian: 3 }), {}));
}

console.log('\n7. normalisasiPaketSoal\n');
{
  const p = klon(paketValid());
  // simulasikan AI: nomor acak, string berlebih spasi, topik bergeser
  p.items[0].nomor = 99;
  p.items[1].nomor = 7;
  p.items[0].pertanyaan = '   Apa fungsi utama daun pada tumbuhan?  ';
  p.items[0].opsi = ['  Menyerap air dari tanah  ', 'Tempat fotosintesis'];
  p.identitas.topik = 'Fotosintesis'; // hasil AI (halusinasi)
  const form = identitas({ topik: 'Sistem Pernapasan' });

  const n = normalisasiPaketSoal(p, form);
  check('nomor diurutkan ulang 1..N walau input acak',
    n.items[0].nomor === 1 && n.items[1].nomor === 2);
  check('string di-trim (pertanyaan)', n.items[0].pertanyaan === 'Apa fungsi utama daun pada tumbuhan?');
  check('string di-trim (opsi)', n.items[0].opsi![0] === 'Menyerap air dari tanah');
  check('identitas DITIMPA nilai form (topik: Fotosintesis -> Sistem Pernapasan)',
    n.identitas.topik === 'Sistem Pernapasan', `dapat "${n.identitas.topik}"`);
  check('identitas lain ikut dari form', n.identitas.mataPelajaran === 'Informatika' && n.identitas.guru === 'Amwaluddin');
  check('format tetap rgm-soal-v1', n.format === FORMAT_SOAL_V1);
  check('identitas form ikut di-trim', normalisasiPaketSoal(p, identitas({ topik: '  Pernapasan  ' })).identitas.topik === 'Pernapasan');
}

console.log('\n8. renderPaketSoalMarkdown\n');
{
  const md = renderPaketSoalMarkdown(paketValid());
  check("mengandung '## KISI-KISI SOAL'", md.includes('## KISI-KISI SOAL'));
  check("mengandung '## NASKAH SOAL'", md.includes('## NASKAH SOAL'));
  check("mengandung '## KUNCI JAWABAN'", md.includes('## KUNCI JAWABAN'));
  check("mengandung '## RUBRIK'", md.includes('## RUBRIK'));
  check('memuat nomor butir', md.includes('### Soal 1') && md.includes('### Soal 2'));
  check('memuat teks kunci (huruf B dan jawaban model uraian)',
    md.includes('Kunci: B') && md.includes('rumah kaca'));
  check('memuat baris kisi-kisi per butir', md.includes('| 1 |') && md.includes('| 2 |'));
}

console.log('\n9. ringkasanDistribusiKognitif\n');
{
  const p = klon(paketValid());
  p.komposisiKognitif = { C1: 1, C2: 1, C3: 0, C4: 1, C5: 1, C6: 0 };
  p.items = [
    butirPg(1, { levelKognitif: 'C1' }),
    butirPg(2, { levelKognitif: 'C2' }),
    butirUraian(3, { levelKognitif: 'C4' }),
  ];
  const r = ringkasanDistribusiKognitif(p);
  check('mengembalikan 6 baris level C1..C6', r.length === 6 && r[0].level === 'C1' && r[5].level === 'C6');
  const per = Object.fromEntries(r.map(x => [x.level, x]));
  check('diminta terbaca dari komposisiKognitif', per.C1.diminta === 1 && per.C5.diminta === 1 && per.C3.diminta === 0);
  check('aktual terhitung benar per level',
    per.C1.aktual === 1 && per.C2.aktual === 1 && per.C3.aktual === 0 &&
    per.C4.aktual === 1 && per.C5.aktual === 0 && per.C6.aktual === 0,
    JSON.stringify(r));
  // level tak dikenal diabaikan (tidak ikut aktual mana pun)
  const p2 = klon(paketValid());
  (p2.items[0] as any).levelKognitif = 'C9';
  const r2 = ringkasanDistribusiKognitif(p2);
  check('level tak dikenal tidak masuk hitungan aktual',
    r2.every(x => x.aktual === (x.level === 'C4' ? 1 : 0)));
}

console.log(`\nHasil: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
