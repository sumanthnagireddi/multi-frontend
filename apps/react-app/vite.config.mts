import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import path from 'path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/react-app',
  server: {
    port: 4201,
    host: 'localhost',
  },
  preview: {
    port: 4201,
    host: 'localhost',
  },
  plugins: [!process.env.VITEST && reactRouter(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  resolve: {
    alias: {
      'react-router-dom': path.resolve(import.meta.dirname, './app/components/react-router-dom-mock.tsx'),
      '@atlassian/studio-entry-link': path.resolve(import.meta.dirname, './app/components/studio-entry-link-mock.ts'),
    },
  },
  optimizeDeps: {
    include: [
      '@atlaskit/editor-core',
      '@atlaskit/editor-common',
      'react-intl',
      '@atlaskit/media-core',
      '@atlaskit/tokens',
    ],
    exclude: [
      'heading1',
      'heading2',
      'heading3',
      'heading4',
      'heading5',
      'heading6',
    ],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/react-app',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    cssMinify: false,
  },
}));
