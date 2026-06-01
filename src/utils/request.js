import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import router from '@/router';

// 创建Axios实例
const service = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL, // 后端接口基础路径（从.env文件读取）
  //baseURL:'',
    timeout: 10000, // 请求超时时间
  withCredentials: true // 必须保留！Session登录依赖Cookie
});
//axios.defaults.withCredentials = true; // 关键：允许跨域携带Cookie

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理结果
service.interceptors.response.use(
  // 第一步：HTTP状态码200的情况（后端登录成功）
  (response) => {
    const res = response.data;
    // 后端成功响应：无code字段，直接返回用户信息 → 判定为成功
    return res;
  },
  // 第二步：HTTP状态码非200的情况（如401登录失败）
  (error) => {
    // 解析后端返回的错误信息（密码错误/用户名不存在）
    const errRes = error.response;
    if (errRes && errRes.status === 401) {
      // 后端返回的错误提示在 message 字段
      ElMessage.error(errRes.data.message || '用户名或密码错误');
    } else {
      ElMessage.error(error.message || '请求出错');
    }
    return Promise.reject(error);
  }
);

export default service;