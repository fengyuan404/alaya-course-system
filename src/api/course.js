import request from '@/utils/request.js';

// ========== 学生相关 ==========
/**
 * 学生获取课程列表
 * @param {Object} params - 分页/筛选参数
 * @returns {Promise}
 */
export const studentGetCourses = (params) => {
  return request({
    url: '/student/courses', // 假设接口地址
    method: 'get',
    params
  });
};

export const getCourseList = (params) => {
  const query = {
    pageNum: Number(params.pageNum) || 1,
    pageSize: Number(params.pageSize) || 10
  };
  // 非空才传，避免credits=空字符串
  if (params.keyword) query.keyword = params.keyword;
  if (params.credits) query.credits = Number(params.credits);

  return request.get('/student/courses', { params: query });
};

/**
 * 学生获取课程详情
 * @param {Number} id - 课程ID
 * @returns {Promise}
 */
export const studentGetCourseDetail = (id) => {
  return request({
    url: `/student/courses/${id}`,
    method: 'get'
  });
};

/**
 * 学生获取已选课程
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export const studentGetSelectedCourses = (params) => {
  return request({
    url: '/student/courses/selected',
    method: 'get',
    params
  });
};

// ========== 教师相关 ==========
/**
 * 教师获取我的课程
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export const teacherGetMyCourses = (params) => {
  return request({
    url: '/teacher/courses',
    method: 'get',
    params
  });
};

/**
 * 教师创建课程
 * @param {Object} data - 课程信息
 * @returns {Promise}
 */
export const teacherCreateCourse = (data) => {
  return request({
    url: '/teacher/courses',
    method: 'post',
    data
  });
};


/**
 * 教师获取课程详情（编辑用）
 * @param {Number} id - 课程ID
 * @returns {Promise}
 */
export const teacherGetCourseById = (id) => {
  return request({
    url: `/teacher/courses/${id}`,
    method: 'get'
  });
};

/**
 * 教师编辑课程
 * @param {Number} id - 课程ID
 * @param {Object} data - 课程信息
 * @returns {Promise}
 */
export const teacherUpdateCourse = (id, data) => {
  return request({
    url: `/teacher/courses/${id}`,
    method: 'put',
    data
  });
};


/**
 * 教师删除课程
 * @param {Number} id - 课程ID
 * @returns {Promise}
 */
export const teacherDeleteCourse = (id) => {
  return request({
    url: `/teacher/courses/${id}`,
    method: 'delete'
  });
};

/**
 * 教师获取课程学生列表
 * @param {Object} params - { courseId, pageNum, pageSize }
 * @returns {Promise}
 */
export const teacherGetCourseStudents = (params) => {
  return request({
    url: '/teacher/courses/students',
    method: 'get',
    params
  });
};