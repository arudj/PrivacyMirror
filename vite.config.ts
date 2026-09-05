import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Privacy Mirror - MV3 build.
//
// Pas de plugin d'extension (crxjs, etc.) volontairement : on veut un build
// simple et prévisible pour un hackathon de 2 jours. En échange, pas de HMR
// live dans l'extension -> après un changement, il faut recharger l'extension
// dans chrome://extensions (bouton reload) et rouvrir la popup / recharger l'onglet.
export default defineConfig({
  plugins: [react()],
  // Chemins relatifs dans le HTML généré : indispensable pour que la popup
  // fonctionne sous le protocole chrome-extension://
  base: '',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        scanner: resolve(__dirname, 'src/content/scanner.ts'),
      },
      output: {
        // Fichiers d'entrée (background/content) écrits à la racine de dist/
        // avec un nom stable, référencé tel quel dans public/manifest.json.
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
