---
title: GitHub Trending
description: GitHub 热门项目每日排行，跟踪最新最热的开源项目
outline: 2
---

<script setup>
import { Links, Underline, BoxCube } from '@theojs/lumen'
</script>

# GitHub Trending 🔥

<Underline color="brand" />

GitHub 热门项目每日排行，跟踪最新最热的开源项目，发现开发者社区的趋势风向标。

## 📌 热门语言

<Links
  :grid="4"
  :items="[
    {
      icon: { icon: 'logos:javascript', color: '#F7DF1E' },
      name: 'JavaScript',
      desc: 'Web 开发主流语言',
      link: 'https://github.com/trending/javascript',
      linkText: '查看'
    },
    {
      icon: { icon: 'logos:python', color: '#3776AB' },
      name: 'Python',
      desc: 'AI/数据科学首选',
      link: 'https://github.com/trending/python',
      linkText: '查看'
    },
    {
      icon: { icon: 'logos:typescript', color: '#3178C6' },
      name: 'TypeScript',
      desc: 'JavaScript 超集',
      link: 'https://github.com/trending/typescript',
      linkText: '查看'
    },
    {
      icon: { icon: 'logos:rust', color: '#DEA584' },
      name: 'Rust',
      desc: '系统级语言',
      link: 'https://github.com/trending/rust',
      linkText: '查看'
    }
  ]"
/>

## 🚀 最新动态

待添加内容...

- [2026-04-03 资讯](./2026-04-03-daily.md)
