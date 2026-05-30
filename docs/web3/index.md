---
title: Web3 资讯
description: Web3 加密货币行业每日资讯
outline: 2
---

<script setup>
import { data } from './web3.data.ts'
import { Underline } from '@theojs/lumen'
</script>

# Web3 资讯 ⛓️

<Underline color="brand" />

Web3 加密货币行业每日资讯

## 📅 资讯

<ul>
  <li v-for="post in data" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <small v-if="post.date" style="color: var(--vp-c-text-2);"> — {{ post.date }}</small>
  </li>
</ul>

---

> 💡 每日资讯自动收集更新，由 Hermes Agent + tide 驱动
