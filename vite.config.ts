import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  const isProd = command === 'build'

  return {
    plugins: [
      vue(),
      // 已移除 vite-plugin-mock，改用基于 axios 拦截器的 Mock 方案
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: true, // 允许外部访问
      open: true, // 自动打开浏览器
      strictPort: false, // 端口被占用时自动尝试下一个可用端口
      hmr: {
        overlay: true, // 显示错误覆盖层
      },
      watch: {
        // 监听文件变化配置
        usePolling: false, // 使用轮询（某些场景下需要）
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
      // 注释掉 proxy，让 mock 优先处理请求
      // proxy: {
      //   '/api': {
      //     target: 'http://localhost:8080',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''),
      //   },
      // },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // 生产环境关闭 sourcemap，提升构建速度
      minify: 'esbuild', // 使用 esbuild 压缩，速度更快
      cssCodeSplit: true, // CSS 代码分割
      chunkSizeWarningLimit: 1000, // chunk 大小警告阈值（KB）
      rollupOptions: {
        output: {
          // 手动分包策略
          manualChunks: {
            // 将 Vue 相关库单独打包
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将 UI 库单独打包
            'vant-vendor': ['vant'],
            // 将工具库单独打包
            'utils-vendor': ['axios'],
          },
          // 文件命名规则
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              return `assets/media/[name]-[hash].[ext]`
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
              return `assets/img/[name]-[hash].[ext]`
            }
            if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].[ext]`
            }
            return `assets/${ext}/[name]-[hash].[ext]`
          },
        },
      },
      // 压缩配置（esbuild 选项）
      esbuild: {
        drop: isProd ? ['console', 'debugger'] : [], // 生产环境移除 console 和 debugger
      },
    },
    // 预览配置
    preview: {
      port: 4173,
      host: true,
      open: true,
    },
  }
})

