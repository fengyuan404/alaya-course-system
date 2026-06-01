<template>
  <div class="course-form-container">
    <el-page-header :content="isEdit ? '编辑课程' : '创建课程'" @back="goBack" />
    <el-card class="form-card">
      <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="学分" prop="credits">
          <!-- 核心修复1：v-model.number 强制转为数字类型 -->
          <el-input v-model.number="courseForm.credits" type="number" placeholder="请输入学分" />
        </el-form-item>
        <el-form-item label="上课时间" prop="schedule">
          <el-input v-model="courseForm.schedule" placeholder="例如：周一三四 10:00-11:40" />
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="courseForm.location" placeholder="例如：教学楼A201" />
        </el-form-item>
        <el-form-item label="总容量" prop="capacity">
          <!-- 核心修复2：v-model.number 强制转为数字类型 -->
          <el-input v-model.number="courseForm.capacity" type="number" placeholder="请输入课程容量" />
        </el-form-item>


        <el-form-item label="学期" prop="semester" required>
  <!-- 推荐使用下拉选择器，避免格式错误 -->
  <el-select v-model="courseForm.semester" placeholder="请选择学期">
    <el-option label="2025-2026学年第一学期" value="2025-2026-1" />
    <el-option label="2025-2026学年第二学期" value="2025-2026-2" />
    <!-- 可根据实际需求添加更多学期 -->
  </el-select>
</el-form-item>

        <el-form-item label="课程描述" prop="description">
          <el-input v-model="courseForm.description" type="textarea" :rows="5" placeholder="请输入课程描述（选填）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { teacherCreateCourse, teacherGetCourseById, teacherUpdateCourse } from '@/api/course';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const courseFormRef = ref(null);
const loading = ref(false);
const isEdit = ref(!!route.params.id); // 是否为编辑模式（有id则是编辑）

// 课程表单数据 - 初始值用null（避免空字符串干扰数字验证）
const courseForm = ref({
  name: '',
  credits: null,
  schedule: '',
  location: '',
  capacity: null,
  description: '',
  semester: '' // 新增：初始化学期字段
});

// 表单验证规则
const courseRules = ref({
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  credits: [
    { required: true, message: '请输入学分', trigger: 'blur' },
    { type: 'number', min: 1, max: 6, message: '学分需在1-6之间', trigger: 'blur' }
  ],
  schedule: [{ required: true, message: '请输入上课时间', trigger: 'blur' }],
  location: [{ required: true, message: '请输入上课地点', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  capacity: [
    { required: true, message: '请输入课程容量', trigger: 'blur' },
    { type: 'number', min: 10, max: 200, message: '容量需在10-200之间', trigger: 'blur' }
  ]
});

// 页面加载时，编辑模式下获取课程详情
onMounted(() => {
  if (isEdit.value) {
    getCourseDetail();
  }
});

// 获取课程详情（编辑用）- 确保数字字段为数字类型
const getCourseDetail = async () => {
  try {
    const res = await teacherGetCourseById(route.params.id);
    courseForm.value = {
      ...res.data,
      credits: res.data.credits ? Number(res.data.credits) : null,
      capacity: res.data.capacity ? Number(res.data.capacity) : null
    };
  } catch (error) {
    console.error('获取课程详情失败:', error);
    ElMessage.error('获取课程详情失败');
  }
};

// 提交表单 - 完整修复版
const submitForm = async () => {
  try {
    // 1. 先执行表单验证（此时数字类型已通过v-model.number处理）
    await courseFormRef.value.validate();
    loading.value = true;

    // 2. 二次确认数字类型（双重保险，避免后端参数错误）
    const submitData = {
      ...courseForm.value,
      credits: Number(courseForm.value.credits),
      capacity: Number(courseForm.value.capacity)
    };

    // 3. 区分编辑/创建逻辑
    if (isEdit.value) {
      await teacherUpdateCourse(route.params.id, submitData);
      ElMessage.success('课程编辑成功');
    } else {
      await teacherCreateCourse(submitData);
      ElMessage.success('课程创建成功');
    }

    // 4. 跳回我的课程页
    router.push('/home/teacher/my-courses');
  } catch (error) {
    // 区分验证错误和接口错误，精准提示
    console.error('提交失败详情:', error);
    if (error?.name === 'ValidationError') {
      ElMessage.error('表单填写有误，请检查学分和容量是否为有效数字');
    } else if (error?.response?.data?.message) {
      ElMessage.error(error.response.data.message); // 后端返回的具体错误
    } else {
      ElMessage.error(isEdit.value ? '课程编辑失败' : '课程创建失败');
    }
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.course-form-container {
  padding: 10px;
}
.form-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>