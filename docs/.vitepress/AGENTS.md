# .vitepress 配置指南

**职责**: VitePress 站点配置中心 - 导航、SEO、SSR、主题

## 📁 目录结构

```
.vitepress/
├── config.ts        # 核心配置（导航/SEO/SSR）
├── theme/
│   ├── index.ts     # 主题入口（扩展默认主题）
│   └── style.css    # 全局样式（Lumen 导入）
└── dist/            # 构建输出（gitignore）
```

## ⚙️ config.ts 配置

### 核心模块

```typescript
defineConfig({
  title/description/lang,     // 基础 SEO
  head: [],                   // HTML meta/tags
  themeConfig: {
    nav: [],                  // 顶部导航（与首页 features 同步）
    sidebar: {},              // 侧边栏分组
    socialLinks: [],          // 社交链接
    footer: {},               // 页脚信息
    search: { provider: 'local' },  // 本地搜索
    appearance: 'dark'        // 默认深色模式
  },
  vite: { 
    ssr: { noExternal: ['@theojs/lumen'] }  // SSR 必需
  },
  lastUpdated: true,
  markdown: { lineNumbers: true }
})
```

### 导航同步检查

**✅ 必须一致**：
- `config.ts` 的 `nav` 数组
- `docs/index.md` 的 `features` 网格
- 实际板块目录：`/web3/`, `/ai/`, `/opc/`, `/claw/`

## 🎨 theme/index.ts

**极简设计（7 行）**：

```typescript
import DefaultTheme from 'vitepress/theme'
import '@theojs/lumen/style'  // 全局样式

export default {
  extends: DefaultTheme,
} satisfies Theme
```

**规则**：
- ✅ 继承默认主题
- ✅ 导入 Lumen 样式
- ❌ 不注册自定义组件（用 Lumen）

## 🚨 关键配置

### SSR noExternal

```typescript
vite: {
  ssr: {
    noExternal: ['@theojs/lumen']  // 必需，否则构建失败
  }
}
```

**原因**: Lumen 组件需在 SSR 时打包，避免 ESM 问题

### 搜索配置

```typescript
search: {
  provider: 'local',  // 使用 VitePress 本地搜索
}
```

**注意**: 避免自定义 `translations`（类型检查严格），使用默认即可

## 🛠️ 开发命令

```bash
# 开发服务器
bun run dev

# 生产构建
bun run build

# 清除缓存（构建错误时）
rm -rf .vitepress/cache .vitepress/dist
```

## ⚠️ 注意事项

- ❌ 不要在 `config.ts` 使用客户端 API
- ❌ 不要修改 `dist/` 目录（构建生成）
- ❌ 不要删除 `noExternal` 配置
- ✅ 修改 `nav` 后同步更新首页 `features`

## 📊 配置数据流

```
config.ts → 定义导航结构 → 顶部菜单
   ↓
index.md → 使用 Frontmatter → 渲染首页
   ↓
theme/index.ts → 导入样式 → 全局生效
```

---

**最后更新**: 2026-03-10
**相关文件**: `/AGENTS.md` (根目录), `/docs/index.md` (首页)
