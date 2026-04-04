---
title: AI 资讯 - 前沿AI与大模型动态
description: 人工智能、机器学习，大模型最新进展。追踪 GPT、Claude、Gemini 等大模型动态，了解 AI Agent、AIGC、计算机视觉等技术前沿。
outline: 2
---

<script setup>
import { Links, Underline } from '@theojs/lumen'
</script>

# AI 资讯 🤖

<Underline color="brand" />

人工智能、机器学习、工具应用最新进展，追踪技术突破与产业落地。

## 📰 最新资讯

<ClientOnly>
  <DailyArchive />
</ClientOnly>

## 📊 今日热词

<Links
  :grid="4"
  :items="[
    { icon: { icon: 'logos:openai', color: '#412991' }, name: 'GPT-5', desc: 'OpenAI 最新模型', link: 'https://openai.com/gpt-5' },
    { icon: { icon: 'logos:anthropic', color: '#1E1E1E' }, name: 'Claude 4', desc: 'Anthropic 最新模型', link: 'https://anthropic.com/claude' },
    { icon: { icon: 'logos:huggingface', color: '#FFD21E' }, name: '开源模型', desc: 'Hugging Face', link: 'https://huggingface.co/models' },
    { icon: { icon: '🤖', color: '#4285F4' }, name: 'AI Agent', desc: '自主智能体', link: './2026-04-04-daily.html' }
  ]"
/>

## 🔗 快速访问

- [OpenAI](https://openai.com/) | [Anthropic](https://anthropic.com/) | [Google AI](https://ai.google/) | [Hugging Face](https://huggingface.co/)

---

> 💡 每日资讯自动收集更新，由 OpenClaw + daily-news skill 驱动
