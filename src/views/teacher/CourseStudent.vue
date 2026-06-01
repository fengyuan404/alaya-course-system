<template>
  <div class="course-student-container">
    <el-page-header content="选课学生列表" @back="goBack" />
    <el-card>
      <el-table :data="studentList" border stripe>
        <el-table-column label="选课ID" prop="id" width="80" />
        <el-table-column label="学生姓名" prop="student.username" />
        <el-table-column label="学号" prop="student.idCard" />
        <el-table-column label="选课时间" prop="selectTime" />
        <el-table-column label="成绩状态" prop="gradeStatus" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.gradeStatus === '未录入'" type="warning">未录入</el-tag>
            <el-tag v-else type="success">已录入</el-tag>
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
import { useRoute, useRouter } from 'vue-router';
import { teacherGetCourseStudents } from '@/api/course';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const courseId = ref(route.params.id);

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const studentList = ref([]);

// 页面加载时获取选课学生
onMounted(() => {
  getCourseStudents();
});

// 获取选课学生列表
const getCourseStudents = async () => {
  try {
    const params = {
      courseId: courseId.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    };
    const res = await teacherGetCourseStudents(params);
    studentList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    console.error('获取选课学生失败:', error);
    ElMessage.error('获取选课学生失败');
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getCourseStudents();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getCourseStudents();
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.course-student-container {
  padding: 10px;
}
</style>