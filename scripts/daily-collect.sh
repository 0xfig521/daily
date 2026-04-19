#!/bin/bash
# Daily 资讯收集脚本 v2.0
# 优化: 去重、质量评分、Morning Brief

set -e

PROJECT_ROOT="/root/workspace/daily"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="/tmp/daily-collect-$(date +%Y%m%d).log"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/rss_to_md.py"

echo "🦞 Daily 收集开始: $(date '+%Y-%m-%d %H:%M:%S')" | tee "$LOG_FILE"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 统计
declare -A COUNTS

# 收集函数
collect_rss() {
  local category=$1
  local name=$2
  local emoji=$3
  shift 3
  local urls=("$@")
  
  echo -e "\n${GREEN}[$name]${NC} 开始收集..." | tee -a "$LOG_FILE"
  
  local output_dir="$PROJECT_ROOT/docs/$category"
  mkdir -p "$output_dir"
  local output_file="$output_dir/${TODAY}-daily.md"
  
  # 创建文件（带frontmatter）
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
    echo "  获取: $url" | tee -a "$LOG_FILE"
    local tmpfile="/tmp/rss_${category}_$$.md"
    local error_log="/tmp/rss_error_$$.log"
    
    # 获取并解析
    python3 "$PYTHON_SCRIPT" rss "$url" "$category" "$name" "$emoji" "$tmpfile" 15 2>> "$error_log"
    
    if [ -f "$tmpfile" ] && [ -s "$tmpfile" ]; then
      # 跳过 frontmatter，追加内容
      local start_line=16
      tail -n +$start_line "$tmpfile" >> "$output_file" 2>/dev/null || cat "$tmpfile" >> "$output_file"
      
      local count
      count=$(grep -c "^### " "$tmpfile" 2>/dev/null) || count=0
      total_count=$((total_count + count))
      rm -f "$tmpfile"
    fi
    
    # 检查错误
    if [ -f "$error_log" ] && [ -s "$error_log" ]; then
      echo "  ⚠️ 错误: $(cat "$error_log")" | tee -a "$LOG_FILE"
      rm -f "$error_log"
    fi
  done
  
  echo "" >> "$output_file"
  echo "*由 Daily 自动收集生成*" >> "$output_file"
  
  COUNTS[$category]=$total_count
  echo -e "  ${YELLOW}收集 $total_count 条${NC}" | tee -a "$LOG_FILE"
  echo -e "  ${YELLOW}已保存: $output_file${NC}" | tee -a "$LOG_FILE"
}

# 收集 GitHub Trending
collect_github() {
  echo -e "\n${GREEN}[GitHub Trending]${NC} 开始收集..." | tee -a "$LOG_FILE"
  
  local output_file="$PROJECT_ROOT/docs/github-trending/${TODAY}-daily.md"
  python3 "$PYTHON_SCRIPT" github "$output_file" 2>&1 | tee -a "$LOG_FILE"
  
  COUNTS[github]=20
  echo -e "  ${YELLOW}已保存: $output_file${NC}" | tee -a "$LOG_FILE"
}

collect_indie_ideas() {
  echo -e "\n${GREEN}[独立开发灵感]${NC} 开始收集..." | tee -a "$LOG_FILE"
  
  bash "$SCRIPT_DIR/collect-indie-ideas.sh" 2>&1 | tee -a "$LOG_FILE"
  
  COUNTS[indie]=1
  echo -e "  ${YELLOW}已保存: $PROJECT_ROOT/docs/indie-ideas/${TODAY}-ideas.md${NC}" | tee -a "$LOG_FILE"
}

# 生成 Morning Brief
generate_morning_brief() {
  echo -e "\n${GREEN}[Morning Brief]${NC} 生成简报..." | tee -a "$LOG_FILE"
  
  mkdir -p "$PROJECT_ROOT/docs/morning-brief"
  local output_file="$PROJECT_ROOT/docs/morning-brief/index.md"
  local total=${COUNTS[ai]:-0}+${COUNTS[web3]:-0}+${COUNTS[claw]:-0}+${COUNTS[opc]:-0}+${COUNTS[github]:-0}
  
  cat > "$output_file" << EOF
---
title: Morning Brief $TODAY
date: $TODAY
description: 每日早间简报
tags: ['morning-brief', '每日简报']
---

# ☀️ Morning Brief

> $TODAY | 开启美好的一天

## 📊 今日概览

共收集 **$total** 条资讯：

| 分类 | 数量 | 入口 |
|------|------|------|
| 🤖 AI | ${COUNTS[ai]:-0} 条 | [查看](/ai/) |
| ⛓️ Web3 | ${COUNTS[web3]:-0} 条 | [查看](/web3/) |
| 🦀 Claw | ${COUNTS[claw]:-0} 条 | [查看](/claw/) |
| 🚀 超级个体 | ${COUNTS[opc]:-0} 条 | [查看](/opc/) |
| 🔥 GitHub | ${COUNTS[github]:-0} 条 | [查看](/github-trending/) |

## 🔥 今日速览

EOF

  # 添加每个分类的头条
  for category in ai web3 claw opc github; do
    local daily_file="$PROJECT_ROOT/docs/$category/${TODAY}-daily.md"
    if [ -f "$daily_file" ]; then
      local first_title=$(grep -m1 "^### " "$daily_file" 2>/dev/null | sed 's/^### //' | head -c 60)
      if [ -n "$first_title" ]; then
        echo "- **$first_title**" >> "$output_file"
      fi
    fi
  done

  echo "" >> "$output_file"
  echo "---" >> "$output_file"
  echo "" >> "$output_file"
  echo "由 OpenClaw + daily-news skill 自动生成" >> "$output_file"
  echo "更新时间: $(date '+%H:%M:%S')" >> "$output_file"
  
  echo -e "  ${YELLOW}已保存: $output_file${NC}" | tee -a "$LOG_FILE"
}

# 更新 index.md
update_index() {
  local category=$1
  local INDEX="$PROJECT_ROOT/docs/$category/index.md"
  
  if [ -f "$INDEX" ]; then
    # 检查是否已有今日链接（避免重复）
    if grep -q "${TODAY}-daily.md" "$INDEX"; then
      echo "  $category: 今日已有，跳过"
      return
    fi
    
    # 在 "## 📰 最新资讯" 之后插入新链接（追加到顶部）
    sed -i "/## 📰 最新资讯/a\\n- [$TODAY 资讯](.\/$TODAY-daily.md)" "$INDEX"
    echo "  更新 $category index.md"
  fi
}
# 生成 daily-posts.data.js (供 DailyArchive 组件使用)
generate_posts_data() {
  local data_file="$PROJECT_ROOT/docs/.vitepress/theme/components/daily-posts.data.js"
  
  echo "// 自动生成的数据文件" > "$data_file"
  echo "// 由 daily-collect.sh 脚本在收集时更新" >> "$data_file"
  echo "export default {" >> "$data_file"
  echo "  posts: [" >> "$data_file"
  
  # 遍历所有分类目录，收集所有每日文章
  local first=true
  for category in ai web3 claw opc github-trending indie-ideas; do
    local dir="$PROJECT_ROOT/docs/$category"
    if [ -d "$dir" ]; then
      for md_file in "$dir"/*-daily.md; do
        if [ -f "$md_file" ] && [[ "$(basename "$md_file")" == *"$TODAY"* ]]; then
          # 提取标题
          local title=$(grep -m1 '^title:' "$md_file" 2>/dev/null | sed 's/title:\s*//' | sed 's/^\s*//;s/\s*$//')
          # 提取日期（从文件名）
          local date_str=$(basename "$md_file" | sed 's/-daily\.md//')
          # 转换为 timestamp
          local timestamp=$(date -d "$date_str" +%s000 2>/dev/null || echo "0")
          
          if [ -n "$title" ]; then
            # 移除标题中的 emoji
            title=$(echo "$title" | sed 's/[\u{1F300}-\u{1F9FF}]//g' | sed 's/^\s*//;s/\s*$//')
            
            if [ "$first" = true ]; then
              first=false
            else
              echo "," >> "$data_file"
            fi
            
            echo "    { url: '/$category/$date_str-daily.html', dateStr: '$date_str', title: '$title', timestamp: $timestamp }" >> "$data_file"
          fi
        fi
      done
    fi
  done
  
  echo "" >> "$data_file"
  echo "  ]" >> "$data_file"
  echo "}" >> "$data_file"
  
  echo "  生成 posts data: $data_file"
}


# ========== 主流程 ==========

# AI 资讯 - 扩展源
collect_rss "ai" "AI 资讯" "🤖" \
  "https://techcrunch.com/feed/" \
  "https://www.qbitai.com/feed" \
  "https://venturebeat.com/category/ai/feed/" \
  "https://www.artificialintelligence-news.com/feed/" \
  "https://www.technologyreview.com/feed/"

# Web3 资讯
collect_rss "web3" "Web3 资讯" "⛓️" \
  "https://www.coindesk.com/arc/outboundfeeds/rss/" \
  "https://cointelegraph.com/rss" \
  "https://decrypt.co/feed" \
  "https://theblock.co/rss.xml"

# Claw 资讯
collect_rss "claw" "Claw 资讯" "🦀" \
  "https://github.com/openclaw/openclaw/releases.atom" \
  "https://venturebeat.com/category/ai/feed/" \
  "https://www.theverge.com/rss/index.xml"

# OPC 超级个体
collect_rss "opc" "超级个体" "🚀" \
  "https://hnrss.org/frontpage" \
  "https://www.producthunt.com/feed" \
  "https://www.indiehackers.com/feed" \
  "https://sspai.com/feed"

# GitHub Trending
collect_github

# 独立开发灵感
collect_indie_ideas

# Morning Brief
generate_morning_brief

# 更新 index.md
echo -e "\n${GREEN}[Index]${NC} 更新索引..." | tee -a "$LOG_FILE"
for category in ai web3 claw opc github-trending; do
  update_index "$category"
done

# 生成 posts data
generate_posts_data

# Git 提交
echo -e "\n${GREEN}[Git]${NC} 提交..." | tee -a "$LOG_FILE"
cd "$PROJECT_ROOT"
git config user.email "openclaw@daily.bot" 2>/dev/null || true
git config user.name "OpenClaw Daily Bot" 2>/dev/null || true
git add .

if git diff --cached --quiet; then
  echo "没有更改需要提交" | tee -a "$LOG_FILE"
else
  git commit -m "📰 Daily: $TODAY 自动收集 ($(date '+%H:%M'))" | tee -a "$LOG_FILE"
  
  if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
    echo -e "${GREEN}✅ 推送成功!${NC}" | tee -a "$LOG_FILE"
  else
    echo -e "${RED}❌ 推送失败${NC}" | tee -a "$LOG_FILE"
  fi
fi

# 日志总结
echo -e "\n${GREEN}========== 收集总结 ==========${NC}" | tee -a "$LOG_FILE"
echo "AI: ${COUNTS[ai]:-0} 条" | tee -a "$LOG_FILE"
echo "Web3: ${COUNTS[web3]:-0} 条" | tee -a "$LOG_FILE"
echo "Claw: ${COUNTS[claw]:-0} 条" | tee -a "$LOG_FILE"
echo "OPC: ${COUNTS[opc]:-0} 条" | tee -a "$LOG_FILE"
echo "GitHub: ${COUNTS[github]:-0} 条" | tee -a "$LOG_FILE"
echo -e "${GREEN}================================${NC}" | tee -a "$LOG_FILE"
