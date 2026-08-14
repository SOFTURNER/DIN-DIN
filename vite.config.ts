import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        mapping: 'mapping.html',
        leaders: 'leaders.html',
        investors: 'investors.html',
        startups: 'startups.html',
        contact: 'contact.html',
        'ai-matching': 'ai-matching.html',
      },
    },
  },
})
