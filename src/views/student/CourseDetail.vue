<template>
  <div class="course-detail-container">
    <el-page-header content="课程详情" @back="goBack" />
    <el-card class="detail-card">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程ID">{{ courseInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ courseInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="授课教师">{{ courseInfo.teacher?.username || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ courseInfo.credits }}</el-descriptions-item>
        <el-descriptions-item label="上课时间">{{ courseInfo.schedule }}</el-descriptions-item>
        <el-descriptions-item label="上课地点">{{ courseInfo.location }}</el-descriptions-item>
        <el-descriptions-item label="总容量">{{ courseInfo.capacity }}</el-descriptions-item>
        <el-descriptions-item label="已选人数">{{ courseInfo.selectedCount }}</el-descriptions-item>
        <el-descriptions-item label="课程描述" :span="2">{{ courseInfo.description || '无' }}</el-descriptions-item>
      </el-descriptions>
      <div class="btn-group" style="margin-top: 20px;">
        <el-button type="primary" @click="selectCourse" :disabled="courseInfo.capacity - courseInfo.selectedCount <= 0">
          选课
        </el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentGetCourseDetail } from '@/api/course';
import { studentSelectCourse } from '@/api/selection';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const courseId = ref(route.params.id);
const courseInfo = ref({});

// 页面加载时获取课程详情
onMounted(() => {
  getCourseDetail();
});

// 获取课程详情
const getCourseDetail = async () => {
  try {
    const res = await studentGetCourseDetail(courseId.value);
    courseInfo.value = res.data;
  } catch (error) {
    console.error('获取课程详情失败:', error);
    ElMessage.error('获取课程详情失败');
  }
};

// 选课
const selectCourse = async () => {
  try {
    await studentSelectCourse(courseId.value);
    ElMessage.success('选课成功');
    goBack();
  } catch (error) {
    console.error('选课失败:', error);
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.course-detail-container {
  padding: 10px;
}
.detail-card {
  margin-top: 10px;
}
.btn-group {
  text-align: center;
}
</style>