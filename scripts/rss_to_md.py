#!/usr/bin/env python3
import sys
import urllib.request
import re
import html
import json
from datetime import datetime

def fetch_and_generate(url, category_name, emoji, output_file, limit=10):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return 0
    
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
                
                items.append({
                    'title': title_text[:200],
                    'link': link_text,
                    'desc': desc_text[:200]
                })
        
        if len(items) >= limit:
            break
    
    # 生成 markdown
    today = datetime.now().strftime("%Y-%m-%d")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f'''---
title: {category_name} {today}
date: {today}
description: {category_name} 每日最新资讯
tags: ['{category_name}', '每日资讯']
---

# {category_name} {emoji}

> {today} | 自动收集

''')
        
        for item in items:
            f.write(f"### {item['title']}\n\n")
            if item['desc']:
                f.write(f"{item['desc']}\n\n")
            if item['link']:
                f.write(f"- 来源: [{item['link']}]({item['link']})\n\n")
            else:
                f.write(f"- 来源: {url}\n\n")
        
        f.write("\n*由 Daily 自动收集生成*\n")
    
    return len(items)

def generate_github(output_file, per_page=20):
    from datetime import datetime, timedelta
    
    since = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
    url = f"https://api.github.com/search/repositories?q=stars:>1000+pushed:>{since}&sort=stars&order=desc&per_page={per_page}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  Error fetching GitHub: {e}")
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
        
        for item in data.get('items', []):
            full_name = item.get('full_name', '')
            html_url = item.get('html_url', '')
            stars = item.get('stargazers_count', 0)
            desc = item.get('description') or '暂无描述'
            
            f.write(f"### [{full_name}]({html_url})\n\n")
            f.write(f"⭐ {stars:,} stars\n\n")
            f.write(f"{desc}\n\n")
            f.write(f"- 来源: [{html_url}]({html_url})\n\n")
        
        f.write("\n*由 Daily 自动收集生成*\n")

if __name__ == '__main__':
    action = sys.argv[1] if len(sys.argv) > 1 else 'all'
    
    if action == 'rss':
        url = sys.argv[2]
        category = sys.argv[3]
        name = sys.argv[4]
        emoji = sys.argv[5]
        output = sys.argv[6]
        limit = int(sys.argv[7]) if len(sys.argv) > 7 else 10
        count = fetch_and_generate(url, name, emoji, output, limit)
        print(f"Collected {count} items")
    
    elif action == 'github':
        output = sys.argv[2]
        generate_github(output)
        print("GitHub Trending generated")
