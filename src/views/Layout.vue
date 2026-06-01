<template>
  <div class="-container">
    <!-- 顶部导航 -->
    <el-header class="-header">
      <div class="header-left">{{ appTitle }}</div>
      <div class="header-right">
        <el-dropdown trigger="click">
          <span class="user-info">
            <el-icon><User /></el-icon>
            {{ userStore.userInfo?.username }}（{{ userStore.userInfo?.role }}）
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToProfile">
                <el-icon><UserFilled /></el-icon>
                <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="-content">
      <!-- 侧边栏 -->
      <el-aside class="-aside">
        <el-menu 
          :default-active="activeMenu" 
          class="aside-menu" 
          router
          unique-opened
          background-color="#f5f7fa"
          text-color="#333"
          active-text-color="#409eff"
        >
          <!-- 学生菜单（修复：角色判断改为大写 STUDENT） -->
          <template v-if="userStore.userInfo?.role === 'STUDENT'">
            <el-sub-menu index="student" popper-class="menu-popper">
              <template #title>
                <el-icon><User /></el-icon>
                <span>学生功能</span>
              </template>
              <el-menu-item index="/home/student/courses">
                <el-icon><Search /></el-icon>
                <span>课程查询</span>
              </el-menu-item>
              <el-menu-item index="/home/student/selected-courses">
                <el-icon><Check /></el-icon>
                <span>已选课程</span>
              </el-menu-item>
              <el-menu-item index="/home/student/grades">
                <el-icon><Rank /></el-icon>
                <span>成绩查询</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/home/profile">
              <el-icon><UserFilled /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
          </template>

          <!-- 教师菜单（修复：角色判断改为大写 TEACHER） -->
          <template v-if="userStore.userInfo?.role === 'TEACHER'">
            <el-sub-menu index="teacher" popper-class="menu-popper">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>教师功能</span>
              </template>
              <el-menu-item index="/home/teacher/my-courses">
                <el-icon><Document /></el-icon>
                <span>我的课程</span>
              </el-menu-item>
              <el-menu-item index="/home/teacher/course/create">
                <el-icon><Plus /></el-icon>
                <span>创建课程</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/home/profile">
              <el-icon><UserFilled /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
          </template>

          <!-- 管理员菜单（修复：角色判断改为大写 ADMIN） -->
          <template v-if="userStore.userInfo?.role === 'ADMIN'">
            <el-sub-menu index="admin" popper-class="menu-popper">
              <template #title>
                <el-icon><UserFilled /></el-icon>
                <span>管理员功能</span>
              </template>
              <el-menu-item index="/home/admin/users">
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </el-menu-item>
              <el-menu-item index="/home/admin/course-stat">
                <el-icon><Histogram /></el-icon>
                <span>课程统计</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/home/profile">
              <el-icon><UserFilled /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="-main">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage, ElMessageBox } from 'element-plus';
// 导入Element Plus图标（补充缺失的SwitchButton图标）
import { 
  User, UserFilled, Search, Check, Document, 
  Plus, Rank, Histogram, SwitchButton 
} from '@element-plus/icons-vue';

// 应用标题（从环境变量读取，无则用默认值）
const appTitle = import.meta.env.VITE_APP_TITLE || 'Alaya大学选课系统';

// 状态与路由实例
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const activeMenu = ref(route.path);

// 监听路由变化，实时更新激活的侧边栏菜单
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true, deep: true }
);

// 页面挂载时初始化菜单激活状态（防止刷新后菜单失活）
onMounted(() => {
  activeMenu.value = route.path;
});

// 跳转到个人中心
const goToProfile = () => {
  router.push('/home/profile');
};

// 退出登录（添加确认提示，提升体验）
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    // 调用store的退出方法
    userStore.logout();
    ElMessage.success('退出登录成功！');
    router.push('/login');
  } catch (error) {
    ElMessage.info('已取消退出');
  }
};
</script>

<style scoped>
/* 整体容器 */
.-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

/* 顶部导航栏 */
.-header {
  background: #409eff;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-left {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.user-info:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 内容区域（侧边栏+主内容） */
.-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.-aside {
  width: 200px;
  background: #f5f7fa;
  border-right: 1px solid #e6e8eb;
  transition: width 0.2s;
}
.aside-menu {
  height: 100%;
  border-right: none;
  padding-top: 12px;
}
/* 子菜单弹出层样式 */
:deep(.menu-popper) {
  --el-menu-text-color: #333;
  --el-menu-active-text-color: #409eff;
  --el-menu-hover-text-color: #409eff;
}
/* 菜单项hover/选中样式优化 */
:deep(.el-menu-item) {
  margin: 0 8px;
  border-radius: 4px;
}
:deep(.el-menu-item:hover) {
  background-color: #e8f4ff !important;
}
:deep(.el-menu-item.is-active) {
  background-color: #e8f4ff !important;
  color: #409eff !important;
}
:deep(.el-sub-menu__title) {
  margin: 0 8px;
  border-radius: 4px;
}
:deep(.el-sub-menu__title:hover) {
  background-color: #e8f4ff !important;
}

/* 主内容区 */
.-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #fafafa;
}

/* 滚动条优化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: #dcdfe6;
}
::-webkit-scrollbar-track {
  background: #f5f5f5;
}
</style>