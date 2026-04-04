<template>
  <div class="daily-list">
    <a 
      v-for="post in sortedPosts" 
      :key="post.path" 
      :href="post.path"
      class="daily-item"
    >
      <span class="date">{{ post.date }}</span>
      <span class="title">{{ post.title }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Post {
  path: string
  date: string
  title: string
}

// 获取当前分类路径下的所有每日文件
// 使用 import.meta.glob 动态导入
const modules = import.meta.glob('../*/2026-*.md', { query: '?raw', import: 'metadata', eager: true })

const posts = computed<Post[]>(() => {
  const items: Post[] = []
  
  for (const [path, meta] of Object.entries(modules)) {
    if (meta && typeof meta === 'object' && 'date' in meta) {
      const m = meta as { date: string; title?: string }
      // 从路径提取分类名
      const parts = path.split('/')
      const category = parts[parts.length - 2]
      
      items.push({
        path: path.replace('.md', '.html').replace('../', '/'),
        date: m.date,
        title: m.title || `每日资讯`
      })
    }
  }
  
  return items
})

const sortedPosts = computed(() => {
  return [...posts.value].sort((a, b) => {
    // 按日期降序排列（最新的在前）
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})
</script>

<style scoped>
.daily-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.daily-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.daily-item:hover {
  background: var(--vp-c-brand-soft);
  transform: translateX(4px);
}

.date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.title {
  flex: 1;
  font-weight: 500;
}

@media (max-width: 640px) {
  .daily-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
