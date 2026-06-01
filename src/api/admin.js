import request from '@/utils/request.js';

// 管理员-查看所有用户
export const adminGetUsers = (params) => {
  return request({
    url: '/admin/users',
    method: 'GET',
    params // pageNum、pageSize、role
  });
};

// 管理员-查看课程统计
export const adminGetCourseStat = () => {
  return request({
    url: '/admin/courses/stat',
    method: 'GET'
  });
};