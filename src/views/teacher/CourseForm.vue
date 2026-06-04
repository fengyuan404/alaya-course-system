<template>
  <div class="course-form-container">
    <el-page-header :content="isEdit ? '编辑课程' : '创建课程'" @back="goBack" />
    <el-card class="form-card">
      <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="学分" prop="credits">
          <el-input v-model.number="courseForm.credits" type="number" placeholder="请输入学分" />
        </el-form-item>
        <el-form-item label="上课时间" prop="schedule" required>
          <div class="schedule-picker">
            <el-checkbox-group v-model="scheduleDays" class="day-checkboxes">
              <el-checkbox label="周一" />
              <el-checkbox label="周二" />
              <el-checkbox label="周三" />
              <el-checkbox label="周四" />
              <el-checkbox label="周五" />
              <el-checkbox label="周六" />
              <el-checkbox label="周日" />
            </el-checkbox-group>
            <div class="time-row">
              <el-time-select
                v-model="scheduleStart"
                placeholder="开始时间"
                start="08:00"
                end="21:00"
                step="00:10"
              />
              <span class="time-separator">—</span>
              <el-time-select
                v-model="scheduleEnd"
                placeholder="结束时间"
                start="08:00"
                end="21:00"
                step="00:10"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="courseForm.location" placeholder="例如：教学楼A201" />
        </el-form-item>
        <el-form-item label="总容量" prop="capacity">
          <el-input v-model.number="courseForm.capacity" type="number" placeholder="请输入课程容量" />
        </el-form-item>
        <el-form-item label="学期" prop="semester" required>
          <el-select v-model="courseForm.semester" placeholder="请选择学期">
            <el-option label="2025-2026学年第一学期" value="2025-2026-1" />
            <el-option label="2025-2026学年第二学期" value="2025-2026-2" />
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { teacherCreateCourse, teacherGetCourseById, teacherUpdateCourse } from '@/api/course';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const courseFormRef = ref(null);
const loading = ref(false);
const isEdit = ref(!!route.params.id);

// 课程表单数据
const courseForm = ref({
  name: '',
  credits: null,
  schedule: '',
  location: '',
  capacity: null,
  description: '',
  semester: ''
});

// 上课时间选择器
const scheduleDays = ref([]);
const scheduleStart = ref('');
const scheduleEnd = ref('');

// 星期映射：用于解析已有 schedule 字符串
const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAY_NUM_MAP = { '一': '周一', '二': '周二', '三': '周三', '四': '周四', '五': '周五', '六': '周六', '日': '周日' };

// 组合星期+时间 → schedule 字符串
const composeSchedule = () => {
  const days = scheduleDays.value.join('');
  const start = scheduleStart.value;
  const end = scheduleEnd.value;
  if (days && start && end) {
    courseForm.value.schedule = days + ' ' + start + '-' + end;
  } else {
    courseForm.value.schedule = '';
  }
};

// 解析已有 schedule 字符串 → 星期+时间
const parseSchedule = (str) => {
  if (!str) return;
  const match = str.match(/^(.+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!match) return;
  const dayPart = match[1];
  // 提取数字部分，映射回 "周一" 格式
  const days = [];
  for (const ch of dayPart) {
    if (DAY_NUM_MAP[ch]) {
      days.push(DAY_NUM_MAP[ch]);
    }
  }
  scheduleDays.value = days;
  scheduleStart.value = match[2];
  scheduleEnd.value = match[3];
};

// 监听选择器变化，自动更新 courseForm.schedule
watch([scheduleDays, scheduleStart, scheduleEnd], () => {
  composeSchedule();
}, { deep: true });

// 表单验证规则
const courseRules = ref({
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  credits: [
    { required: true, message: '请输入学分', trigger: 'blur' },
    { type: 'number', min: 1, max: 6, message: '学分需在1-6之间', trigger: 'blur' }
  ],
  schedule: [{ required: true, message: '请选择上课时间和日期', trigger: 'change' }],
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

// 获取课程详情（编辑用）
const getCourseDetail = async () => {
  try {
    const res = await teacherGetCourseById(route.params.id);
    courseForm.value = {
      ...res.data,
      credits: res.data.credits ? Number(res.data.credits) : null,
      capacity: res.data.capacity ? Number(res.data.capacity) : null
    };
    // 回显上课时间选择器
    if (res.data.schedule) {
      parseSchedule(res.data.schedule);
    }
  } catch (error) {
    console.error('获取课程详情失败:', error);
    ElMessage.error('获取课程详情失败');
  }
};

// 提交表单
const submitForm = async () => {
  try {
    // 先校验时间选择器
    if (scheduleDays.value.length === 0) {
      ElMessage.error('请选择上课日期');
      return;
    }
    if (!scheduleStart.value || !scheduleEnd.value) {
      ElMessage.error('请选择上课起止时间');
      return;
    }
    if (scheduleStart.value >= scheduleEnd.value) {
      ElMessage.error('结束时间必须晚于开始时间');
      return;
    }

    await courseFormRef.value.validate();
    loading.value = true;

    const submitData = {
      ...courseForm.value,
      credits: Number(courseForm.value.credits),
      capacity: Number(courseForm.value.capacity)
    };

    if (isEdit.value) {
      await teacherUpdateCourse(route.params.id, submitData);
      ElMessage.success('课程编辑成功');
    } else {
      await teacherCreateCourse(submitData);
      ElMessage.success('课程创建成功');
    }

    router.push('/home/teacher/my-courses');
  } catch (error) {
    console.error('提交失败详情:', error);
    if (error?.name === 'ValidationError') {
      ElMessage.error('表单填写有误，请检查学分和容量是否为有效数字');
    } else if (error?.response?.data?.message) {
      ElMessage.error(error.response.data.message);
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
.schedule-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.day-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time-separator {
  color: #909399;
}
</style>
