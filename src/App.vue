<template>
  <div id="app">
    <router-view v-if="authReady" />
    <van-loading v-else type="spinner" vertical class="auth-loading">
      初始化中...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authenticate } from '@/adapters/authAdapter'
import { showToast } from 'vant'

const authReady = ref(false)

onMounted(async () => {
  try {
    const result = await authenticate()
    if (!result.success) {
      showToast(result.message || '鉴权失败')
    }
  } catch (error: any) {
    console.error('鉴权错误:', error)
    showToast('初始化失败，请刷新重试')
  } finally {
    // 开发环境下即使鉴权失败也允许继续（使用 mock token）
    authReady.value = true
  }
})
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
  height: auto;
  background: #f5f7fa;
  overflow-x: hidden;
  overflow-y: auto;
}

.auth-loading {
  padding: 40px 0;
}
</style>

