import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import { useUserStore } from '@/store/user';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 接口基础路径（.env配置）
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
    withCredentials: true
});

// 加载层实例
let loadingInstance = null;

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 显示加载层（排除登录接口）
    if (!config.url.includes('/auth/login')) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.1)'
      });
    }

    // 添加token
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    // 关闭加载层
    if (loadingInstance) loadingInstance.close();
    console.error('请求错误:', error);
    ElMessage.error('请求失败，请稍后重试');
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 关闭加载层
    if (loadingInstance) loadingInstance.close();

    const res = response.data;
    // 接口返回成功
    if (res.code === 200) {
      return res;
    } else {
      // 接口返回失败（如参数错误、业务异常）
      ElMessage.error(res.msg || '操作失败');
      return Promise.reject(res);
    }
  },
  (error) => {
    // 关闭加载层
    if (loadingInstance) loadingInstance.close();

    console.error('响应错误:', error);
    // 处理不同错误码
    if (error.response) {
      const status = error.response.status;
      const userStore = useUserStore();

      switch (status) {
        case 401: // 未登录/Token过期
          ElMessage.error('登录状态已过期，请重新登录');
          userStore.logout(); // 清除用户信息
          window.location.href = '/login';
          break;
        case 403: // 权限不足
          ElMessage.error('你没有访问该资源的权限');
          break;
        case 404: // 接口不存在
          ElMessage.error('请求的资源不存在');
          break;
        case 500: // 服务器错误
          ElMessage.error('服务器内部错误，请稍后重试');
          break;
        default:
          ElMessage.error(error.response.data?.msg || '请求失败');
      }
    } else {
      ElMessage.error('网络异常，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

export default service;

