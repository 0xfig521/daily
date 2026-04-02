#!/usr/bin/env node
/**
 * RSS 资讯收集器
 * 功能：从多个 RSS 源收集各分类最新资讯，生成日报
 * 
 * 使用方式：
 *   node rss-collector.mjs          # 收集所有分类
 *   node rss-collector.mjs ai        # 只收集 AI
 *   node rss-collector.mjs claw      # 只收集 Claw
 *   node rss-collector.mjs opc       # 只收集 OPC
 *   node rss-collector.mjs web3      # 只收集 Web3
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ============== RSS 源配置 ==============

const RSS_FEEDS = {
  ai: {
    name: 'AI 资讯',
    emoji: '🤖',
    docsDir: 'docs/ai',
    indexFile: 'docs/ai/index.md',
    feeds: [
      // 英文源
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', lang: 'en' },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', lang: 'en' },
      { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', lang: 'en' },
      { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', lang: 'en' },
      { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', lang: 'en' },
      // 中文源
      { name: '36kr', url: 'https://36kr.com/feed', lang: 'zh' },
      { name: '机器之心', url: 'https://www.jiqizhixin.com/rss', lang: 'zh' },
      { name: '量子位', url: 'https://www.qbitai.com/feed', lang: 'zh' },
    ]
  },
  claw: {
    name: 'Claw 资讯',
    emoji: '🦀',
    docsDir: 'docs/claw',
    indexFile: 'docs/claw/index.md',
    feeds: [
      // OpenClaw 官方
      { name: 'OpenClaw GitHub', url: 'https://github.com/openclaw/openclaw/releases.atom', lang: 'en' },
      { name: 'OpenClaw Blog', url: 'https://openclaw.ai/blog/feed', lang: 'en' },
      // ClawHub
      { name: 'ClawHub', url: 'https://clawhub.ai/feed', lang: 'en' },
      // 社区博客
      { name: 'The Verge AI', url: 'https://www.theverge.com/rss/index.xml', lang: 'en' },
      // 中文
      { name: '知乎', url: 'https://www.zhihu.com/rss', lang: 'zh' },
      { name: '腾讯云开发者', url: 'https://cloud.tencent.com/developer/api/rss/131609', lang: 'zh' },
    ]
  },
  opc: {
    name: '超级个体',
    emoji: '🚀',
    docsDir: 'docs/opc',
    indexFile: 'docs/opc/index.md',
    feeds: [
      // 英文源
      { name: 'Indie Hackers', url: 'https://www.indiehackers.com/feed', lang: 'en' },
      { name: 'Product Hunt', url: 'https://blog.producthunt.com/feed', lang: 'en' },
      { name: 'Hacker News', url: 'https://hnrss.org/frontpage', lang: 'en' },
      { name: 'Y Combinator', url: 'https://www.ycombinator.com/news/rss', lang: 'en' },
      // 中文源
      { name: '少数派', url: 'https://sspai.com/feed', lang: 'zh' },
      { name: '36kr 创业', url: 'https://36kr.com/feed', lang: 'zh' },
    ]
  },
  web3: {
    name: 'Web3 资讯',
    emoji: '⛓️',
    docsDir: 'docs/web3',
    indexFile: 'docs/web3/index.md',
    feeds: [
      // 英文源
      { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', lang: 'en' },
      { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', lang: 'en' },
      { name: 'The Block', url: 'https://www.theblock.co/rss.xml', lang: 'en' },
      { name: 'Decrypt', url: 'https://decrypt.co/feed', lang: 'en' },
      { name: 'The Defiant', url: 'https://thedefiant.io/feed/', lang: 'en' },
      // 中文源
      { name: '链捕手', url: 'https://www.chaincatcher.com/feed', lang: 'zh' },
      { name: 'Odaily', url: 'https://odaily.com/feed', lang: 'zh' },
    ]
  }
};

// 关键词过滤（用于判断是否属于该分类）
const CATEGORY_KEYWORDS = {
  ai: ['ai', 'artificial intelligence', 'machine learning', 'openai', 'gpt', 'claude', 'gemini', 'llm', '大模型', '人工智能', '深度学习', '神经网络', 'chatgpt', 'anthropic', 'google ai', 'meta ai'],
  claw: ['openclaw', 'clawhub', 'clawdbot', 'moltbot', 'agent framework', 'ai agent', 'autonomous agent'],
  opc: ['indie hacker', 'bootstrap', 'saas', 'solo founder', 'one person', 'startup', 'product hunt', 'side project', 'mrr', 'arr', '独立开发', '一人公司', '超级个体', '数字游民', '远程工作'],
  web3: ['bitcoin', 'ethereum', 'defi', 'nft', 'dao', 'blockchain', 'crypto', 'web3', 'solana', 'layer2', 'token', '交易', '区块链', '加密货币', '去中心化']
};

// ============== 工具函数 ==============

function getToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

function formatDateDisplay() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai'
  });
}

// 获取文章发布时间（兼容 RSS 2.0 和 Atom）
function getPubDate(item) {
  // RSS 2.0: <pubDate>
  if (item.pubDate) return new Date(item.pubDate);
  // Atom: <published> 或 <updated>
  if (item.published) return new Date(item.published);
  if (item.updated) return new Date(item.updated);
  return new Date();
}

// 判断文章是否匹配分类
function matchesCategory(title, description, category) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  const keywords = CATEGORY_KEYWORDS[category] || [];
  return keywords.some(kw => text.includes(kw.toLowerCase()));
}

// 从 RSS XML 解析条目
function parseRSS(xml, sourceName) {
  const items = [];
  
  // 简单正则解析（避免依赖外部库）
  // 匹配 <item>...</item> 或 <entry>...</entry>
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    // 提取各字段
    const getContent = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m = itemXml.match(regex);
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };
    
    const title = getContent('title');
    const link = getContent('link');
    let description = getContent('description') || getContent('summary') || getContent('content');
    const pubDate = getPubDate({ pubDate: getContent('pubDate'), published: getContent('published'), updated: getContent('updated') });
    
    // 清理 HTML 标签
    description = description.replace(/<[^>]+>/g, '').trim();
    if (description.length > 300) {
      description = description.substring(0, 300) + '...';
    }
    
    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        source: sourceName,
        url: link
      });
    }
  }
  
  return items;
}

// 从 URL 获取 RSS 内容
async function fetchRSS(url) {
  try {
    const xml = execSync(`curl -sL --max-time 30 "${url}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    return xml;
  } catch (err) {
    console.error(`  获取失败: ${url} - ${err.message}`);
    return '';
  }
}

// ============== 主收集类 ==============

class RSSCollector {
  constructor() {
    this.today = getToday();
  }

  // 收集单个分类的 RSS
  async collectCategory(category) {
    const config = RSS_FEEDS[category];
    if (!config) {
      console.log(`未知分类: ${category}`);
      return [];
    }

    console.log(`\n[${config.name}] 开始收集...`);
    const allItems = [];

    for (const feed of config.feeds) {
      try {
        console.log(`  获取 ${feed.name}...`);
        const xml = await fetchRSS(feed.url);
        
        if (!xml) continue;
        
        const items = parseRSS(xml, feed.name);
        
        // 过滤并标记属于该分类的文章
        for (const item of items) {
          if (matchesCategory(item.title, item.description, category)) {
            item.category = category;
            allItems.push(item);
          }
        }
        
        console.log(`    -> 获取 ${items.length} 条, 命中 ${items.filter(i => matchesCategory(i.title, i.description, category)).length} 条`);
      } catch (err) {
        console.error(`  获取 ${feed.name} 失败: ${err.message}`);
      }
    }

    // 按时间排序
    allItems.sort((a, b) => b.pubDate - a.pubDate);
    
    // 去重（根据标题前50字符）
    const seen = new Set();
    const unique = allItems.filter(item => {
      const key = item.title.substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`[${config.name}] 共收集 ${unique.length} 条去重后资讯`);
    return unique;
  }

  // 收集所有分类
  async collectAll() {
    const results = {};
    for (const category of Object.keys(RSS_FEEDS)) {
      results[category] = await this.collectCategory(category);
    }
    return results;
  }

  // 生成 Markdown
  generateMarkdown(category, items) {
    const config = RSS_FEEDS[category];
    const dateDisplay = formatDateDisplay();
    
    let content = `---
title: ${config.name} ${this.today}
date: ${this.today}
description: ${config.name}每日最新资讯
tags: ['${category}', '${config.name}', '每日资讯']
---

# ${config.name} ${config.emoji}

> ${dateDisplay} | ${config.name}

`;

    if (items.length === 0) {
      content += `> 今日暂无更新\n`;
    } else {
      for (const item of items) {
        const dateStr = item.pubDate.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
        content += `### ${item.title}\n\n`;
        if (item.description) {
          content += `${item.description}\n\n`;
        }
        content += `- 来源: [${item.source}](${item.url})\n`;
        content += `- 发布: ${dateStr}\n\n`;
      }
    }

    content += `---\n*由 OpenClaw RSS 收集器自动生成*\n`;
    return content;
  }

  // 保存日报
  save(category, items) {
    const config = RSS_FEEDS[category];
    const filePath = join(PROJECT_ROOT, config.docsDir, `${this.today}-daily.md`);
    
    const content = this.generateMarkdown(category, items);
    writeFileSync(filePath, content, 'utf-8');
    
    console.log(`  [${config.name}] 已保存: ${filePath}`);
    return filePath;
  }

  // 更新 index.md
  updateIndex(category) {
    const config = RSS_FEEDS[category];
    const indexPath = join(PROJECT_ROOT, config.indexFile);
    const dailyFile = `${this.today}-daily.md`;
    
    if (!existsSync(indexPath)) {
      console.log(`  [${config.name}] index不存在`);
      return;
    }

    let content = readFileSync(indexPath, 'utf-8');
    const linkLine = `- [${this.today} 资讯](./${dailyFile})`;
    
    if (content.includes(linkLine)) {
      console.log(`  [${config.name}] 今日资讯已在index中`);
      return;
    }

    // 查找最新动态区域
    const markers = ['## 🚀 最新动态', '## 📰 最新动态', '## 最新动态', '## 🎯 最新动态', '## 📈 最新动态', '> 💡 提示'];
    let insertAfter = -1;
    
    for (const marker of markers) {
      const pos = content.indexOf(marker);
      if (pos !== -1) {
        insertAfter = content.indexOf('\n', pos);
        break;
      }
    }

    if (insertAfter === -1) {
      content += '\n' + linkLine + '\n';
    } else {
      content = content.slice(0, insertAfter + 1) + linkLine + '\n' + content.slice(insertAfter + 1);
    }

    writeFileSync(indexPath, content, 'utf-8');
    console.log(`  [${config.name}] index.md已更新`);
  }

  // Git 提交推送
  commitAndPush(categories) {
    try {
      execSync('git config user.email "openclaw@daily.bot"', { cwd: PROJECT_ROOT });
      execSync('git config user.name "OpenClaw Daily Bot"', { cwd: PROJECT_ROOT });
      
      execSync('git add .', { cwd: PROJECT_ROOT });
      
      const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT }).toString();
      if (!status.trim()) {
        console.log('\n没有需要提交的更改');
        return;
      }
      
      const catNames = categories.map(c => RSS_FEEDS[c].name).join('/');
      execSync(`git commit -m "📰 RSS: ${this.today} ${catNames}"`, { cwd: PROJECT_ROOT });
      
      console.log('正在推送...');
      execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      console.log('推送成功!');
    } catch (err) {
      console.error('Git操作失败:', err.message);
    }
  }
}

// ============== 主函数 ==============

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  let categories = [];
  if (target === 'all') {
    categories = Object.keys(RSS_FEEDS);
  } else if (RSS_FEEDS[target]) {
    categories = [target];
  } else {
    console.log(`未知分类: ${target}`);
    console.log('可用:', Object.keys(RSS_FEEDS).join(', '));
    process.exit(1);
  }

  console.log(`\n🦞 Daily RSS 收集器 - ${formatDateDisplay()}`);
  console.log(`分类: ${categories.map(c => RSS_FEEDS[c].name).join(', ')}\n`);

  const collector = new RSSCollector();
  
  // 收集所有分类
  const allResults = {};
  for (const cat of categories) {
    allResults[cat] = await collector.collectCategory(cat);
  }
  
  // 保存并更新
  console.log('\n📝 保存日报...');
  for (const cat of categories) {
    collector.save(cat, allResults[cat]);
    collector.updateIndex(cat);
  }
  
  // 提交推送
  console.log('\n📤 提交推送...');
  collector.commitAndPush(categories);
  
  console.log('\n✅ 完成!');
}

main().catch(console.error);
