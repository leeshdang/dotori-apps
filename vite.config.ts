import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

function getDotoriVersion(prefix: string) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${prefix}-${yyyy}${mm}${dd}_${hh}${min}`;
}

const APP_VERSION = getDotoriVersion('DJL');

// Synchronize version to version.json
try {
  if (!fs.existsSync(path.resolve(__dirname, './src'))) {
    fs.mkdirSync(path.resolve(__dirname, './src'), { recursive: true });
  }
  fs.writeFileSync(
    path.resolve(__dirname, './src/version.json'),
    JSON.stringify({ version: APP_VERSION }, null, 2),
    'utf-8'
  );
} catch (e) {
  console.error('Failed to sync version.json:', e);
}

export default defineConfig(() => {
  return {
    base: './',
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5175,
      host: true,
    },
  };
});
