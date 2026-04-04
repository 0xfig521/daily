---
name: daily-news-v2
description: LLM 原生每日资讯收集。使用 AI 直接获取 RSS、翻译、生成 Markdown 并推送，全程无需 Python 脚本。
---

# Daily News Skill v3.0 (LLM-Native)

使用 LLM 原生能力收集、整理、翻译每日资讯并发布到 VitePress 网站。

## 核心改进

- **全链路 LLM**: RSS 获取 + 翻译 + 生成 Markdown，全部由 LLM 一站式完成
- **无脚本依赖**: 不再需要 Python 脚本调用 Google/DeepL 翻译
- **高效简洁**: 一次 agent turn 完成所有工作

## 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│  1. LLM 收集 (一次完成)                                   │
│                                                             │
│     使用 web_fetch 获取各分类 RSS 源                         │
│     ├── AI: TechCrunch, 量子位, VentureBeat...            │
│     ├── Web3: CoinDesk, CoinTelegraph, Decrypt...        │
│     ├── Claw: GitHub Releases, The Verge...               │
│     ├── OPC: Hacker News, Product Hunt, 少数派...          │
│     └── GitHub Trending: GitHub API                       │
│                                                             │
│     同时完成翻译: 英文 → 中文                               │
│     生成 Markdown 文件并写入 docs/                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 生成 Morning Brief                                     │
│     LLM 汇总各分类头条，生成简报                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Git 推送                                               │
│     提交并推送到 GitHub，CI/CD 自动部署                    │
└─────────────────────────────────────────────────────────────┘
```

## 执行指令

当收到 "执行每日资讯收集" 时，执行以下步骤：

### 步骤 1: 收集 + 翻译 + 生成 Markdown

对每个分类执行：
1. 使用 `web_fetch` 获取 RSS feed 内容
2. 解析并选择重要条目（按时间/相关性排序）
3. **同时翻译**标题和摘要为中文（保留原文链接）
4. 生成 Markdown 格式文件
5. 写入 `/root/.openclaw/workspace/daily/docs/{category}/{YYYY-MM-DD}-daily.md`

### 步骤 2: 生成 Morning Brief

汇总各分类头条，写入 `/root/.openclaw/workspace/daily/docs/morning-brief/index.md`

### 步骤 3: 推送

```bash
cd /root/.openclaw/workspace/daily
git add .
git commit -m "📰 Daily: $(date +%Y-%m-%d) 自动收集"
git push origin main
```

## 分类路径

| 分类 | 目录 | RSS 源 |
|------|------|--------|
| AI | docs/ai/ | techcrunch.com/feed, qbitai.com/feed, venturebeat.com/category/ai/feed |
| Web3 | docs/web3/ | coindesk.com/arc/outboundfeeds/rss, cointelegraph.com/rss |
| Claw | docs/claw/ | github.com/openclaw/openclaw/releases.atom |
| OPC | docs/opc/ | hnrss.org/frontpage, sspai.com/feed |
| GitHub Trending | docs/github-trending/ | api.github.com/search/repositories |

## Markdown 格式

```markdown
---
title: {分类} {YYYY-MM-DD}
date: {YYYY-MM-DD}
description: {分类} 每日最新资讯
tags: ['{category}', '{分类名}', '每日资讯']
---

# {分类} {emoji}

> {YYYY-MM-DD} | 自动收集

### 1. {翻译后的标题}

- 来源: [原文链接](URL)

### 2. {翻译后的标题}

- 来源: [原文链接](URL)
...
```

## 翻译要求

- **标题**: 英文 → 中文，保持简洁
- **摘要**: 英文 → 中文，限300字
- **保留**: 原文链接、所有 markdown 格式、数字、专有名词（GPT-5, Bitcoin 等）

## 输出示例

```
📰 Daily News 收集完成:

AI: 15 条 (已翻译)
Web3: 10 条 (已翻译)
Claw: 5 条 (已翻译)
OPC: 12 条 (已翻译)
GitHub Trending: 20 条 (已翻译)

已推送到 GitHub，CI/CD 部署中...
```

## 定时任务

通过 OpenClaw cron 配置：

```bash
openclaw cron add \
  --name "Daily News" \
  --cron "0 8 * * *" \
  --tz "Asia/Shanghai" \
  --session "isolated" \
  --payload "agentTurn" \
  --message "请执行每日资讯收集任务（全程使用 LLM）：收集各分类 RSS、翻译为中文、生成 Markdown、推送 GitHub。" \
  --timeout-seconds 120 \
  --announce
```
