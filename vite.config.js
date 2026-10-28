import { defineConfig } from 'vite';

function getBuildVersion(prefix) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${prefix}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(getBuildVersion('DAS')),
  },
});
