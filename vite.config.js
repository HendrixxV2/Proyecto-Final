import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/Assets', import.meta.url)),
      '@/Assets': fileURLToPath(new URL('./src/Assets', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/Components', import.meta.url)),
      '@/Components': fileURLToPath(new URL('./src/Components', import.meta.url)),
      '@/common': fileURLToPath(new URL('./src/Components/Common', import.meta.url)),
      '@/Common': fileURLToPath(new URL('./src/Components/Common', import.meta.url)),
      '@/ui': fileURLToPath(new URL('./src/Components/UI', import.meta.url)),
      '@/UI': fileURLToPath(new URL('./src/Components/UI', import.meta.url)),
      '@/ai': fileURLToPath(new URL('./src/Components/AI', import.meta.url)),
      '@/AI': fileURLToPath(new URL('./src/Components/AI', import.meta.url)),
      '@/weather': fileURLToPath(new URL('./src/Components/Weather', import.meta.url)),
      '@/Weather': fileURLToPath(new URL('./src/Components/Weather', import.meta.url)),
      '@/admin': fileURLToPath(new URL('./src/Components/Admin', import.meta.url)),
      '@/Admin': fileURLToPath(new URL('./src/Components/Admin', import.meta.url)),
      '@/context': fileURLToPath(new URL('./src/Context', import.meta.url)),
      '@/Context': fileURLToPath(new URL('./src/Context', import.meta.url)),
      '@/layouts': fileURLToPath(new URL('./src/Layouts', import.meta.url)),
      '@/Layouts': fileURLToPath(new URL('./src/Layouts', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/Pages', import.meta.url)),
      '@/Pages': fileURLToPath(new URL('./src/Pages', import.meta.url)),
      '@/routes': fileURLToPath(new URL('./src/Routes', import.meta.url)),
      '@/Routes': fileURLToPath(new URL('./src/Routes', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/Services', import.meta.url)),
      '@/Services': fileURLToPath(new URL('./src/Services', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/Utils', import.meta.url)),
      '@/Utils': fileURLToPath(new URL('./src/Utils', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/Hooks', import.meta.url)),
      '@/Hooks': fileURLToPath(new URL('./src/Hooks', import.meta.url)),
      '@/hHoks': fileURLToPath(new URL('./src/Hooks', import.meta.url)),
      '@/HHooks': fileURLToPath(new URL('./src/Hooks', import.meta.url)),
    },
  },
  server: { port: 5173, open: true },
  build: { outDir: 'dist', sourcemap: true },
});