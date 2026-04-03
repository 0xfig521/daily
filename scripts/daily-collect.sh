#!/bin/bash
# Daily 资讯收集脚本
# 使用 curl + jq 抓取 RSS 和 GitHub API

set -e

PROJECT_ROOT="/root/.openclaw/workspace/daily"
TODAY=$(date +%Y-%m-%d)

echo "🦞 Daily 收集开始: $TODAY"

# 分类配置
declare -A RSS_FEEDS=(
  ["ai"]="https://techcrunch.com/feed/|https://36kr.com/feed"
  ["web3"]="https://www.coindesk.com/arc/outboundfeeds/rss/|https://cointelegraph.com/rss"
)

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

collect_rss() {
  local category=$1
  local urls=$2
  local output_dir="$PROJECT_ROOT/docs/$category"
  
  echo -e "${GREEN}[$category]${NC} 开始收集..."
  
  mkdir -p "$output_dir"
  
  # 临时文件
  local tmp_file="/tmp/rss_${category}_${TODAY}.xml"
  
  # 收集所有 RSS
  > "$tmp_file"
  for url in $(echo "$urls" | tr '|' '\n'); do
    echo "获取: $url"
    curl -sL --max-time 30 "$url" >> "$tmp_file" 2>/dev/null || true
  done
  
  # 生成 markdown
  local output_file="$output_dir/${TODAY}-daily.md"
  
  cat > "$output_file" << EOF
---
title: $category 资讯 $TODAY
date: $TODAY
description: $category 资讯每日最新动态
tags: ['$category', '每日资讯']
---

# $category 资讯

> $TODAY | 自动收集

本日报由 RSS 收集器自动生成。

EOF
  
  # 提取项目（简化版）
  grep -oP '(?<=<title>)[^<]+' "$tmp_file" | head -20 | while read -r title; do
    echo "$title" | grep -qiE '^(techcrunch|36kr|coindesk|cointelegraph)$' && continue
    
    title=$(echo "$title" | sed 's/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g')
    
    if [ ${#title} -gt 10 ]; then
      echo "### $title" >> "$output_file"
      echo "" >> "$output_file"
      echo "- 来源: RSS 收集" >> "$output_file"
      echo "" >> "$output_file"
    fi
  done
  
  echo "" >> "$output_file"
  echo "*由 Daily RSS 收集器自动生成*" >> "$output_file"
  
  rm -f "$tmp_file"
  
  echo -e "${YELLOW}[$category]${NC} 已保存: $output_file"
}

# 收集 AI 和 Web3
for cat in ai web3; do
  collect_rss "$cat" "${RSS_FEEDS[$cat]}"
done

# GitHub Trending via API
echo -e "${GREEN}[github-trending]${NC} 开始收集..."
GITHUB_OUTPUT="$PROJECT_ROOT/docs/github-trending/${TODAY}-daily.md"

cat > "$GITHUB_OUTPUT" << EOF
---
title: GitHub Trending $TODAY
date: $TODAY
description: GitHub 热门项目每日排行
tags: ['github', 'trending', '开源']
---

# GitHub Trending 🔥

> $TODAY | 热门开源项目

## 今日热门项目（按星标数排序）

EOF

# 使用 GitHub API 获取近期热门项目
curl -sL --max-time 30 "https://api.github.com/search/repositories?q=stars:>5000+pushed:>$(date -d '7 days ago' +%Y-%m-%d)&sort=stars&order=desc&per_page=15" | \
  jq -r '.items[] | "### [\(.full_name)](\(.html_url))\n\n⭐ \(.stargazers_count | tostring) | \(.description // "")\n"' >> "$GITHUB_OUTPUT"

echo "" >> "$GITHUB_OUTPUT"
echo "*由 Daily RSS 收集器自动生成*" >> "$GITHUB_OUTPUT"
echo -e "${YELLOW}[github-trending]${NC} 已保存: $GITHUB_OUTPUT"

# 更新 index.md
for cat in ai web3 github-trending; do
  INDEX="$PROJECT_ROOT/docs/$cat/index.md"
  if [ -f "$INDEX" ]; then
    if ! grep -q "${TODAY}-daily.md" "$INDEX"; then
      echo "- [$TODAY 资讯](./${TODAY}-daily.md)" >> "$INDEX"
      echo "更新 $cat index.md"
    fi
  fi
done

# Git 提交
cd "$PROJECT_ROOT"
git config user.email "openclaw@daily.bot" 2>/dev/null || true
git config user.name "OpenClaw Daily Bot" 2>/dev/null || true
git add .
if git diff --cached --quiet; then
  echo "没有更改需要提交"
else
  git commit -m "📰 Daily: $TODAY 自动收集"
  git push origin main || echo "推送失败"
fi

echo -e "${GREEN}✅ 完成!${NC}"
