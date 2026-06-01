<template>
  <div class="profile-container">
    <!-- 修复：确保标签正确闭合，属性名无特殊字符 -->
    <el-page-header 
      content="个人中心" 
      @back="handleBack"
      class="page-header"
    ></el-page-header> <!-- 补充结束标签，避免"missing end tag" -->
    <el-card class="profile-card">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-form 
            :model="userForm" 
            label-width="100px"
            disabled
            class="info-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" />
            </el-form-item>
            <el-form-item label="角色">
              <el-input v-model="userForm.role" />
            </el-form-item>
            <el-form-item label="学号/工号">
              <el-input v-model="userForm.idCard" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form 
            :model="pwdForm" 
            :rules="pwdRules" 
            ref="pwdFormRef" 
            label-width="100px"
            class="pwd-form"
          >
            <el-form-item label="原密码" prop="oldPwd">
              <el-input 
                v-model="pwdForm.oldPwd" 
                type="password" 
                placeholder="请输入原密码" 
                clearable
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPwd">
              <el-input 
                v-model="pwdForm.newPwd" 
                type="password" 
                placeholder="请输入新密码（至少6位）" 
                clearable
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPwd">
              <el-input 
                v-model="pwdForm.confirmPwd" 
                type="password" 
                placeholder="请再次输入新密码" 
                clearable
              />
            </el-form-item>
            <el-form-item class="pwd-btn-group">
              <el-button type="primary" @click="handleUpdatePassword">提交修改</el-button>
              <el-button @click="resetPwdForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { updatePassword as apiUpdatePassword } from '@/api/auth';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();
const activeTab = ref('info');
const pwdFormRef = ref(null);

const userForm = ref({
  username: '',
  role: '',
  idCard: '',
  email: ''
});

const pwdForm = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
});

const pwdRules = ref({
  oldPwd: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.value.newPwd) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

onMounted(() => {
  if (userStore.userInfo) {
    userForm.value = {
      username: userStore.userInfo.username || '',
      role: userStore.userInfo.role || '',
      idCard: userStore.userInfo.id || '',
      email: userStore.userInfo.email || ''
    };
  }
});

const handleBack = () => {
  router.go(-1).catch(() => {
    router.push('/home');
  });
};

const handleUpdatePassword = async () => {
  try {
    await pwdFormRef.value.validate();
    await apiUpdatePassword(pwdForm.value.oldPwd, pwdForm.value.newPwd);
    ElMessage.success('密码修改成功，请重新登录');
    userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('修改密码失败:', error);
    if (error.response?.status === 401) {
      ElMessage.error('原密码输入错误');
    } else {
      ElMessage.error('修改密码失败，请稍后重试');
    }
  }
};

const resetPwdForm = () => {
  pwdFormRef.value.resetFields();
  pwdForm.value = {
    oldPwd: '',
    newPwd: '',
    confirmPwd: ''
  };
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.profile-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.profile-tabs {
  --el-tabs-header-text-color: #666;
  --el-tabs-active-text-color: #409eff;
  --el-tabs-border-color: #e5e7eb;
}

.info-form {
  padding: 10px 0;
}

.pwd-form {
  padding: 10px 0;
}

.pwd-btn-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* 修复：删除CSS中的label-width（这是el-form的HTML属性，不是CSS属性） */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  /* 移除错误的label-width CSS设置 */
}
</style>