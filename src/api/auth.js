import request from '@/utils/request.js';

/**
 * 用户登录接口（核心：命名导出 userLogin）
 * @param {Object} data - { username, password }
 * @returns {Promise}
 */


export const userLogin = (data) => {
  return request({
    url: '/auth/login', // 后端登录接口地址，可根据实际调整
    method: 'post',
    data
  });
};

// 用户登出
export const userLogout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
};
// 补充缺失的 getUserInfo 函数（核心修复）
/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getUserInfo = () => {
  return request({
    url: '/auth/user-info',
    method: 'get'
  });
};

// 修改密码
export const updatePassword = (oldPwd, newPwd) => {
  return request({
    url: '/user/password',
    method: 'PUT',
    data: { oldPwd, newPwd }
  });
};

// // 获取当前用户信息
// export const getCurrentUser = () => {
//   return request({
//     url: '/user/current',
//     method: 'GET'
//   });
// };

