import request from '@/utils/request.js';

/**
 * 管理员获取课程统计
 * @param {Object} params - 筛选参数
 * @returns {Promise}
 */
export const adminGetCourseStat = (params) => {
  return request({
    url: '/admin/courses/stats',
    method: 'get',
    params
  });
};

/**
 * 管理员获取教师列表（筛选用）
 * @returns {Promise}
 */
export const adminGetTeachers = () => {
  return request({
    url: '/admin/teachers',
    method: 'get'
  });
};
