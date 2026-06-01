<template>
  <div class="selected-course-container">
    <el-page-header content="已选课程" />
    <el-card class="course-table-card">
      <el-table :data="selectedList" border stripe>
        <el-table-column label="选课ID" prop="id" width="80" />
        <el-table-column label="课程名称" prop="course.name" />
        <el-table-column label="授课教师" prop="course.teacher.username" />
        <el-table-column label="学分" prop="course.credits" width="80" />
        <el-table-column label="上课时间" prop="course.schedule" />
        <el-table-column label="选课时间" prop="selectTime" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" size="small" @click="dropCourse(scope.row.id)">退课</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { studentGetSelectedCourses } from '@/api/course';
import { studentDropCourse } from '@/api/selection';
import { ElMessage, ElMessageBox } from 'element-plus';
// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const selectedList = ref([]);

// 页面加载时获取已选课程
onMounted(() => {
  getSelectedCourses();
});

// 获取已选课程
// const getSelectedCourses = async () => {
//   try {
//     const params = { pageNum: pageNum.value, pageSize: pageSize.value };
//     const res = await studentGetSelectedCourses(params);
//     selectedList.value = res.data.list;
//     total.value = res.data.total;
//   } catch (error) {
//     console.error('获取已选课程失败:', error);
//   }
// };

const getSelectedCourses = async () => {
  try {
    // 注意：已选课程接口通常无需分页（学生选课数量有限），可直接调用
    const res = await studentGetSelectedCourses(); // 移除分页参数
    selectedList.value = res.data || []; // ✅ 直接取res.data（后端返回的数组）
    total.value = selectedList.value.length; // ✅ total为数组长度（适配分页）
  } catch (error) {
    console.error('获取已选课程失败:', error);
    selectedList.value = [];
    total.value = 0;
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getSelectedCourses();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getSelectedCourses();
};

// 退课
const dropCourse = (selectionId) => {
  ElMessageBox.confirm({
    title: '确认退课',
    message: '确定要退选这门课程吗？',
    type: 'warning',
    async confirm() {
      try {
        await studentDropCourse(selectionId);
        ElMessage.success('退课成功');
        getSelectedCourses(); // 刷新列表
      } catch (error) {
        console.error('退课失败:', error);
        ElMessage.error('退课失败');
      }
    }
  });
};
</script>

<style scoped>
.selected-course-container {
  padding: 10px;
}
</style>