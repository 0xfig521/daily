---
title: GitHub Trending
description: 热门开源项目每日排行
outline: 2
---

<script setup>
import { data } from './github-trending.data.ts'
import { Underline } from '@theojs/lumen'
</script>

# GitHub Trending 📈

<Underline color="brand" />

热门开源项目每日排行

## 📅 资讯

<ul>
  <li v-for="post in data" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <small v-if="post.date" style="color: var(--vp-c-text-2);"> — {{ post.date }}</small>
  </li>
</ul>

---

> 💡 每日资讯自动收集更新，由 Hermes Agent + tide 驱动
