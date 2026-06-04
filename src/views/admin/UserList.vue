<template>
  <div class="user-list-container">
    <el-page-header content="用户管理" @back="goBack" />
    <!-- 搜索区 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="searchForm.keyword" placeholder="用户名/学号/工号" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.role" placeholder="用户角色">
            <el-option label="全部" value="" />
            <el-option label="学生" value="STUDENT" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getUsers">查询</el-button>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 操作区 -->
    <div class="operate-btn-group" style="margin: 20px 0;">
      <el-button type="primary" @click="openAddUserDialog">
        <el-icon><Plus /></el-icon>添加用户
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-card>
      <el-table :data="userList" border stripe>
        <el-table-column label="用户ID" prop="id" width="80" />
        <el-table-column label="用户名" prop="username" />
        <el-table-column label="角色" prop="role" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : scope.row.role === 'TEACHER' ? 'warning' : 'success'">
              {{ scope.row.role === 'STUDENT' ? '学生' : scope.row.role === 'TEACHER' ? '教师' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="学号/工号" prop="idCard" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editUser(scope.row)">编辑</el-button>
            <el-button type="warning" size="small" @click="resetUserPwd(scope.row.id)">重置密码</el-button>
            <el-button type="danger" size="small" @click="deleteUser(scope.row.id)" v-if="scope.row.role !== 'admin'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[5, 10, 20]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <!-- 添加/编辑用户弹窗 -->
    <el-dialog v-model="userDialogVisible" :title="isEditUser ? '编辑用户' : '添加用户'" width="600px">
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditUser">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码（至少6位）" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="学生" value="STUDENT" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="学号/工号" prop="idCard">
          <el-input v-model="userForm.idCard" placeholder="学生填学号，教师填工号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUserForm" :loading="userLoading">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminGetUsers, adminAddUser, adminEditUser, adminDeleteUser, adminResetUserPwd } from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();

// 搜索表单
const searchForm = ref({
  keyword: '',
  role: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const userList = ref([]);

// 弹窗相关
const userDialogVisible = ref(false);
const isEditUser = ref(false);
const userFormRef = ref(null);
const userLoading = ref(false);

// 用户表单
const userForm = ref({
  username: '',
  password: '',
  role: '',
  idCard: '',
  email: ''
});

// 用户表单验证规则
const userRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
});

// 页面加载时获取用户列表
onMounted(() => {
  getUsers();
});

// 获取用户列表
const getUsers = async () => {
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      role: searchForm.value.role
    };
    const res = await adminGetUsers(params);
    userList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getUsers();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getUsers();
};

// 返回上一页
const goBack = () => {
 router.go(-1);
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = { keyword: '', role: '' };
  pageNum.value = 1;
  getUsers();
};

// 打开添加用户弹窗
const openAddUserDialog = () => {
  isEditUser.value = false;
  // 重置表单
  userForm.value = {
    username: '',
    password: '',
    role: '',
    idCard: '',
    email: ''
  };
  userDialogVisible.value = true;
};

// 编辑用户
const editUser = (user) => {
  isEditUser.value = true;
  // 填充表单（密码不回显）
  userForm.value = {
    username: user.username,
    password: '',
    role: user.role,
    idCard: user.idCard,
    email: user.email,
    id: user.id // 携带用户ID
  };
  userDialogVisible.value = true;
};

// 提交用户表单（添加/编辑）
const submitUserForm = async () => {
  try {
    // 表单验证
    await userFormRef.value.validate();
    userLoading.value = true;

    if (isEditUser.value) {
      // 编辑用户
      await adminEditUser(userForm.value.id, userForm.value);
      ElMessage.success('用户编辑成功');
    } else {
      // 添加用户
      await adminAddUser(userForm.value);
      ElMessage.success('用户添加成功');
    }

    // 关闭弹窗+刷新列表
    userDialogVisible.value = false;
    getUsers();
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(isEditUser.value ? '用户编辑失败' : '用户添加失败');
  } finally {
    userLoading.value = false;
  }
};

// 重置用户密码
const resetUserPwd = (userId) => {
    ElMessageBox.confirm(
      '确定要重置该用户的密码吗？默认密码为123456',
      '重置密码',
      { type: 'warning' }
    ).then(async () => {
      try {
        await adminResetUserPwd(userId);
        ElMessage.success('密码重置成功（默认密码：123456）');
      } catch (error) {
        console.error('重置密码失败:', error);
        ElMessage.error('重置密码失败');
      }
    }).catch(() => {});
};

// 删除用户
const deleteUser = (userId) => {
    ElMessageBox.confirm(
      '确定要删除该用户吗？删除后将无法恢复！',
      '删除用户',
      { type: 'warning' }
    ).then(async () => {
      try {
        await adminDeleteUser(userId);
        ElMessage.success('用户删除成功');
        getUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
        ElMessage.error('删除用户失败');
      }
    }).catch(() => {});
};
</script>

<style scoped>
.user-list-container {
  padding: 10px;
}
.search-card {
  padding: 20px;
  margin-bottom: 20px;
}
</style>