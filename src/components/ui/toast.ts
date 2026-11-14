// UI-09: toast SATU untuk seluruh aplikasi.
// Komponen mana pun memanggil notifyToast(); hanya App yang merender
// (viewport tunggal, role="status" + aria-live="polite"). Implementasi
// toast lokal per komponen dilarang — pakai modul ini.
export type ToastKind = 'success' | 'error' | 'info';
export interface ToastItem {
  message: string;
  kind: ToastKind;
}

type Pendengar = (t: ToastItem) => void;
const pendengar = new Set<Pendengar>();

export function notifyToast(message: string, kind: ToastKind = 'success'): void {
  pendengar.forEach((fn) => fn({ message, kind }));
}

export function dengarkanToast(fn: Pendengar): () => void {
  pendengar.add(fn);
  return () => {
    pendengar.delete(fn);
  };
}
