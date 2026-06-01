<template>
  <div class="forbidden-container">
    <div class="forbidden-box">
      <el-icon size="80" color="#f56c6c"><Lock /></el-icon>
      <h1>403 Forbidden</h1>
      <p>抱歉，你没有访问该页面的权限</p>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
      <el-button @click="goToHome" style="margin-left: 10px;">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Lock } from '@element-plus/icons-vue';

const router = useRouter();

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 返回首页
const goToHome = () => {
  const userStore = useUserStore(); // 实际项目中需导入userStore
  if (userStore.userInfo?.role === 'student') {
    router.push('/home/student/courses');
  } else if (userStore.userInfo?.role === 'teacher') {
    router.push('/home/teacher/my-courses');
  } else if (userStore.userInfo?.role === 'admin') {
    router.push('/home/admin/users');
  } else {
    router.push('/login');
  }
};
</script>

<style scoped>
.forbidden-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.forbidden-box {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.forbidden-box h1 {
  font-size: 36px;
  color: #f56c6c;
  margin: 20px 0;
}
.forbidden-box p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}
</style>