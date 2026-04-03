#!/bin/bash
# Daily 资讯收集脚本

set -e

PROJECT_ROOT="/root/.openclaw/workspace/daily"
TODAY=$(date +%Y-%m-%d)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/rss_to_md.py"

echo "🦞 Daily 收集开始: $TODAY"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 收集函数
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
  
  # 先创建空文件（带frontmatter）
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

  local total_count=0
  
  for url in "${urls[@]}"; do
    echo "  获取: $url"
    local tmpfile="/tmp/rss_${category}_$$.md"
    
    python3 "$PYTHON_SCRIPT" rss "$url" "$category" "$name" "$emoji" "$tmpfile" 10 2>/dev/null
    
    if [ -f "$tmpfile" ]; then
      # 跳过 frontmatter 和标题部分，追加内容
      sed -n '16,$p' "$tmpfile" >> "$output_file" 2>/dev/null
      local count=$(grep -c "^### " "$tmpfile" 2>/dev/null || true)
      total_count=$((total_count + count))
      rm -f "$tmpfile"
    fi
  done
  
  echo "" >> "$output_file"
  echo "*由 Daily 自动收集生成*" >> "$output_file"
  
  echo -e "  ${YELLOW}收集 $total_count 条${NC}"
  echo -e "  ${YELLOW}已保存: $output_file${NC}"
}

# 收集 GitHub Trending
collect_github() {
  echo -e "${GREEN}[GitHub Trending]${NC} 开始收集..."
  
  local output_file="$PROJECT_ROOT/docs/github-trending/${TODAY}-daily.md"
  
  python3 "$PYTHON_SCRIPT" github "$output_file"
  
  echo -e "  ${YELLOW}已保存: $output_file${NC}"
}

# 运行收集

# AI 资讯
collect_rss "ai" "AI 资讯" "🤖" \
  "https://techcrunch.com/feed/" \
  "https://www.jiqizhixin.com/rss" \
  "https://www.qbitai.com/feed" \
  "https://venturebeat.com/category/ai/feed/"

# Web3 资讯
collect_rss "web3" "Web3 资讯" "⛓️" \
  "https://www.coindesk.com/arc/outboundfeeds/rss/" \
  "https://cointelegraph.com/rss" \
  "https://decrypt.co/feed"

# Claw 资讯
collect_rss "claw" "Claw 资讯" "🦀" \
  "https://github.com/openclaw/openclaw/releases.atom" \
  "https://venturebeat.com/category/ai/feed/"

# OPC 超级个体
collect_rss "opc" "超级个体" "🚀" \
  "https://hnrss.org/frontpage" \
  "https://sspai.com/feed" \
  "https://www.producthunt.com/feed"

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
