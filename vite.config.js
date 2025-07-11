import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pas dit pad aan naargelang je GitHub-repo heet!
export default defineConfig({
  plugins: [react()],
  base: '/wereldquiz/'  // <- exact de naam van je GitHub-repo
})

