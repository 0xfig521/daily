---
title: Claw 资讯
description: OpenClaw 和 ClawHub 生态最新动态
outline: 2
---

<script setup>
import { data } from './claw.data.ts'
import { Underline } from '@theojs/lumen'
</script>

# Claw 资讯 🦀

<Underline color="brand" />

OpenClaw 和 ClawHub 生态最新动态

## 📅 资讯

<ul>
  <li v-for="post in data" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <small v-if="post.date" style="color: var(--vp-c-text-2);"> — {{ post.date }}</small>
  </li>
</ul>

---

> 💡 每日资讯自动收集更新，由 Hermes Agent + tide 驱动
