import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base con el nombre del repo solo en build (lo que sirve GitHub Pages);
// en dev sigue siendo "/" para que el servidor local no cambie de comportamiento.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/IDh_VETECO26/' : '/',
  plugins: [react()],
}))
