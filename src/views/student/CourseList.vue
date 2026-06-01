<template>
  <div class="course-list-container">
    <!-- 页面头部：修复返回按钮交互 -->
    <el-page-header 
      content="课程查询" 
      @back="handleBack" 
    />

    <!-- 搜索区：修复图标使用 + 优化布局 -->
    <el-card class="search-card" shadow="hover">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <!-- 修复：Search图标使用错误 → 改用prefix-icon + 导入的图标组件 -->
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="请输入课程名/教师名" 
            :prefix-icon="Search" 
            clearable  
          
          />
        </el-col>
        <el-col :span="6">
          <el-select 
            v-model="searchForm.credits" 
            placeholder="请选择学分" 
            clearable 
          >
            <el-option label="1学分" value="1" />
            <el-option label="2学分" value="2" />
            <el-option label="3学分" value="3" />
            <el-option label="4学分" value="4" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getCourses" :loading="loading">搜索</el-button> <!-- 新增：加载状态 -->
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 课程列表：优化样式 + 完善状态提示 -->
    <el-card class="course-table-card" style="margin-top: 20px;" shadow="hover">
      <!-- 空数据提示 -->
      <div v-if="courseList.length === 0 && !loading" class="empty-tip">
        <el-empty description="暂无课程数据" />
      </div>

      <!-- 课程表格：保留原有逻辑，优化样式 -->
      <el-table 
        v-else
        :data="courseList" 
        border 
        stripe 
        :loading="loading" 
        style="width: 100%;"
      >
        <el-table-column label="课程ID" prop="id" width="80" align="center" />
        <el-table-column label="课程名称" prop="name" min-width="150" />
        <el-table-column label="授课教师" prop="teacher.username" min-width="120" />
        <el-table-column label="学分" prop="credits" width="80" align="center" />
        <el-table-column label="上课时间" prop="schedule" min-width="120" />
        
        
        <el-table-column label="上课地点" prop="location" min-width="120" />
        <el-table-column label="剩余容量" width="120" align="center">
          <template #default="scope">
            <span :class="scope.row.capacity - scope.row.selectedCount <= 0 ? 'text-danger' : ''">
              {{ scope.row.capacity - scope.row.selectedCount }}/{{ scope.row.capacity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="scope">
            <el-button type="text" @click="goToDetail(scope.row.id)">查看详情</el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="selectCourse(scope.row.id)" 
              :disabled="scope.row.capacity - scope.row.selectedCount <= 0"
            >
              选课
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页：优化样式 + 仅在有数据时显示 -->
      <el-pagination
        v-if="total > 0"
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
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // 新增：useRoute用于返回逻辑
import { ElMessage, ElMessageBox } from 'element-plus'; // 新增：ElMessageBox用于选课确认
import { Search } from '@element-plus/icons-vue'; // 图标组件正确导入

// 导入API方法（确保接口路径和参数与后端一致）
import { studentGetCourses } from '@/api/course';
import { studentSelectCourse } from '@/api/selection';

const router = useRouter();
const route = useRoute(); // 新增：获取当前路由信息

// 搜索表单：初始值为空
const searchForm = ref({
  keyword: '',
  credits: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const courseList = ref([]);
const loading = ref(false); // 新增：加载状态标识

// 页面加载时获取课程列表
onMounted(() => {
  getCourses();
});

// 获取课程列表：新增加载状态 + 完善错误提示
const getCourses = async () => {
  try {
    loading.value = true; // 开启加载
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword.trim(), // 新增：去除首尾空格
      //credits: searchForm.value.credits
    };
    // 关键修复：credits非空时转数字，空则不传（避免传""）
    if (searchForm.value.credits && searchForm.value.credits !== '') {
      params.credits = Number(searchForm.value.credits); // 转数字
    }
    // 空值时，params中无credits字段，后端接收为null，不会报错
    const res = await studentGetCourses(params);
    // 适配后端响应格式（根据实际返回结构调整）
    courseList.value = res.data?.list || [];
    total.value = res.data?.total || 0;
  } catch (error) {
    console.error('获取课程失败:', error);
    ElMessage.error('获取课程列表失败，请稍后重试');
    courseList.value = [];
    total.value = 0;
  } finally {
    loading.value = false; // 关闭加载（无论成功/失败）
  }
};

// 重置搜索：恢复初始状态并重新查询
const resetSearch = () => {
  searchForm.value = { keyword: '', credits: 'undefined' };
  pageNum.value = 1; // 重置页码
  getCourses();
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getCourses();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getCourses();
};

// 跳转到课程详情：确保路由路径正确
const goToDetail = (id) => {
  router.push({
    path: `/home/student/course/${id}`,
    query: route.query // 携带当前查询参数（可选）
  });
};

// 选课：新增确认弹窗 + 完善成功/失败提示
const selectCourse = async (courseId) => {
  try {
    // 新增：选课确认弹窗
    await ElMessageBox.confirm(
      '确认选择该课程吗？',
      '选课确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await studentSelectCourse(courseId);
    ElMessage.success('选课成功！');
    getCourses(); // 刷新课程列表
  } catch (error) {
    // 取消选课不提示错误
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '选课失败，请稍后重试');
    }
  }
};

// 新增：返回上一页（适配el-page-header的back事件）
const handleBack = () => {
  router.go(-1); // 返回上一页
  // 若需要固定返回至个人中心，可替换为：
  // router.push('/home/profile');
};
</script>

<style scoped>
.course-list-container {
  padding: 16px; /* 优化内边距 */
}

.search-card {
  padding: 20px;
  margin-bottom: 16px; /* 新增：与下方卡片间距 */
}

/* 空数据提示样式 */
.empty-tip {
  padding: 40px 0;
  text-align: center;
}

/* 剩余容量红色提示 */
.text-danger {
  color: #f56c6c;
  font-weight: 500;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-header-text-color: #303133;
  --el-table-row-hover-bg-color: #f8f9fa;
}

/* 分页样式优化 */
:deep(.el-pagination) {
  --el-pagination-text-color: #606266;
}
</style>