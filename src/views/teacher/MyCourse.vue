<template>
  <div class="my-course-container">
    <el-page-header content="我的课程" />
    <!-- 操作区 -->
    <div class="operate-btn-group" style="margin-bottom: 20px;">
      <el-button type="primary" @click="goToCreateCourse">
        <el-icon><Plus /></el-icon>创建课程
      </el-button>
    </div>

    <!-- 课程列表 -->
    <el-card>
      <el-table :data="courseList" border stripe>
        <el-table-column label="课程ID" prop="id" width="80" />
        <el-table-column label="课程名称" prop="name" />
        <el-table-column label="学分" prop="credits" width="80" />
        <el-table-column label="上课时间" prop="schedule" />
        <el-table-column label="上课地点" prop="location" />
        <el-table-column label="总容量" prop="capacity" width="80" />
        <el-table-column label="已选人数" prop="selectedCount" width="80" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="goToCourseStudent(scope.row.id)">查看选课学生</el-button>
            <el-button type="warning" size="small" @click="goToGradeInput(scope.row.id)">录入成绩</el-button>
            <el-button type="success" size="small" @click="goToEditCourse(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteCourse(scope.row.id)">删除</el-button>
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
import { useRouter } from 'vue-router';
import { teacherGetMyCourses, teacherDeleteCourse } from '@/api/course';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const courseList = ref([]);

// 页面加载时获取我的课程
onMounted(() => {
  getMyCourses();
});

// 获取我的课程
const getMyCourses = async () => {
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value };
    const res = await teacherGetMyCourses(params);
    courseList.value = res.data;
    total.value = res.data.total;
  } catch (error) {
    console.error('获取我的课程失败:', error);
    ElMessage.error('获取我的课程失败');
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getMyCourses();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getMyCourses();
};

// 跳转到创建课程页
const goToCreateCourse = () => {
  router.push('/home/teacher/course/create');
};

// 跳转到编辑课程
const goToEditCourse = (courseId) => {
  router.push(`/home/teacher/course/${courseId}/edit`);
};

// 跳转到选课学生列表
const goToCourseStudent = (courseId) => {
  router.push(`/home/teacher/course/${courseId}/students`);
};

// 跳转到成绩录入页
const goToGradeInput = (courseId) => {
  router.push(`/home/teacher/course/${courseId}/grade-input`);
};

// 删除课程
const deleteCourse = (courseId) => {
  ElMessageBox.confirm(
    '确定要删除这门课程吗？删除后将无法恢复！',
    '确认删除',
    { type: 'warning' }
  ).then(async () => {
    try {
      await teacherDeleteCourse(courseId);
      ElMessage.success('课程删除成功');
      getMyCourses();
    } catch (error) {
      console.error('删除课程失败:', error);
      ElMessage.error('删除课程失败（可能已有学生选课）');
    }
  }).catch(() => {});
};
</script>

<style scoped>
.my-course-container {
  padding: 10px;
}
</style>