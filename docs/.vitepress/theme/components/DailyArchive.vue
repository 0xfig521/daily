<template>
  <div class="daily-archive">
    <a 
      v-for="post in posts" 
      :key="post.url" 
      :href="post.url"
      class="daily-item"
    >
      <span class="date">{{ post.dateStr }}</span>
      <span class="title">{{ post.title }}</span>
      <span class="arrow">→</span>
    </a>
    <div v-if="posts.length === 0" class="empty">
      暂无资讯
    </div>
  </div>
</template>

<script setup lang="ts">
// 直接从同目录的 data 文件导入
import { computed } from 'vue'
import postsData from './daily-posts.data.js'

const posts = computed(() => postsData.posts || [])
</script>

<style scoped>
.daily-archive {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.daily-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.daily-item:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  transform: translateX(4px);
}

.date {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  color: var(--vp-c-brand);
  background: var(--vp-c-brand-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}

.title {
  flex: 1;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.arrow {
  color: var(--vp-c-text-3);
  transition: transform 0.2s;
}

.daily-item:hover .arrow {
  transform: translateX(4px);
  color: var(--vp-c-brand);
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .daily-item {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .title {
    width: 100%;
    order: 3;
    margin-top: 0.25rem;
  }
}
</style>
