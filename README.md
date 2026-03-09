# 每日资讯 📰

> 前沿资讯 · 深度洞察 · 趋势把握

一个基于 [VitePress](https://vitepress.dev/) 构建的每日资讯站点，专注于 Web3、AI 和超级个体（OPC）领域的前沿资讯分享。

## 🚀 技术栈

- **VitePress** - 基于 Vite 的静态站点生成器
- **Vue 3** - 渐进式 JavaScript 框架
- **Vercel** - 部署与分析平台
- **TypeScript** - 类型安全的 JavaScript

## 📁 项目结构

```
daily/
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts       # 站点配置
│   │   └── theme/          # 自定义主题
│   ├── web3/               # Web3 资讯板块
│   ├── ai/                 # AI 资讯板块
│   └── opc/                # 超级个体板块
├── public/                 # 静态资源
├── package.json
└── vercel.json             # Vercel 部署配置
```

## 🛠️ 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🌐 部署到 Vercel

### 方法一：通过 Vercel CLI 部署

1. 安装 Vercel CLI

```bash
npm install -g vercel
```

2. 登录 Vercel

```bash
vercel login
```

3. 部署

```bash
vercel
```

4. 绑定域名（可选）

```bash
vercel --prod
```

### 方法二：通过 Vercel Dashboard 部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库 `IceHugh/daily`
4. 配置：
   - **Framework Preset**: VitePress
   - **Build Command**: `npm run build`
   - **Output Directory**: `docs/.vitepress/dist`
5. 点击 "Deploy"

### 绑定自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 进入 "Settings" → "Domains"
3. 添加你的域名
4. 配置 DNS 记录

## 📝 内容管理

### 添加新资讯

1. 在对应的板块目录下创建新的 Markdown 文件
2. 使用 frontmatter 添加元数据

```markdown
---
title: 资讯标题
date: 2025-03-09
tags: ['tag1', 'tag2']
---

# 资讯内容
```

3. 更新 `config.ts` 中的侧边栏配置

## 🔧 配置说明

### SEO 配置

在 `docs/.vitepress/config.ts` 中修改 SEO 元数据：

```typescript
head: [
  ['meta', { name: 'author', content: 'IceHugh' }],
  ['meta', { name: 'keywords', content: 'Web3,AI,超级个体' }],
  // ...
]
```

### 主题定制

修改 `docs/.vitepress/theme/style.css` 来自定义样式。

## 📊 分析

项目已集成 [Vercel Analytics](https://vercel.com/analytics)，无需额外配置即可查看访问数据。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系

- GitHub: [IceHugh](https://github.com/IceHugh)
- 邮箱: your-email@example.com
