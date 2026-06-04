<template>
  <div class="grade-list-container">
    <el-page-header content="成绩查询" @back="goBack" />
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
        <el-col :span="4">
          <el-button type="primary" @click="getGrades">查询</el-button>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 成绩列表 -->
    <el-card class="grade-table-card" style="margin-top: 20px;">
      <el-table :data="gradeList" border stripe>
        <el-table-column label="课程名称" prop="selection.course.name" />
        <el-table-column label="学分" prop="selection.course.credits" width="80" />
        <el-table-column label="分数" prop="score" width="80" />
        <el-table-column label="等级" width="80">
          <template #default="scope">
            {{ {A:'优秀',B:'良好',C:'中等',D:'及格',F:'不及格'}[scope.row.level] || scope.row.level }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="comment" />
        <el-table-column label="学期" prop="selection.semester" />
        <el-table-column label="录入时间" prop="createTime" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentGetGrades } from '@/api/grade';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 搜索表单
const searchForm = ref({
  semester: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const gradeList = ref([]);

// 页面加载时获取成绩
onMounted(() => {
  getGrades();
});

// 获取成绩列表
const getGrades = async () => {
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      semester: searchForm.value.semester
    };
    const res = await studentGetGrades(params);
    gradeList.value = Array.isArray(res.data) ? res.data : [];
    total.value = gradeList.value.length;
  } catch (error) {
    console.error('获取成绩失败:', error);
    ElMessage.error('获取成绩失败');
  }
};

// 返回上一页
const goBack = () => {
 router.go(-1);
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = { semester: '' };
  pageNum.value = 1;
  getGrades();
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getGrades();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getGrades();
};
</script>

<style scoped>
.grade-list-container {
  padding: 10px;
}
.search-card {
  padding: 20px;
}
</style>