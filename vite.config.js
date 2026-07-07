import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // lightningcss (mặc định CSS minifier của rolldown-vite) đang xóa nhầm
    // thuộc tính `backdrop-filter` không tiền tố khi có cả `-webkit-backdrop-filter`
    // đi kèm, khiến hiệu ứng kính mờ hiển thị sai trên bản build production.
    // Tắt minify CSS để giữ đủ cả 2 thuộc tính (đã gzip qua CDN nên chênh lệch không lớn).
    cssMinify: false,
  },
})
