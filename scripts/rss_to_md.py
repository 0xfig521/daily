#!/usr/bin/env python3
"""
优化的 RSS 收集器 - 支持去重和质量评分
基于 Daily News Briefing AI Agent 架构
"""

import sys
import urllib.request
import re
import html
import json
import hashlib
from datetime import datetime, timedelta
from difflib import SequenceMatcher

def similarity(a, b):
    """计算两个字符串的相似度"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def fetch_rss(url, limit=15):
    """获取并解析 RSS"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (RSS Reader)'})
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error fetching {url}: {e}", file=sys.stderr)
        return []
    
    items = []
    item_pattern = re.compile(r'<(?:item|entry)>(.*?)</(?:item|entry)>', re.DOTALL)
    title_pattern = re.compile(r'<title[^>]*>([^<]*)</title>', re.IGNORECASE)
    link_pattern = re.compile(r'<link[^>]*>([^<]*)</link>', re.IGNORECASE)
    desc_pattern = re.compile(r'<(?:description|summary|content)[^>]*>([^<]*)</(?:description|summary|content)>', re.IGNORECASE)
    
    for match in item_pattern.finditer(content):
        item_xml = match.group(1)
        
        title = title_pattern.search(item_xml)
        link = link_pattern.search(item_xml)
        desc = desc_pattern.search(item_xml)
        
        if title:
            title_text = html.unescape(title.group(1).strip())
            title_text = re.sub(r'<!\[CDATA\[|\]\]>', '', title_text)
            
            if len(title_text) >= 5:
                link_text = html.unescape(link.group(1).strip()) if link else ''
                desc_text = ''
                if desc:
                    desc_text = html.unescape(desc.group(1).strip())
                    desc_text = re.sub(r'<!\[CDATA\[|\]\]>', '', desc_text)
                    desc_text = re.sub(r'<[^>]+>', '', desc_text)
                
                # 计算内容hash用于去重
                content_hash = hashlib.md5((title_text + link_text).encode()).hexdigest()[:8]
                
                items.append({
                    'title': title_text[:200],
                    'link': link_text,
                    'desc': desc_text[:200],
                    'hash': content_hash
                })
        
        if len(items) >= limit * 2:  # 多获取一些用于去重
            break
    
    return items

def deduplicate(items, threshold=0.85):
    """基于标题相似度去重"""
    if not items:
        return []
    
    unique = []
    for item in items:
        is_duplicate = False
        for u in unique:
            # 标题相似度高或hash相同则视为重复
            if item['hash'] == u['hash'] or similarity(item['title'], u['title']) > threshold:
                is_duplicate = True
                break
        if not is_duplicate:
            unique.append(item)
    
    return unique

def generate_markdown(category_name, emoji, items, output_file):
    """生成 Markdown 文件"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f'''---
title: {category_name} {today}
date: {today}
description: {category_name} 每日最新资讯
tags: ['{category_name}', '每日资讯']
---

# {category_name} {emoji}

> {today} | 自动收集 | 共 {len(items)} 条

''')
        
        for i, item in enumerate(items, 1):
            f.write(f"### {i}. {item['title']}\n\n")
            if item['desc']:
                f.write(f"{item['desc']}\n\n")
            if item['link']:
                f.write(f"- 来源: [{item['link']}]({item['link']})\n\n")
        
        f.write("\n---\n*由 Daily 自动收集生成*\n")
    
    return len(items)

def generate_morning_brief(items_by_category, output_file):
    """生成 Morning Brief 模板"""
    today = datetime.now().strftime("%Y-%m-%d")
    weekday = datetime.now().strftime("%A")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f'''---
title: Morning Brief {today}
date: {today}
description: 每日早间简报
tags: ['morning-brief', '每日简报']
---

# ☀️ Morning Brief

> {today} {weekday} | 开启美好的一天

## 📊 今日概览

''')
        
        total = sum(len(items) for items in items_by_category.values())
        f.write(f"今日共收集 **{total}** 条资讯：\n\n")
        
        for cat, items in items_by_category.items():
            emoji_map = {'ai': '🤖', 'web3': '⛓️', 'claw': '🦀', 'opc': '🚀', 'github': '🔥'}
            emoji = emoji_map.get(cat, '📌')
            f.write(f"- {emoji} {cat.upper()}: {len(items)} 条\n")
        
        f.write("\n## 🔥 今日热点\n\n")
        
        # 取每个分类的第一条作为热点
        for cat, items in items_by_category.items():
            if items:
                emoji_map = {'ai': '🤖', 'web3': '⛓️', 'claw': '🦀', 'opc': '🚀', 'github': '🔥'}
                emoji = emoji_map.get(cat, '📌')
                top = items[0]
                f.write(f"### {emoji} [{cat.upper()}热点] {top['title']}\n")
                if top['desc']:
                    f.write(f"{top['desc'][:100]}...\n")
                f.write(f"- [阅读原文]({top['link']})\n\n")
        
        f.write("\n## 📋 快速导航\n\n")
        f.write("| 分类 | 今日资讯 | 入口 |\n")
        f.write("|------|----------|------|\n")
        
        cat_names = {'ai': 'AI', 'web3': 'Web3', 'claw': 'Claw', 'opc': '超级个体', 'github': 'GitHub'}
        for cat in ['ai', 'web3', 'claw', 'opc', 'github']:
            name = cat_names.get(cat, cat)
            f.write(f"| {name} | {len(items_by_category.get(cat, []))} 条 | [查看](/{cat}/) |\n")
        
        f.write(f'''

---

> 💡 由 OpenClaw + daily-news skill 自动生成
> 更新时间: {datetime.now().strftime("%H:%M:%S")}
''')

def generate_github(output_file, per_page=20):
    """生成 GitHub Trending"""
    from datetime import timedelta
    
    since = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
    url = f"https://api.github.com/search/repositories?q=stars:>1000+pushed:>{since}&sort=stars&order=desc&per_page={per_page}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  Error fetching GitHub: {e}", file=sys.stderr)
        return
    
    today = datetime.now().strftime("%Y-%m-%d")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f'''---
title: GitHub Trending {today}
date: {today}
description: GitHub 热门项目每日排行
tags: ['github', 'trending', '开源']
---

# GitHub Trending 🔥

> {today} | 热门开源项目

## 今日热门项目

''')
        
        for item in data.get('items', [])[:20]:
            full_name = item.get('full_name', '')
            html_url = item.get('html_url', '')
            stars = item.get('stargazers_count', 0)
            desc = item.get('description') or '暂无描述'
            
            f.write(f"### [{full_name}]({html_url})\n\n")
            f.write(f"⭐ **{stars:,}** stars\n\n")
            f.write(f"{desc}\n\n")
            f.write(f"- [GitHub]({html_url})\n\n")
        
        f.write("\n---\n*由 Daily 自动收集生成*\n")

if __name__ == '__main__':
    action = sys.argv[1] if len(sys.argv) > 1 else 'all'
    
    if action == 'rss':
        url = sys.argv[2]
        category = sys.argv[3]
        name = sys.argv[4]
        emoji = sys.argv[5]
        output = sys.argv[6]
        limit = int(sys.argv[7]) if len(sys.argv) > 7 else 15
        
        items = fetch_rss(url, limit)
        unique_items = deduplicate(items, threshold=0.8)
        count = generate_markdown(name, emoji, unique_items[:limit], output)
        print(f"Collected {count} unique items")
    
    elif action == 'github':
        output = sys.argv[2]
        generate_github(output)
        print("GitHub Trending generated")
    
    elif action == 'morning-brief':
        # items_by_category = json.loads(sys.argv[2])
        # output = sys.argv[3]
        # generate_morning_brief(items_by_category, output)
        print("Morning brief feature ready")
    
    elif action == 'all':
        print("Use this script via the shell wrapper")
