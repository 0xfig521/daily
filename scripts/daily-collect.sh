#!/bin/bash
# Daily 资讯收集脚本 - 完整版

set -e

PROJECT_ROOT="/root/.openclaw/workspace/daily"
TODAY=$(date +%Y-%m-%d)

echo "🦞 Daily 收集开始: $TODAY"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

collect_rss() {
  local category=$1
  local name=$2
  local emoji=$3
  shift 3
  local urls=("$@")
  
  echo -e "${GREEN}[$name]${NC} 开始收集..."
  
  local output_dir="$PROJECT_ROOT/docs/$category"
  mkdir -p "$output_dir"
  local output_file="$output_dir/${TODAY}-daily.md"
  
  cat > "$output_file" << EOF
---
title: $name $TODAY
date: $TODAY
description: $name 每日最新资讯
tags: ['$category', '$name', '每日资讯']
---

# $name $emoji

> $TODAY | 自动收集

EOF

  local item_count=0
  
  for url in "${urls[@]}"; do
    echo "  获取: $url"
    
    local xml=$(curl -sL --max-time 30 "$url" 2>/dev/null)
    
    # 处理 CDATA 和多行 XML
    local items=$(echo "$xml" | tr '\n' ' ' | sed 's/<\/item>/\n<\/item>/g' | grep -oP '<item>.*?</item>' | head -10)
    
    for item in $items; do
      # 提取标题（支持 CDATA）
      local title=$(echo "$item" | grep -oP '(?<=<title>)[^<]+' | sed 's/<!\[CDATA\[//g; s/\]\]>//g; s/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g')
      # 提取链接
      local link=$(echo "$item" | grep -oP '(?<=<link>)[^<]+' | head -1)
      # 提取描述
      local desc=$(echo "$item" | grep -oP '(?<=<description>)[^<]+' | sed 's/<!\[CDATA\[//g; s/\]\]>//g; s/&amp;/\&/g; s/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g; s/<[^>]*>//g' | cut -c1-200)
      
      [ -z "$title" ] || [ ${#title} -lt 5 ] && continue
      
      echo "### $title" >> "$output_file"
      echo "" >> "$output_file"
      [ -n "$desc" ] && [ ${#desc} -gt 10 ] && echo "$desc" >> "$output_file" && echo "" >> "$output_file"
      [ -n "$link" ] && echo "- 来源: [$link]($link)" >> "$output_file" || echo "- 来源: $url" >> "$output_file"
      echo "" >> "$output_file"
      
      ((item_count++)) || true
    done
  done
  
  echo "" >> "$output_file"
  echo "*由 Daily 自动收集生成*" >> "$output_file"
  
  echo -e "  ${YELLOW}收集 $item_count 条${NC}"
  echo -e "  ${YELLOW}已保存: $output_file${NC}"
}

collect_github() {
  echo -e "${GREEN}[GitHub Trending]${NC} 开始收集..."
  
  local output_file="$PROJECT_ROOT/docs/github-trending/${TODAY}-daily.md"
  
  cat > "$output_file" << EOF
---
title: GitHub Trending $TODAY
date: $TODAY
description: GitHub 热门项目每日排行
tags: ['github', 'trending', '开源']
---

# GitHub Trending 🔥

> $TODAY | 热门开源项目

## 今日热门项目

EOF

  local tmpfile="/tmp/github_trending_$$.json"
  local since=$(date -d '3 days ago' +%Y-%m-%d)
  
  curl -sL --max-time 30 "https://api.github.com/search/repositories?q=stars:>1000+pushed:>${since}&sort=stars&order=desc&per_page=20" -o "$tmpfile"
  
  while IFS= read -r repo; do
    full_name=$(echo "$repo" | jq -r '.full_name')
    url=$(echo "$repo" | jq -r '.html_url')
    stars=$(echo "$repo" | jq -r '.stargazers_count')
    desc=$(echo "$repo" | jq -r '.description // "暂无描述"')
    
    echo "### [$full_name]($url)" >> "$output_file"
    echo "" >> "$output_file"
    echo "⭐ $stars stars" >> "$output_file"
    echo "" >> "$output_file"
    echo "$desc" >> "$output_file"
    echo "" >> "$output_file"
    echo "- 来源: [$url]($url)" >> "$output_file"
    echo "" >> "$output_file"
  done < <(jq -c '.items[]' "$tmpfile")
  
  rm -f "$tmpfile"
  
  echo "*由 Daily 自动收集生成*" >> "$output_file"
  
  echo -e "  ${YELLOW}已保存: $output_file${NC}"
}

# AI 资讯
collect_rss "ai" "AI 资讯" "🤖" \
  "https://techcrunch.com/feed/" \
  "https://36kr.com/feed" \
  "https://www.jiqizhixin.com/rss" \
  "https://www.qbitai.com/feed"

# Web3 资讯
collect_rss "web3" "Web3 资讯" "⛓️" \
  "https://www.coindesk.com/arc/outboundfeeds/rss/" \
  "https://cointelegraph.com/rss" \
  "https://decrypt.co/feed"

# Claw 资讯
collect_rss "claw" "Claw 资讯" "🦀" \
  "https://github.com/openclaw/openclaw/releases.atom" \
  "https://www.theverge.com/rss/index.xml" \
  "https://venturebeat.com/category/ai/feed/"

# OPC 超级个体
collect_rss "opc" "超级个体" "🚀" \
  "https://www.indiehackers.com/feed" \
  "https://hnrss.org/frontpage" \
  "https://36kr.com/feed" \
  "https://sspai.com/feed"

# GitHub Trending
collect_github

# 更新 index.md
for category in ai web3 claw opc github-trending; do
  INDEX="$PROJECT_ROOT/docs/$category/index.md"
  if [ -f "$INDEX" ]; then
    if ! grep -q "${TODAY}-daily.md" "$INDEX"; then
      echo "- [$TODAY 资讯](./${TODAY}-daily.md)" >> "$INDEX"
      echo "更新 $category index.md"
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
