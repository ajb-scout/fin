import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  base: "/fin/",

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000/', // Your Flask server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});


