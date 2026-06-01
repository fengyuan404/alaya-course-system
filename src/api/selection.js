import request from '@/utils/request.js';

// 学生-选课
export const studentSelectCourse = (courseId) => {
  return request({
    url: `/student/courses/select/${courseId}`,
    method: 'POST'
  });
};

// 学生-退课
export const studentDropCourse = (selectionId) => {
  return request({
    url: `/student/courses/drop/${selectionId}`,
    method: 'DELETE'
  });
};