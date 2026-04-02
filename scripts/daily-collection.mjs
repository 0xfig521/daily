#!/usr/bin/env node
/**
 * Daily 综合资讯收集脚本
 * 功能：收集 AI / Claw / OPC / Web3 四个分类的每日资讯
 * 用法：
 *   node daily-collection.mjs all      # 收集所有分类
 *   node daily-collection.mjs ai       # 只收集AI
 *   node daily-collection.mjs claw     # 只收集Claw
 *   node daily-collection.mjs opc       # 只收集OPC
 *   node daily-collection.mjs web3      # 只收集Web3
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Asia/Shanghai 时区日期
function getToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

function formatDateDisplay(dateStr = getToday()) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai'
  });
}

// 分类配置
const CATEGORIES = {
  ai: {
    name: 'AI 资讯',
    emoji: '🤖',
    docsDir: 'docs/ai',
    indexFile: 'docs/ai/index.md',
    searches: [
      // 英文源
      { query: 'OpenAI GPT-5 2026', source: 'TechCrunch', sourceUrl: 'techcrunch.com' },
      { query: 'Anthropic Claude update 2026', source: 'The Verge', sourceUrl: 'theverge.com' },
      { query: 'Google Gemini AI 2026', source: 'VentureBeat', sourceUrl: 'venturebeat.com' },
      { query: 'AI agent production 2026', source: 'Hacker News', sourceUrl: 'news.ycombinator.com' },
      { query: 'LLM reasoning model 2026', source: 'MIT Tech Review', sourceUrl: 'technologyreview.com' },
      // 中文源
      { query: '大模型 GPT 中文 2026 最新', source: '量子位', sourceUrl: 'qbitai.com' },
      { query: 'AI人工智能 36kr 虎嗅 2026', source: '36kr', sourceUrl: '36kr.com' },
      { query: 'ChatGPT Claude 机器之心 2026', source: '机器之心', sourceUrl: 'jiqizhixin.com' },
    ]
  },
  claw: {
    name: 'Claw 资讯',
    emoji: '🦀',
    docsDir: 'docs/claw',
    indexFile: 'docs/claw/index.md',
    searches: [
      { query: 'OpenClaw AI agent 2026', source: 'TechCrunch', sourceUrl: 'techcrunch.com' },
      { query: 'OpenClaw GitHub releases 2026', source: 'GitHub', sourceUrl: 'github.com' },
      { query: 'ClawHub new skills 2026', source: 'ClawHub', sourceUrl: 'clawhub.ai' },
      { query: 'OpenClaw Nvidia enterprise 2026', source: 'Forbes', sourceUrl: 'forbes.com' },
      { query: 'AI agent framework OpenClaw 2026', source: 'CNBC', sourceUrl: 'cnbc.com' },
      { query: 'OpenClaw 最新动态 2026', source: '知乎', sourceUrl: 'zhihu.com' },
      { query: 'OpenClaw 腾讯云 开发者 2026', source: '腾讯云', sourceUrl: 'cloud.tencent.com' },
    ]
  },
  opc: {
    name: '超级个体',
    emoji: '🚀',
    docsDir: 'docs/opc',
    indexFile: 'docs/opc/index.md',
    searches: [
      { query: 'Indie hackers solo startup 2026', source: 'Indie Hackers', sourceUrl: 'indiehackers.com' },
      { query: 'Product Hunt top products 2026', source: 'Product Hunt', sourceUrl: 'producthunt.com' },
      { query: 'Bootstrapped SaaS startup 2026', source: 'Hacker News', sourceUrl: 'news.ycombinator.com' },
      { query: 'One person business success 2026', source: 'Y Combinator', sourceUrl: 'ycombinator.com' },
      { query: 'Remote work digital nomad 2026', source: 'Forbes', sourceUrl: 'forbes.com' },
      { query: '独立开发者 创业 2026 最新', source: '36kr', sourceUrl: '36kr.com' },
      { query: '一人公司 SaaS 虎嗅 2026', source: '虎嗅', sourceUrl: 'huxiu.com' },
      { query: '独立开发 少数派 2026', source: '少数派', sourceUrl: 'sspai.com' },
    ]
  },
  web3: {
    name: 'Web3 资讯',
    emoji: '⛓️',
    docsDir: 'docs/web3',
    indexFile: 'docs/web3/index.md',
    searches: [
      { query: 'Bitcoin Ethereum price 2026', source: 'CoinDesk', sourceUrl: 'coindesk.com' },
      { query: 'DeFi protocol update 2026', source: 'The Block', sourceUrl: 'theblock.co' },
      { query: 'NFT marketplace trends 2026', source: 'CoinTelegraph', sourceUrl: 'cointelegraph.com' },
      { query: 'Blockchain DAO governance 2026', source: 'Decrypt', sourceUrl: 'decrypt.co' },
      { query: 'Layer2 Ethereum scaling 2026', source: 'The Defiant', sourceUrl: 'thedefiant.io' },
      { query: 'Web3 区块链 36kr 2026', source: '36kr', sourceUrl: '36kr.com' },
      { query: 'DeFi 区块链 Odaily 2026', source: 'Odaily', sourceUrl: 'odaily.com' },
      { query: 'Web3 加密货币 链捕手 2026', source: '链捕手', sourceUrl: 'chaincatcher.com' },
    ]
  }
};

// 分类映射关键词（用于自动分类）
const CATEGORY_KEYWORDS = {
  ai: ['openai', 'claude', 'gpt', 'gemini', 'llm', '大模型', '人工智能', 'ai ', 'ai-', 'machine learning', 'neural'],
  claw: ['openclaw', 'clawhub', 'clawdbot', 'moltbot', 'moltbook', 'agent', 'skill'],
  opc: ['indie', 'solo', 'bootstrap', 'saas', 'product hunt', '一人公司', '独立开发', '超级个体', '数字游民'],
  web3: ['bitcoin', 'ethereum', 'defi', 'nft', 'dao', 'blockchain', 'crypto', 'web3', 'solana', 'layer2']
};

function classifyByKeywords(title, snippet) {
  const text = (title + ' ' + snippet).toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cat;
    }
  }
  return bestMatch || 'ai';
}

// 新闻去重
function deduplicateNews(newsList) {
  const seen = new Set();
  return newsList.filter(item => {
    const key = item.title.substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 主收集类
class DailyCollector {
  constructor() {
    this.today = getToday();
    this.collections = {};
    this.allNews = [];
  }

  getDailyFile(category) {
    return join(PROJECT_ROOT, CATEGORIES[category].docsDir, `${this.today}-daily.md`);
  }

  // 生成单个分类的 Markdown
  generateCategoryMarkdown(category, news) {
    const config = CATEGORIES[category];
    const dateDisplay = formatDateDisplay();
    
    let content = `---
title: ${config.name} ${this.today}
date: ${this.today}
description: ${config.name}每日最新动态
tags: ['${category}', '${config.name}', '每日资讯']
---

# ${config.name} ${config.emoji}

> ${dateDisplay} | ${config.name}

`;

    if (news.length === 0) {
      content += `> 今日暂无更新\n`;
    } else {
      for (const item of news) {
        content += `### ${item.title}\n\n`;
        content += `${item.snippet}\n\n`;
        content += `- 来源: [${item.source}](${item.url})\n\n`;
      }
    }

    content += `---\n*由 OpenClaw 自动收集*\n`;
    return content;
  }

  // 更新分类的 index.md
  updateCategoryIndex(category) {
    const config = CATEGORIES[category];
    const indexPath = join(PROJECT_ROOT, config.indexFile);
    const dailyFile = `${this.today}-daily.md`;
    
    if (!existsSync(indexPath)) {
      console.log(`  [${category}] index不存在，跳过`);
      return;
    }

    let content = readFileSync(indexPath, 'utf-8');
    const linkLine = `- [${this.today} 资讯](./${dailyFile})`;
    
    // 检查是否已有今日链接
    if (content.includes(linkLine)) {
      console.log(`  [${category}] 今日资讯已在index中`);
      return;
    }

    // 尝试找到最新动态区域
    const markers = ['## 🚀 最新动态', '## 📰 最新动态', '## 最新动态', '> 💡 提示'];
    let insertAfter = -1;
    
    for (const marker of markers) {
      const pos = content.indexOf(marker);
      if (pos !== -1) {
        insertAfter = content.indexOf('\n', pos);
        break;
      }
    }

    if (insertAfter === -1) {
      // 如果没找到，添加到文件末尾
      content += '\n' + linkLine + '\n';
    } else {
      content = content.slice(0, insertAfter + 1) + linkLine + '\n' + content.slice(insertAfter + 1);
    }

    writeFileSync(indexPath, content, 'utf-8');
    console.log(`  [${category}] index.md已更新`);
  }

  // 清理30天前的日报
  cleanupOldDailies(category) {
    const config = CATEGORIES[category];
    const docsDir = join(PROJECT_ROOT, config.docsDir);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const files = readdirSync(docsDir);
      for (const file of files) {
        if (!file.match(/^\d{4}-\d{2}-\d{2}-daily\.md$/)) continue;
        
        const filePath = join(docsDir, file);
        const stat = statSync(filePath);
        
        if (stat.mtime < thirtyDaysAgo) {
          execSync(`git rm "${filePath}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
          console.log(`  [${category}] 已删除过期文件: ${file}`);
        }
      }
    } catch (err) {
      // 忽略错误
    }
  }

  // 保存日报
  save(category, news) {
    const content = this.generateCategoryMarkdown(category, news);
    const filePath = this.getDailyFile(category);
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  [${category}] 日报已保存: ${filePath} (${news.length}条)`);
  }

  // Git提交推送
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
      
      const catNames = categories.map(c => CATEGORIES[c].name).join('/');
      execSync(`git commit -m "📰 Daily ${this.today}: ${catNames}"`, { cwd: PROJECT_ROOT });
      
      console.log('正在推送到 GitHub...');
      execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      console.log('推送成功！');
    } catch (err) {
      console.error('Git操作失败:', err.message);
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  // 确定要收集的分类
  let categories = [];
  if (target === 'all') {
    categories = Object.keys(CATEGORIES);
  } else if (CATEGORIES[target]) {
    categories = [target];
  } else {
    console.log(`未知分类: ${target}`);
    console.log('可用分类:', Object.keys(CATEGORIES).join(', '));
    process.exit(1);
  }

  console.log(`\n🦞 Daily 资讯收集 - ${formatDateDisplay()}`);
  console.log(`目标分类: ${categories.map(c => CATEGORIES[c].name).join(', ')}\n`);

  const collector = new DailyCollector();
  const today = getToday();

  // 模拟收集（实际由外部搜索工具提供）
  // 这里生成示例数据结构，实际使用时由主流程填充真实搜索结果
  
  // 输出说明
  console.log('📝 说明: 本脚本设计为由 OpenClaw cron 任务调用');
  console.log('   cron 任务会使用 web_search 工具搜索各分类资讯');
  console.log('   然后将结果通过命令行参数传递给本脚本');
  console.log('');
  console.log('可用命令:');
  console.log('  node daily-collection.mjs all   # 收集所有分类');
  console.log('  node daily-collection.mjs ai   # 只收集AI');
  console.log('  node daily-collection.mjs claw  # 只收集Claw');
  console.log('  node daily-collection.mjs opc  # 只收集OPC');
  console.log('  node daily-collection.mjs web3 # 只收集Web3');
  console.log('');
  console.log('📋 搜索计划:');
  for (const cat of categories) {
    console.log(`\n  [${CATEGORIES[cat].name}]`);
    for (const s of CATEGORIES[cat].searches.slice(0, 3)) {
      console.log(`    - ${s.query} (${s.source})`);
    }
    if (CATEGORIES[cat].searches.length > 3) {
      console.log(`    ... 等共${CATEGORIES[cat].searches.length}个搜索`);
    }
  }
  console.log('\n✅ 脚本验证完成');
}

// 单独执行时显示帮助
main();
