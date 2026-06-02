<template>
  <div class="course-stat-container">
    <el-page-header content="课程统计" />
    <!-- 筛选区 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="searchForm.semester" placeholder="请选择学期">
            <el-option label="全部" value="" />
            <el-option label="2025-2026学年第一学期" value="2025-2026-1" />
            <el-option label="2025-2026学年第二学期" value="2025-2026-2" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="searchForm.teacherId" placeholder="授课教师">
            <el-option label="全部" value="" />
            <el-option v-for="teacher in teacherList" :key="teacher.id" :label="teacher.username" :value="teacher.id" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="getCourseStat">查询</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计概览 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <span class="stat-label">总课程数</span>
            <span class="stat-value">{{ statData.totalCourse }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <span class="stat-label">总选课人数</span>
            <span class="stat-value">{{ statData.totalSelected }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <span class="stat-label">平均选课数</span>
            <span class="stat-value">{{ statData.averageSelected }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <span class="stat-label">热门课程数</span>
            <span class="stat-value">{{ statData.hotCourseCount }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程统计列表 -->
    <el-card>
      <el-table :data="courseStatList" border stripe>
        <el-table-column label="课程名称" prop="name" />
        <el-table-column label="授课教师" prop="teacher.username" />
        <el-table-column label="学分" prop="credits" width="80" />
        <el-table-column label="总容量" prop="capacity" width="80" />
        <el-table-column label="已选人数" prop="selectedCount" width="80" />
        <el-table-column label="选课率" width="100">
          <template #default="scope">
            <el-progress :percentage="scope.row.selectedRate" :width="80" />
            <span style="margin-left: 10px;">{{ scope.row.selectedRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="学期" prop="semester" />
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

    <!-- 导出按钮 -->
    <div style="margin-top: 20px; text-align: right;">
      <el-button type="success" @click="exportCourseStat">
        <el-icon><Download /></el-icon>导出统计数据
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminGetCourseStat, adminGetTeachers } from '@/api/stat';
import { adminExportCourseStat } from '@/api/export';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';

// 搜索表单
const searchForm = ref({
  semester: '',
  teacherId: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 统计数据
const statData = ref({
  totalCourse: 0,
  totalSelected: 0,
  averageSelected: 0,
  hotCourseCount: 0
});
const courseStatList = ref([]);
const teacherList = ref([]);

// 页面加载时获取教师列表+默认统计
onMounted(() => {
  getTeachers();
  getCourseStat();
});

// 获取教师列表（筛选用）
const getTeachers = async () => {
  try {
    const res = await adminGetTeachers();
    teacherList.value = res.data;
  } catch (error) {
    console.error('获取教师列表失败:', error);
  }
};

// 获取课程统计数据
const getCourseStat = async () => {
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      semester: searchForm.value.semester,
      teacherId: searchForm.value.teacherId
    };
    const res = await adminGetCourseStat(params);
    statData.value = res.data.summary;
    courseStatList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    console.error('获取课程统计失败:', error);
    ElMessage.error('获取课程统计失败');
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getCourseStat();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getCourseStat();
};

// 导出统计数据
const exportCourseStat = async () => {
  try {
    const params = {
      semester: searchForm.value.semester,
      teacherId: searchForm.value.teacherId
    };
    const res = await adminExportCourseStat(params);
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `课程统计_${new Date().getTime()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};
</script>

<style scoped>
.course-stat-container {
  padding: 10px;
}
.search-card {
  padding: 20px;
  margin-bottom: 20px;
}
.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-item {
  text-align: center;
}
.stat-label {
  font-size: 16px;
  color: #666;
  display: block;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
</style>