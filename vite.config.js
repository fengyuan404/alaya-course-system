import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // 导入path模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, 'src') // 把@指向src目录
    }
  },
  // server: {
  //   port: 5173, // 端口
  //   open: true, // 自动打开浏览器
  //   proxy: {
  //     // 接口代理
  //     '/api': {
  //       target: 'http://localhost:8080', // 后端接口地址
  //       changeOrigin: true, // 开启跨域
  //       //rewrite: (path) => path.replace(/^\/api/, '') // 去掉/api前缀
  //     }
  //   }
  // }
});