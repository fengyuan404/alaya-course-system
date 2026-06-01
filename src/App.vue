<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

// 页面刷新时，重新获取用户信息（保持登录状态）
onMounted(() => {
  if (userStore.token) {
    userStore.initUserInfo();
  }
});
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Microsoft YaHei', sans-serif;
}
</style>