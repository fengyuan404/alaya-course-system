import request from '@/utils/request.js';

/**
 * 管理员获取用户列表
 * @param {Object} params - 分页/筛选参数
 * @returns {Promise}
 */
export const adminGetUsers = (params) => {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  });
};

/**
 * 管理员添加用户
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export const adminAddUser = (data) => {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  });
};

/**
 * 管理员编辑用户
 * @param {Number} id - 用户ID
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export const adminEditUser = (id, data) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  });
};

/**
 * 管理员删除用户
 * @param {Number} id - 用户ID
 * @returns {Promise}
 */
export const adminDeleteUser = (id) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  });
};

/**
 * 管理员重置用户密码
 * @param {Number} id - 用户ID
 * @returns {Promise}
 */
export const adminResetUserPwd = (id) => {
  return request({
    url: `/admin/users/${id}/reset-pwd`,
    method: 'post'
  });
};