<template>
  <div class="grade-input-container">
    <el-page-header content="成绩录入" @back="goBack" />
    <el-card>
      <el-form :model="searchForm" inline style="margin-bottom: 20px;">
        <el-form-item label="学生姓名/学号">
          <el-input v-model="searchForm.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getStudents">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="studentList" border stripe>
        <el-table-column label="学生姓名" prop="student.username" />
        <el-table-column label="学号" prop="student.idCard" width="120" />
        <el-table-column label="成绩" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.score"
              :min="0"
              :max="100"
              :precision="0"
              placeholder="请输入成绩"
            />
          </template>
        </el-table-column>
        <el-table-column label="等级" width="120">
          <template #default="scope">
            <el-select v-model="scope.row.level" placeholder="请选择等级">
              <el-option label="优秀" value="A" />
              <el-option label="良好" value="B" />
              <el-option label="中等" value="C" />
              <el-option label="及格" value="D" />
              <el-option label="不及格" value="F" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="备注" width="200">
          <template #default="scope">
            <el-input v-model="scope.row.comment" placeholder="请输入备注（选填）" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" @click="saveGrade(scope.row)">保存</el-button>
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

      <!-- 批量保存按钮 -->
      <div style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="batchSaveGrade" size="large">批量保存所有成绩</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { teacherGetCourseStudents } from '@/api/course';
import { teacherSaveGrade, teacherBatchSaveGrade } from '@/api/grade';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const courseId = ref(route.params.courseId);

// 搜索表单
const searchForm = ref({
  keyword: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const studentList = ref([]);

// 页面加载时获取选课学生
onMounted(() => {
  getStudents();
});

// 获取选课学生列表
const getStudents = async () => {
  try {
    const params = {
      courseId: courseId.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword
    };
    const res = await teacherGetCourseStudents(params);
    // 初始化成绩字段
    studentList.value = res.data.list.map(item => ({
      ...item,
      score: item.grade?.score || '',
      level: item.grade?.level || '',
      comment: item.grade?.comment || ''
    }));
    total.value = res.data.total;
  } catch (error) {
    console.error('获取学生列表失败:', error);
    ElMessage.error('获取学生列表失败');
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getStudents();
};

// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val;
  getStudents();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = { keyword: '' };
  pageNum.value = 1;
  getStudents();
};

// 保存单个学生成绩
const saveGrade = async (studentItem) => {
  if (!studentItem.score) {
    ElMessage.warning('请输入成绩');
    return;
  }
  try {
    await teacherSaveGrade({
      courseId: Number(courseId.value),
      studentId: studentItem.student.id,
      score: Number(studentItem.score),
      level: studentItem.level || null,
      comment: studentItem.comment || null
    });
    ElMessage.success('成绩保存成功');
  } catch (error) {
    console.error('保存成绩失败:', error);
    const msg = error.response?.data?.message || error.response?.data || error.message || '保存成绩失败';
    ElMessage.error(msg);
  }
};

// 批量保存成绩
const batchSaveGrade = async () => {
  // 过滤出填写了成绩的学生
  const validGrades = studentList.value.filter(item => item.score).map(item => ({
    courseId: Number(courseId.value),
    studentId: item.student.id,
    score: Number(item.score),
    level: item.level || null,
    comment: item.comment || null
  }));

  if (validGrades.length === 0) {
    ElMessage.warning('请至少填写一个学生的成绩');
    return;
  }

  try {
    await teacherBatchSaveGrade(validGrades);
    ElMessage.success('批量保存成绩成功');
  } catch (error) {
    console.error('批量保存成绩失败:', error);
    ElMessage.error('批量保存成绩失败');
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.grade-input-container {
  padding: 10px;
}
</style>