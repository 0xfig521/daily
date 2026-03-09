import { defineConfig } from 'vitepress'
import { vercelAnalytics } from '@vercel/analytics/vite'

export default defineConfig({
  // 基础配置
  title: '每日资讯',
  description: '分享 Web3、AI 和超级个体相关的前沿资讯',
  lang: 'zh-CN',

  // SEO 配置
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'author', content: 'IceHugh' }],
    ['meta', { name: 'keywords', content: 'Web3,AI,超级个体,一人公司,区块链,人工智能,创业者' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '每日资讯' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: 'Web3', link: '/web3/' },
      { text: 'AI', link: '/ai/' },
      { text: 'OPC', link: '/opc/' },
    ],

    // 侧边栏
    sidebar: {
      '/web3/': [
        {
          text: 'Web3 资讯',
          items: [
            { text: '最新动态', link: '/web3/latest' },
            { text: '深度分析', link: '/web3/analysis' },
          ],
        },
      ],
      '/ai/': [
        {
          text: 'AI 资讯',
          items: [
            { text: '最新动态', link: '/ai/latest' },
            { text: '工具推荐', link: '/ai/tools' },
          ],
        },
      ],
      '/opc/': [
        {
          text: '超级个体',
          items: [
            { text: '最新动态', link: '/opc/latest' },
            { text: '一人公司', link: '/opc/one-person' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/daily' },
      { icon: 'twitter', link: 'https://twitter.com/your-twitter' },
    ],

    // 页脚
    footer: {
      message: 'Powered by VitePress & Vercel',
      copyright: 'Copyright © 2025 IceHugh',
    },

    // 搜索配置
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: '搜索',
              buttonAriaLabel: '搜索',
              modalNoResults: '无相关结果',
              modalDisplayTitle: '显示标题',
              modalResetButtonTitle: '重置搜索',
              modalSubTitle: '搜索文档',
              modalFooter: '上下导航',
            },
          },
        },
      },
    },

    // 外观
    appearance: 'dark',
  },

  // 插件
  vite: {
    plugins: [vercelAnalytics()],
  },

  // 构建配置
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
})
