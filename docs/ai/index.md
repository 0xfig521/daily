---
title: AI 资讯
description: 人工智能、机器学习、工具应用最新进展
outline: 2
---

<script setup>
import { Links, Underline, BoxCube } from '@theojs/lumen'
</script>

# AI 资讯

<Underline color="brand" />

人工智能、机器学习、工具应用最新进展，追踪技术突破与产业落地。

## 📌 核心资源

<Links
  :grid="3"
  :items="[
    {
      icon: { icon: 'logos:openai', color: '#412991' },
      name: 'OpenAI',
      desc: 'GPT 系列大模型研发机构',
      link: 'https://openai.com/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:anthropic', color: '#1E1E1E' },
      name: 'Anthropic',
      desc: 'Claude 系列 AI 模型',
      link: 'https://anthropic.com/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:huggingface', color: '#FFD21E' },
      name: 'Hugging Face',
      desc: '机器学习模型平台',
      link: 'https://huggingface.co/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:google', color: '#4285F4' },
      name: 'Google AI',
      desc: 'Google 人工智能研究',
      link: 'https://ai.google/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:microsoft', color: '#00A4EF' },
      name: 'Microsoft AI',
      desc: '微软人工智能与 Copilot',
      link: 'https://www.microsoft.com/ai',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:langchain', color: '#1C3C3C' },
      name: 'LangChain',
      desc: 'LLM 应用开发框架',
      link: 'https://langchain.com/',
      linkText: '访问'
    }
  ]"
/>

## 🔥 热门话题

<BoxCube
  :items="[
    { icon: '🧠', title: '大模型', desc: '基础模型研究' },
    { icon: '💬', title: '对话 AI', desc: '聊天机器人' },
    { icon: '🎨', title: 'AIGC', desc: 'AI 生成内容' },
    { icon: '👁️', title: '计算机视觉', desc: '图像识别' },
    { icon: '🎯', title: 'Agent', desc: '智能体应用' },
    { icon: '⚡', title: '效率工具', desc: '生产力提升' }
  ]"
/>

## 🚀 最新动态

- [2026-04-03 资讯](./2026-04-03-daily.md)

> 💡 提示：在 `/docs/ai/` 目录下创建新的 Markdown 文件来添加资讯
