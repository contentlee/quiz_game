import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// host: true → 같은 와이파이의 다른 기기에서 http://<이 PC IP>:5173 으로 접속 가능
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 5173 },
})
