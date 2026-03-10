# 0xfig 项目开发约定

**生成时间**: 2026-03-10
**技术栈**: VitePress v1.6.4 + Vue 3 + Bun + @theojs/lumen v6.4.5

## 📋 项目信息

- **名称**: 0xfig | 前沿科技资讯
- **板块**: Web3、AI、OPC（超级个体）、Claw
- **包管理器**: Bun (首选) / npm

## 🛠️ 开发命令

### 开发服务器

```bash
# 启动开发服务器 (推荐 Bun)
bun run dev

# 或使用 npm
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 生产构建
bun run build

# 预览构建结果
bun run preview
```

### 依赖管理

```bash
# 安装依赖
bun install

# 添加依赖
bun add package-name

# 添加开发依赖
bun add -d package-name

# 移除依赖
bun remove package-name

# 重新安装所有依赖
rm -rf node_modules bun.lockb && bun install
```

## 📁 项目结构

```
daily/
├── docs/
│   ├── .vitepress/          # 站点配置（config.ts + theme）
│   │   ├── config.ts        # 导航/SEO/SSR 配置
│   │   └── theme/
│   │       ├── index.ts     # 主题入口（导入 Lumen 样式）
│   │       └── style.css    # 全局样式
│   ├── web3/                # Web3 板块（区块链/DeFi/NFT）
│   ├── ai/                  # AI 板块（大模型/工具/应用）
│   ├── opc/                 # 超级个体（一人公司/独立开发）
│   ├── claw/                # Claw 板块（新增）
│   └── index.md             # 首页（Features 导航）
├── public/                  # 静态资源（favicon 等）
└── package.json
```

**⚠️ 文件命名规范**：
- ✅ 标准：`YYYY-MM-DD-article-title.md`
- ⚠️ 偏差：存在未遵循规范的无日期文件（如 `analysis.md`, `latest.md`, `tools.md`）

## 🎨 代码风格指南

### Markdown Frontmatter

所有文章必须包含以下 Frontmatter：

```markdown
---
title: 文章标题 (必填)
description: 简短描述 (必填)
date: 2025-03-09 (必填，格式：YYYY-MM-DD)
tags: ['标签 1', '标签 2'] (可选)
outline: 2 (可选，目录层级，默认 2)
---
```

### 导入规范

**Lumen 组件导入**：

```vue
<script setup>
// 从 @theojs/lumen 导入组件
import { Links, Underline, BoxCube, Pill, Card } from '@theojs/lumen'
</script>
```

**导入顺序**：
1. 先导入 Lumen 组件
2. 再导入其他 Vue 组件
3. 最后导入工具函数

### 命名约定

**文件命名**：
- 板块首页：`index.md`
- 文章文件：`YYYY-MM-DD-article-title.md`
- 组件文件：`PascalCase.vue` (如 `HomePage.vue`)
- 配置文件：`kebab-case.ts` (如 `config.ts`)

**目录命名**：
- 全小写：`web3/`, `ai/`, `opc/`
- 使用短横线分隔：`latest-news/`

**标题命名**：
- 使用 Emoji 增加可读性：`# Web3 资讯 🚀`
- 板块标题保持一致性

### 组件使用规范

**Lumen 组件**：
- `<Underline color="brand" />` - 下划线装饰（color: brand/accent/gray）
- `<Links :grid="3" :items={[...]}/>` - 链接网格（grid: 2/3/4）
- `<BoxCube :items={[...]}/>` - 话题卡片

**Iconify 图标**：
```typescript
// 格式：'{库名}:{图标名}'
icon: { icon: 'logos:openai', color: '#412991' }
// 常用库：logos（品牌）, bi（Bootstrap）, mdi（Material）, cryptologos（加密货币）
```

### 错误处理

**构建错误**：
1. 清除缓存：`rm -rf docs/.vitepress/dist`
2. 重新安装：`bun install`
3. 重新构建：`bun run build`

**Lumen 组件不显示**：检查样式导入 `import '@theojs/lumen/style'`

### 内容创作流程

**添加新文章**：
```bash
# 1. 创建文件（遵循 YYYY-MM-DD 格式）
touch docs/web3/2025-03-09-article-title.md

# 2. 编辑 Frontmatter（title/description/date 必填）
# 3. 编写内容
```

**文章结构**：
```markdown
---
title: 标题
description: 描述
date: 2025-03-09
tags: ['标签']
---

# 主标题
## 副标题
内容...
---
> 引用或总结
```

## ⚠️ 注意事项

### SSR 配置

确保 `config.ts` 中包含：
```typescript
vite: {
  ssr: {
    noExternal: ['@theojs/lumen']  // 必需，否则构建失败
  }
}
```

### 避免的错误

- ❌ 不要在客户端使用 `createContentLoader`
- ❌ 不要创建自定义组件（优先使用 Lumen）
- ❌ 不要修改 Lumen 源码
- ❌ 不要提交 `node_modules/` 或 `dist/`

## 🚀 部署

**Vercel**：推送 GitHub 自动部署
- 构建命令：`bun run build`
- 输出目录：`docs/.vitepress/dist`

---

**最后更新**: 2026-03-10
**维护者**: IceHugh
