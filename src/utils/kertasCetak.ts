/**
 * kertasCetak.ts — F2-5 "Kertas A4/F4" (Fase 2: siap cetak & siap arsip).
 *
 * Ukuran kertas cetak untuk `window.print()` diatur lewat aturan @page yang
 * disuntikkan dinamis lewat <style id="rgm-kertas-cetak">, sehingga menimpa
 * aturan @page statis di src/index.css (elemen style ini muncul belakangan).
 * Pilihan pengguna disimpan di localStorage.
 */

export type UkuranKertas = 'A4' | 'F4';

export const UKURAN_KERTAS_KEY = 'rgm-ukuran-kertas';

/**
 * PURE: kembalikan teks CSS untuk ukuran kertas yang dipilih.
 * - A4: @page { size: A4; margin: 20mm 18mm; } (sama seperti default statis)
 * - F4 (folio): @page { size: 215mm 330mm; margin: 20mm 18mm; }
 */
export function cssAturanKertas(u: UkuranKertas): string {
  const size = u === 'F4' ? '215mm 330mm' : 'A4';
  return `@page {\n  size: ${size};\n  margin: 20mm 18mm;\n}`;
}

/**
 * Terapkan ukuran kertas ke dokumen aktif dengan membuat/memperbarui
 * <style id="rgm-kertas-cetak"> di <head>. Aman dipanggil di node/SSR
 * (guard document).
 */
export function terapkanUkuranKertas(u: UkuranKertas): void {
  if (typeof document === 'undefined') return;
  const head = document.head ?? document.getElementsByTagName('head')[0];
  if (!head) return;
  let el = document.getElementById('rgm-kertas-cetak') as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = 'rgm-kertas-cetak';
    head.appendChild(el);
  }
  el.textContent = cssAturanKertas(u);
}

/** Baca ukuran kertas tersimpan; default 'A4'. Aman di node/SSR. */
export function bacaUkuranKertas(): UkuranKertas {
  try {
    if (typeof localStorage === 'undefined') return 'A4';
    const v = localStorage.getItem(UKURAN_KERTAS_KEY);
    return v === 'F4' ? 'F4' : 'A4';
  } catch {
    return 'A4';
  }
}

/** Simpan ukuran kertas ke localStorage; aman di node/SSR. */
export function simpanUkuranKertas(u: UkuranKertas): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(UKURAN_KERTAS_KEY, u);
  } catch {
    /* abaikan: penyimpanan privat dsb. */
  }
}
