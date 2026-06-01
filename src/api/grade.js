import request from '@/utils/request.js';

// 教师-录入/修改成绩
export const teacherSaveGrade = (data) => {
  return request({
    url: '/teacher/grades',
    method: 'POST',
    data // selectionId、score、level、comment
  });
};

// 学生-查询成绩
export const studentGetGrades = (params) => {
  return request({
    url: '/grades/student',
    method: 'GET',
    params // semester、pageNum、pageSize
  });
};

// 补充缺失的批量保存成绩函数（核心修复）
export const teacherBatchSaveGrade = (data) => {
  return request({
    url: '/teacher/grades/batch',
    method: 'post',
    data
  });
};