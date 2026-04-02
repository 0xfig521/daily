#!/usr/bin/env node
/**
 * OpenClaw 每日资讯收集脚本
 * 用途：收集 OpenClaw 相关最新资讯，生成日报，更新 index.md，推送到 GitHub
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DOCS_CLAW = join(PROJECT_ROOT, 'docs', 'claw');
const INDEX_PATH = join(DOCS_CLAW, 'index.md');

// 搜索查询配置
const SEARCH_QUERIES = [
  // 英文搜索
  { query: 'OpenClaw AI agent 2026', lang: 'en' },
  { query: 'OpenClaw GitHub releases 2026', lang: 'en' },
  { query: 'clawhub.com new skills 2026', lang: 'en' },
  { query: 'Moltbot Clawdbot 2026', lang: 'en' },
  { query: 'OpenClaw news April 2026', lang: 'en' },
];

// 分类映射
const CATEGORY_MAP = {
  '生态': ['ecosystem', 'partnership', 'acquisition', 'integration', '大厂', '合作', '收购'],
  '创业': ['startup', 'funding', 'investment', 'venture', '融资', '投资', '创业'],
  '产品': ['release', 'launch', 'new feature', 'update', 'product', '版本', '新功能', '发布'],
  '安全': ['security', 'vulnerability', 'breach', 'hack', '安全问题', '漏洞', '攻击'],
  '社区': ['community', 'skill', 'plugin', 'contributor', '社区', '插件', '贡献'],
  '技术': ['tutorial', 'how to', 'technical', 'deep dive', '教程', '技术', '解析'],
};

// 工具函数
function getToday() {
  const now = new Date();
  // Asia/Shanghai 时区
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // YYYY-MM-DD
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' });
}

function classifyNews(title, snippet) {
  const text = (title + ' ' + snippet).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return '社区'; // 默认分类
}

// 搜索结果去重
function deduplicateNews(newsList) {
  const seen = new Set();
  return newsList.filter(item => {
    const key = item.title.substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 简单搜索（模拟，实际由外部搜索工具提供）
// 注意：此脚本设计为由 openclaw 执行工具调用 web_search 获取数据
// 这里提供结构化的输出框架

class NewsCollector {
  constructor() {
    this.news = [];
    this.today = getToday();
    this.dailyFile = join(DOCS_CLAW, `${this.today}-daily.md`);
  }

  // 添加新闻条目
  addNews(title, snippet, url, source, date) {
    const category = classifyNews(title, snippet);
    this.news.push({ title, snippet, url, source, date, category });
  }

  // 生成 Markdown 内容
  generateMarkdown() {
    const dateDisplay = formatDate(this.today);
    
    // 按分类组织
    const categorized = {};
    for (const item of this.news) {
      if (!categorized[item.category]) {
        categorized[item.category] = [];
      }
      categorized[item.category].push(item);
    }

    let content = `---
title: OpenClaw 每日资讯 ${this.today}
date: ${this.today}
description: OpenClaw 及 Claw 生态每日最新动态
tags: ['OpenClaw', 'Claw', '每日资讯', '生态']
---

# OpenClaw 每日资讯 🦀

> ${dateDisplay} | 专注 OpenClaw 及 Claw 生态前沿动态

`;

    // 按固定顺序输出分类
    const categoryOrder = ['生态', '创业', '产品', '安全', '社区', '技术'];
    
    for (const cat of categoryOrder) {
      if (categorized[cat] && categorized[cat].length > 0) {
        content += `## ${cat}\n\n`;
        for (const item of categorized[cat]) {
          content += `### ${item.title}\n\n`;
          content += `${item.snippet}\n\n`;
          content += `- 来源: [${item.source}](${item.url})\n`;
          content += `- 发布日期: ${item.date}\n\n`;
        }
      }
    }

    content += `---\n\n`;
    content += `*本资讯由 OpenClaw 自动收集生成*\n`;

    return content;
  }

  // 更新 index.md
  updateIndex() {
    if (!this.news.length) {
      console.log('没有新闻，跳过 index.md 更新');
      return;
    }

    let indexContent = readFileSync(INDEX_PATH, 'utf-8');
    
    // 新的动态链接
    const newLink = `- [${this.today} 资讯](./${this.today}-daily.md)`;
    
    // 检查是否已有今天的链接
    if (indexContent.includes(newLink)) {
      console.log('今日资讯已在 index.md 中');
      return;
    }

    // 在 "最新动态" 区域插入
    const marker = '## 📰 最新动态';
    const markerPos = indexContent.indexOf(marker);
    
    if (markerPos === -1) {
      console.log('未找到"最新动态"标记，尝试其他方式');
      return;
    }

    // 找到 marker 后的第一个列表项或空行
    let insertPos = indexContent.indexOf('\n', markerPos);
    if (insertPos === -1) {
      insertPos = markerPos + marker.length;
    }

    // 找到下一个 section 或文件末尾
    let endPos = indexContent.indexOf('\n---', insertPos);
    if (endPos === -1) {
      endPos = indexContent.indexOf('\n##', insertPos);
    }
    if (endPos === -1) {
      endPos = indexContent.length;
    }

    const before = indexContent.substring(0, insertPos + 1);
    const after = indexContent.substring(endPos);
    
    indexContent = before + newLink + '\n' + after;
    
    writeFileSync(INDEX_PATH, indexContent, 'utf-8');
    console.log('index.md 已更新');
  }

  // 提交并推送
  commitAndPush() {
    try {
      // 配置 git（如果需要）
      execSync('git config user.email "openclaw@daily.bot" || true', { cwd: PROJECT_ROOT });
      execSync('git config user.name "OpenClaw Daily Bot" || true', { cwd: PROJECT_ROOT });
      
      // 添加文件
      execSync('git add docs/claw/', { cwd: PROJECT_ROOT });
      
      // 检查是否有更改
      const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT }).toString();
      if (!status.trim()) {
        console.log('没有需要提交的更改');
        return;
      }
      
      // 提交
      execSync(`git commit -m "📰 Daily: ${this.today} OpenClaw 资讯"`, { cwd: PROJECT_ROOT });
      
      // 推送
      console.log('正在推送到 GitHub...');
      execSync('git push origin main', { cwd: PROJECT_ROOT });
      console.log('推送成功！');
    } catch (err) {
      console.error('Git 操作失败:', err.message);
      throw err;
    }
  }

  // 清理旧文件（保留最近 30 天）
  cleanupOldFiles() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const files = readdirSync(DOCS_CLAW);
      for (const file of files) {
        if (!file.match(/^\d{4}-\d{2}-\d{2}-daily\.md$/)) continue;
        
        const filePath = join(DOCS_CLAW, file);
        const stat = statSync(filePath);
        
        if (stat.mtime < thirtyDaysAgo) {
          execSync(`git rm ${file}`, { cwd: PROJECT_ROOT });
          console.log(`已删除过期文件: ${file}`);
        }
      }
    } catch (err) {
      console.log('清理旧文件时出错（可忽略）:', err.message);
    }
  }

  // 保存日报
  save() {
    if (this.news.length === 0) {
      console.log('没有收集到新闻，不生成日报');
      return false;
    }

    const content = this.generateMarkdown();
    writeFileSync(this.dailyFile, content, 'utf-8');
    console.log(`日报已生成: ${this.dailyFile}`);
    return true;
  }
}

// 主函数 - 从命令行参数获取搜索结果
async function main() {
  const args = process.argv.slice(2);
  
  // 如果没有参数，显示帮助
  if (args.length === 0) {
    console.log(`
OpenClaw 每日资讯收集脚本
用法: node collect-claw-news.mjs <json_data>

数据格式 (JSON):
{
  "news": [
    {
      "title": "新闻标题",
      "snippet": "新闻摘要",
      "url": "原文链接",
      "source": "来源名称",
      "date": "2026-04-03"
    }
  ]
}
    `);
    process.exit(1);
  }

  try {
    const input = JSON.parse(args[0]);
    const collector = new NewsCollector();
    
    for (const item of input.news || []) {
      collector.addNews(item.title, item.snippet, item.url, item.source, item.date);
    }
    
    collector.news = deduplicateNews(collector.news);
    
    if (collector.save()) {
      collector.updateIndex();
      collector.cleanupOldFiles();
      collector.commitAndPush();
    }
    
    console.log('完成！');
  } catch (err) {
    console.error('执行失败:', err);
    process.exit(1);
  }
}

main();
