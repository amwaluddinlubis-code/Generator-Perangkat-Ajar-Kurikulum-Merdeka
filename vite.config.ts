import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const DIR = import.meta.dirname ?? '.';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(DIR, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rolldownOptions: {
        output: {
          // Pecah vendor berat agar chunk awal tidak 2.8MB sekaligus
          codeSplitting: {
            groups: [{ name: 'vendor-excel', test: /node_modules[\\/](exceljs|minimist|dayjs)/ }],
          },
        },
      },
    },
  };
});
