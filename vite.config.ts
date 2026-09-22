import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { cn } from 'cn/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react({ compiler: true }),
    tailwindcss(),
    cn({ content: ['inertia/**/*.{ts,tsx}'], out: 'inertia/cn_tables.ts' }),
    adonisjs({ entryPoints: ['inertia/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  resolve: {
    alias: [
      { find: '~/', replacement: `${import.meta.dirname}/inertia/` },
      { find: '@generated', replacement: `${import.meta.dirname}/.adonisjs/client/` },
      // Every `cn` import, shadcn components included, gets the project-fitted tables
      { find: /^cn$/, replacement: `${import.meta.dirname}/inertia/cn.ts` },
    ],
  },

  server: {
    watch: {
      ignored: ['**/tmp/**'],
    },
  },
})
