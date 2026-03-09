import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '每日资讯',
  description: '分享 Web3、AI 和超级个体相关的前沿资讯',
  lang: 'zh-CN',

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'author', content: 'IceHugh' }],
    ['meta', { name: 'keywords', content: 'Web3,AI,超级个体，一人公司，区块链，人工智能，创业者' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Web3', link: '/web3/' },
      { text: 'AI', link: '/ai/' },
      { text: 'OPC', link: '/opc/' },
    ],

    sidebar: {
      '/web3/': [
        {
          text: 'Web3 资讯',
          items: [
            { text: '最新动态', link: '/web3/' },
          ],
        },
      ],
      '/ai/': [
        {
          text: 'AI 资讯',
          items: [
            { text: '最新动态', link: '/ai/' },
          ],
        },
      ],
      '/opc/': [
        {
          text: '超级个体',
          items: [
            { text: '最新动态', link: '/opc/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/IceHugh/daily' },
    ],

    footer: {
      message: 'Powered by VitePress & Lumen',
      copyright: 'Copyright © 2025 IceHugh',
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: '搜索',
              buttonAriaLabel: '搜索',
              modalNoResults: '无相关结果',
              modalDisplayTitle: '搜索文档',
            },
          },
        },
      },
    },

    appearance: 'dark',
  },

  vite: {
    ssr: {
      noExternal: ['@theojs/lumen']
    }
  },

  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
})
