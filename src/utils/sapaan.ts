// FRIENDLY: util sapaan hangat berbasis waktu — dipakai di Beranda & tempat lain.
export type WaktuHari = 'pagi' | 'siang' | 'sore' | 'malam';

export function sapaanWaktu(tanggal: Date = new Date()): WaktuHari {
  const jam = tanggal.getHours();
  if (jam < 11) return 'pagi';
  if (jam < 15) return 'siang';
  if (jam < 18) return 'sore';
  return 'malam';
}

/** "Selamat pagi, Pak Amwal 👋" — sapaan default 'Pak', bisa diganti. */
export function salamHangat(namaLengkap: string, sapaan = 'Pak'): string {
  const depan = namaLengkap.trim().split(/\s+/)[0] || namaLengkap;
  return `Selamat ${sapaanWaktu()}, ${sapaan} ${depan} 👋`;
}

/** Kalimat ajakan acak yang ramah untuk hero/empty state. */
const AJAKAN = [
  'Mau buat perangkat apa hari ini?',
  'Yuk, susun perangkat ajar yang seru hari ini!',
  'Siap bikin pembelajaran yang berkesan?',
  'Ada ide seru untuk kelas hari ini?',
];

export function ajakanAcak(): string {
  return AJAKAN[Math.floor(Math.random() * AJAKAN.length)];
}

/** Pesan penyemangat untuk empty state. */
export function pesanKosong(konteks: 'paket' | 'dokumen' | 'perpustakaan' | 'aktivitas'): string {
  switch (konteks) {
    case 'paket':
      return 'Belum ada paket — yuk buat yang pertama! 🎒';
    case 'dokumen':
      return 'Belum ada dokumen di sini. Tenang, membuatnya cuma butuh beberapa menit ✨';
    case 'perpustakaan':
      return 'Rak perpustakaan masih kosong. Jadilah yang pertama berbagi! 📚';
    case 'aktivitas':
      return 'Belum ada aktivitas. Mulai dari satu dokumen kecil dulu, yuk! 🌱';
  }
}
