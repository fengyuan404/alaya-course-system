import { defineStore } from 'pinia';
import request from '@/utils/request'; // 确认路径与实际项目一致
import { userLogin } from '@/api/auth'; // 复用API方法，避免重复请求逻辑

// 定义用户Store，key为"user"
export const useUserStore = defineStore('user', {
  state: () => ({
    // 前端存储用户信息的变量（与后端字段无关，仅为容器）
    userInfo: null, 
    // 标记是否已登录
    isLogin: false 
  }),
  getters: {
    // 快捷获取用户信息（可选，方便其他组件调用）
    currentUser: (state) => state.userInfo,
    currentRole: (state) => state.userInfo?.role || ''
  },
  actions: {
    /**
     * 登录方法
     * @param {Object} formData - 序列化后的表单参数（username+password）
     * @returns {Boolean} 登录是否成功
     */
    async login(formData) {
      try {
          // 调用后端登录接口：POST /api/auth/login
          console.log('开始调用登录接口，参数：', formData); // 打印参数
        const userData = await request({
          url: '/auth/login',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        });
          console.log('后端返回的用户信息：', userData); // 关键：确认后端真的返回了用户信息

        // 后端返回的userData就是用户信息对象，存入前端状态
        this.userInfo = userData;
        this.isLogin = true;
        // 持久化存储（防止页面刷新丢失）
          localStorage.setItem('userInfo', JSON.stringify(userData));
          
          console.log('登录状态已更新：', this.isLogin); // 确认状态更新为true
        return true;
      } catch (error) {
          // 登录失败：清空状态
          console.error('登录请求异常：', error); // 打印异常（即使后端成功，也可能有隐性报错）
        this.userInfo = null;
        this.isLogin = false;
        localStorage.removeItem('userInfo');
        return false;
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.userInfo = null;
      this.isLogin = false;
      localStorage.removeItem('userInfo');
      // 可选：调用后端退出接口（若有）
      // request.post('/auth/logout').catch(err => console.log('退出失败', err));
    },

    /**
     * 页面刷新后恢复登录状态
     */
    initUserInfo() {
      const savedUser = localStorage.getItem('userInfo');
      if (savedUser) {
        this.userInfo = JSON.parse(savedUser);
        this.isLogin = true;
      }
    }
  }
});