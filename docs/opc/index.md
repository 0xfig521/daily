---
title: OPC 超级个体
description: 独立创业者 · Solo Founder · SaaS 动态
outline: 2
---

<script setup>
import { data } from './opc.data.ts'
import { Underline } from '@theojs/lumen'
</script>

# OPC 超级个体 🚀

<Underline color="brand" />

独立创业者 · Solo Founder · SaaS 动态

## 📅 资讯

<ul>
  <li v-for="post in data" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <small v-if="post.date" style="color: var(--vp-c-text-2);"> — {{ post.date }}</small>
  </li>
</ul>

---

> 💡 每日资讯自动收集更新，由 Hermes Agent + tide 驱动
