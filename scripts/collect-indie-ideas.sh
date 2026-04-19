#!/bin/bash
# 独立开发者灵感收集脚本

set -e

PROJECT_ROOT="/root/workspace/daily"
TODAY=$(date +%Y-%m-%d)

echo "💡 独立开发者灵感收集: $TODAY"

# 输出文件
OUTPUT_FILE="$PROJECT_ROOT/docs/indie-ideas/${TODAY}-ideas.md"

cat > "$OUTPUT_FILE" << EOF
---
title: 独立开发者灵感 $TODAY
date: $TODAY
description: 独立开发者项目创意与赚钱思路
tags: ['indie', '独立开发', '灵感', 'SaaS']
---

# 💡 独立开发者灵感

> $TODAY | 发现下一个值得做的项目

## 🚀 今日精选项目

EOF

# 从 Product Hunt API (需 User-Agent)
echo "从 Product Hunt 获取..." 
curl -sL --max-time 20 "https://www.producthunt.com/feed" 2>/dev/null | head -100 | grep -oP '(?<=<title>)[^<]+' | grep -v "^Product Hunt" | head -8 >> "$OUTPUT_FILE" 2>/dev/null || true

echo "" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << 'EOF'

## 💼 热门商业模式

### Micro SaaS
小而美的细分市场 SaaS，专注解决特定问题
- 月收入 $1K-$10K
- 关键词：自动化、工作流、API 集成

### AI + 垂直领域
用 AI 赋能传统行业
- 内容生成、客服自动化、数据分析
- 门槛：需要懂行业 + AI

### 开发者工具
为其他开发者提供效率工具
- IDE 插件、API 服务、监控工具
- 推广：Product Hunt、Twitter

### 信息差产品
整理、聚合某个领域的信息
- 新闻聚合、行业报告、工具导航
- 盈利：订阅、广告、联盟

## 🎯 本周独立开发者动态

### 热门产品方向（基于今日资讯）
EOF

# 从 OPC 日报中提取相关项目灵感
OPC_FILE="$PROJECT_ROOT/docs/opc/${TODAY}-daily.md"
if [ -f "$OPC_FILE" ]; then
  echo "" >> "$OUTPUT_FILE"
  grep -E "^###" "$OPC_FILE" 2>/dev/null | head -10 | sed 's/^### /- /' >> "$OUTPUT_FILE" || true
fi

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "*由 Daily 自动收集*" >> "$OUTPUT_FILE"

echo "完成! 保存到: $OUTPUT_FILE"
