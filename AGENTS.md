# Daily 项目开发约定

## 📋 项目信息

- **名称**: 每日资讯
- **技术栈**: VitePress + Vue 3 + Bun + Lumen
- **包管理器**: Bun (首选) / npm
- **构建工具**: VitePress v1.6.4
- **UI 组件库**: @theojs/lumen v6.4.5

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
│   ├── .vitepress/
│   │   ├── config.ts          # 站点配置
│   │   ├── theme/
│   │   │   ├── index.ts       # 主题入口
│   │   │   └── style.css      # 全局样式
│   │   └── dist/              # 构建输出
│   ├── web3/                  # Web3 板块
│   ├── ai/                    # AI 板块
│   ├── opc/                   # 超级个体板块
│   └── index.md               # 首页
├── public/                    # 静态资源
└── package.json
```

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

**Underline 组件**：
```vue
<Underline color="brand" />
<!-- color 选项：brand, accent, gray -->
```

**Links 组件**：
```vue
<Links
  :grid="3"
  :items="[
    {
      icon: { icon: 'logos:ethereum', color: '#627EEA' },
      name: '以太坊',
      desc: '描述',
      link: 'https://ethereum.org/',
      linkText: '访问'
    }
  ]"
/>
<!-- grid 选项：2, 3, 4 -->
```

**BoxCube 组件**：
```vue
<BoxCube
  :items="[
    { icon: '🌐', title: 'DeFi', desc: '去中心化金融' }
  ]"
/>
```

### Iconify 图标使用

```typescript
// 格式：'{库名}:{图标名}'
icon: { icon: 'logos:openai', color: '#412991' }

// 常用图标库：
// - logos: 品牌 logo
// - bi: Bootstrap Icons
// - mdi: Material Design Icons
// - cryptologos: 加密货币 logo
```

### 错误处理

**构建错误**：
1. 清除缓存：`rm -rf docs/.vitepress/dist`
2. 重新安装：`bun install`
3. 重新构建：`bun run build`

**Lumen 组件不显示**：
1. 检查样式导入：`import '@theojs/lumen/style'`
2. 确保在 `<script setup>` 中导入组件
3. 检查 Lumen package.json 是否有 `./components` 导出

### CSS 规范

**使用 CSS 变量**：
```css
/* ✅ 正确 */
--font-size-h1: 4rem;
--color-primary: #007bff;

/* ❌ 错误 - 不能使用花括号 */
--font-size-h1: { 4rem };
```

**样式优先级**：
1. Lumen 默认样式
2. 自定义 `theme/style.css`
3. 组件内联样式

### 内容创作流程

**添加新文章**：

```bash
# 1. 创建文件
touch docs/web3/2025-03-09-article-title.md

# 2. 编辑 Frontmatter
# 3. 编写内容
# 4. 提交并推送
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
    noExternal: ['@theojs/lumen']
  }
}
```

### 避免的错误

- ❌ 不要在客户端使用 `createContentLoader`
- ❌ 不要创建自定义组件（优先使用 Lumen）
- ❌ 不要修改 Lumen 源码
- ❌ 不要提交 `node_modules/` 或 `dist/`

### 性能优化

1. **图片优化**: 使用 WebP 格式
2. **按需加载**: 只导入必要的组件
3. **CDN 加速**: 外部资源使用 CDN

## 🚀 部署

### Vercel 部署

```bash
# 自动部署：推送到 GitHub
# 构建命令：bun run build
# 输出目录：docs/.vitepress/dist
```

### 手动部署

```bash
# 1. 构建
bun run build

# 2. 上传 dist 目录到服务器
```

## 🔧 开发工具

**推荐扩展**：
- VS Code
- Volar (Vue 3)
- Prettier
- ESLint
- Markdown All in One

**调试**：
- VitePress DevTools
- Vue DevTools

## 📚 参考文档

- [VitePress](https://vitepress.dev/)
- [Lumen](https://lumen.theojs.cn/)
- [Vue 3](https://vuejs.org/)
- [Bun](https://bun.sh/)
- [Iconify](https://icon-sets.iconify.design/)

---

**最后更新**: 2025-03-09
**维护者**: IceHugh
