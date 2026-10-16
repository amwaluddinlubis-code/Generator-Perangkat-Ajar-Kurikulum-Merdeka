import { useCallback, useState } from 'react';
import type { KopPengesahan } from '@/shared/kopPengesahan';
import {
  kopDefaultDariUser,
  kopLengkap,
  muatKop,
  simpanKop,
} from '@/shared/kopPengesahan';

/** Data profil pengguna yang sudah ada di aplikasi, dipakai sebagai default awal kop. */
export interface KopUser {
  schoolName?: string;
  name?: string;
  nip?: string;
}

/**
 * useKopPengesahan — state kop & pengesahan (F2-1).
 *
 * Inisialisasi: muatKop() (localStorage) ?? kopDefaultDariUser(user).
 * `simpan` menulis ke localStorage lalu menutup modal.
 * `kopSiap` true bila semua field wajib sudah terisi (kopLengkap).
 */
export function useKopPengesahan(user: KopUser) {
  const [kop, setKop] = useState<Partial<KopPengesahan>>(() => {
    try {
      if (typeof localStorage === 'undefined') return kopDefaultDariUser(user);
      return muatKop() ?? kopDefaultDariUser(user);
    } catch {
      return kopDefaultDariUser(user);
    }
  });
  const [modalTerbuka, setModalTerbuka] = useState(false);

  const bukaModal = useCallback(() => setModalTerbuka(true), []);
  const tutupModal = useCallback(() => setModalTerbuka(false), []);

  const simpan = useCallback((k: KopPengesahan) => {
    try {
      simpanKop(k);
    } catch {
      // Penyimpanan lokal gagal (mis. mode privat penuh) — state tetap dipakai sesi ini.
    }
    setKop(k);
    setModalTerbuka(false);
  }, []);

  return {
    kop,
    modalTerbuka,
    bukaModal,
    tutupModal,
    simpan,
    kopSiap: kopLengkap(kop),
  };
}
