import request from '@/utils/request.js';

/**
 * 管理员导出课程统计
 * @param {Object} params - 筛选参数
 * @returns {Promise}
 */
export const adminExportCourseStat = (params) => {
  return request({
    url: '/admin/export/course-stat',
    method: 'get',
    params,
    responseType: 'blob' // 二进制流（文件导出）
  });
};