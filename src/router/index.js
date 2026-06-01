import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

// 导入页面组件（不变，省略重复代码）
import Login from '@/views/login/Login.vue';
import Layout from '@/views/Layout.vue';
// ... 其他组件导入保持不变
import Forbidden from '@/views/403.vue'
import Profile from '@/views/profile/Profile.vue'; 
import StudentCourseList from '@/views/student/CourseList.vue'; 

// ========== 学生模块组件导入 ==========
// 课程详情
import StudentCourseDetail from '@/views/student/CourseDetail.vue';
// 已选课程
import StudentSelectedCourse from '@/views/student/SelectedCourse.vue';
// 成绩查询
import StudentGradeList from '@/views/student/GradeList.vue';

// ========== 教师模块组件导入 ==========
// 我的课程
import TeacherMyCourse from '@/views/teacher/MyCourse.vue';
// 创建/编辑课程表单
import TeacherCourseForm from '@/views/teacher/CourseForm.vue';

// ========== 管理员模块组件导入 ==========
// 用户管理
import AdminUserList from '@/views/admin/UserList.vue';
// 课程统计
import AdminCourseStat from '@/views/admin/CourseStat.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { noAuth: true } },
  { path: '/403', component: Forbidden, meta: { noAuth: true } },
  {
    path: '/home',
    component: Layout,
    meta: { requiresAuth: true }, // 需要登录
    children: [
      { path: 'profile', component: Profile, name: '个人中心' }, // 公共路由，无角色限制
      // 学生路由：meta.role 改为大写（与后端返回一致）
      {
        path: 'student/courses',
        component: StudentCourseList,
        name: '课程查询',
        meta: { role: 'STUDENT' } // 改为大写
      },
      {
        path: 'student/course/:id',
        component: StudentCourseDetail,
        name: '课程详情',
        meta: { role: 'STUDENT' } // 改为大写
      },
      {
        path: 'student/selected-courses',
        component: StudentSelectedCourse,
        name: '已选课程',
        meta: { role: 'STUDENT' } // 改为大写
      },
      {
        path: 'student/grades',
        component: StudentGradeList,
        name: '成绩查询',
        meta: { role: 'STUDENT' } // 改为大写
      },

      {
        path: 'teacher/my-courses',
        component: TeacherMyCourse,
        name: '我的课程',
        meta: { role: 'TEACHER' } // 改为大写
      },
      {
        path: 'teacher/course/create',
        component: TeacherCourseForm,
        name: '创建课程',
        meta: { role: 'TEACHER' } // 改为大写
      },
          // ========== 新增：成绩录入页面路由 ==========
      {
        path: 'teacher/course/:courseId/grade-input', // 匹配URL：/home/teacher/course/1/grade-input
        component: () => import('@/views/teacher/GradeInput.vue'), // 懒加载组件
        name: '成绩录入',
        meta: { role: 'TEACHER' } // 仅教师可访问
      },
      {
        path: 'teacher/course/:id/edit',
        component: TeacherCourseForm,
        name: '编辑课程',
        meta: { role: 'TEACHER' }
      },
      {
        path: 'teacher/course/:id/students',
        component: () => import('@/views/teacher/CourseStudent.vue'),
        name: '选课学生',
        meta: { role: 'TEACHER' }
      },

      {
        path: 'admin/users',
        component: AdminUserList,
        name: '用户管理',
        meta: { role: 'ADMIN' } // 改为大写
      },
      {
        path: 'admin/course-stat',
        component: AdminCourseStat,
        name: '课程统计',
        meta: { role: 'ADMIN' } // 改为大写
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 修复后的路由守卫逻辑
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 1. 无需登录的页面（如登录页、403页）直接放行
  if (to.meta.noAuth) {
    next();
    return;
  }

  // 2. 需要登录的页面
  if (to.meta.requiresAuth) {
    // 核心修改：用 isLogin 判断是否登录（而非 token）
    if (!userStore.isLogin) {
      ElMessage.warning('请先登录');
      next('/login');
      return;
    }

    // 3. 验证角色权限（如果路由有角色要求）
    if (to.meta.role) {
      // 后端返回的 role 是大写（如 STUDENT），直接匹配
      if (userStore.userInfo?.role !== to.meta.role) {
        ElMessage.error('无权限访问该页面');
        next('/403');
        return;
      }
    }

    // 4. 登录且有权限，放行
    next();
    return;
  }

  // 其他情况默认放行
  next();
});

export default router;