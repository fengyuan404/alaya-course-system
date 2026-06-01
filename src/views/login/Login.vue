<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <h2 class="login-title">系统登录</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
            size="default"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            clearable
            size="default"
          />
        </el-form-item>

        <el-form-item class="login-btn-group">
          <el-button
            type="primary"
            size="default"
            @click="handleLogin"
            class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import qs from 'qs'; // 序列化表单参数（需安装：npm install qs）
import { useUserStore } from '@/store/user'; // 确认路径与实际项目一致

// 路由实例
const router = useRouter();
// 用户Store实例
const userStore = useUserStore();

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单校验规则
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ]
});

// 表单引用
const loginFormRef = ref(null);

/**
 * 处理登录逻辑
 */
const handleLogin = async () => {
  // 1. 表单校验
  const validateResult = await loginFormRef.value.validate().catch(err => {
    console.error('表单校验失败：', err);
    return false;
  });
  if (!validateResult) return;

  // 2. 序列化参数
  const formData = qs.stringify({
    username: loginForm.username,
    password: loginForm.password
  });
  console.log('发送的登录参数：', formData);

  // 3. 调用登录方法 + 捕获跳转错误
  try {
    const loginSuccess = await userStore.login(formData);
    console.log('登录方法返回结果：', loginSuccess); // 确认是否为true
    if (loginSuccess) {
      ElMessage.success('登录成功！');
      // 关键：确认路由路径 /home 是存在的！
      // 替换为你实际的首页路由（比如 /dashboard、/index）
      const targetPath = '/home'; 
      console.log('准备跳转到：', targetPath);
      await router.push(targetPath).catch(routerErr => {
        console.error('路由跳转失败：', routerErr);
        // 跳转失败的兜底：手动修改地址栏
        window.location.href = targetPath;
      });
    }
  } catch (err) {
    console.error('登录流程异常：', err);
    ElMessage.error('登录成功但跳转失败，请手动进入首页');
  }
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}

.login-form {
  margin-top: 10px;
}

.login-btn-group {
  text-align: center;
  margin-top: 15px;
}

.login-btn {
  width: 100%;
}
</style>