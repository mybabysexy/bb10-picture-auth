import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'library') {
    // Library build configuration
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: 'src/index.ts',
          name: 'PictureAuth',
          fileName: (format) => `index.${format === 'es' ? 'esm.' : ''}js`,
          formats: ['es', 'cjs']
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        },
        sourcemap: true,
        emptyOutDir: true
      }
    }
  }

  // Demo/development build configuration
  return {
    plugins: [react()],
  }
})
