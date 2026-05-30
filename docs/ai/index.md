---
title: AI 资讯 - 前沿AI与大模型动态
description: 人工智能、机器学习，大模型最新进展。追踪 GPT、Claude、Gemini 等大模型动态，了解 AI Agent、AIGC、计算机视觉等技术前沿。
outline: 2
---

<script setup>
import { data } from './ai.data.ts'
import { Underline } from '@theojs/lumen'
</script>

# AI 资讯 🤖

<Underline color="brand" />

人工智能、机器学习、工具应用最新进展，追踪技术突破与产业落地。

## 📅 资讯

<ul>
  <li v-for="post in data" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <small v-if="post.date" style="color: var(--vp-c-text-2);"> — {{ post.date }}</small>
  </li>
</ul>

---

> 💡 每日资讯自动收集更新，由 Hermes Agent + tide 驱动

## 🔗 快速访问

- [OpenAI](https://openai.com/) | [Anthropic](https://anthropic.com/) | [Google AI](https://ai.google/) | [Hugging Face](https://huggingface.co/)
