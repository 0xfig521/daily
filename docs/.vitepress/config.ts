import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '0xfig | 前沿科技资讯',
  description: '0xfig - 专注 Web3、AI 和超级个体领域的前沿资讯与深度洞察平台',
  lang: 'zh-CN',

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'author', content: 'IceHugh' }],
    ['meta', { name: 'keywords', content: '0xfig,Web3,AI，人工智能，超级个体，一人公司，区块链，DeFi,NFT,DAO，独立开发，数字游民，前沿科技，技术创新' }],
    ['meta', { name: 'description', content: '0xfig 专注 Web3、AI 和超级个体领域，分享前沿科技资讯、技术深度解读与个体价值探索，助您把握去中心化未来的无限可能' }],
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.svg' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Web3', link: '/web3/' },
      { text: 'AI', link: '/ai/' },
      { text: 'OPC', link: '/opc/' },
      { text: 'Claw', link: '/claw/' },
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
      '/claw/': [
        {
          text: 'Claw 资讯',
          items: [
            { text: '最新动态', link: '/claw/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/IceHugh/daily' },
    ],

    footer: {
      message: 'Powered by VitePress & Lumen',
      copyright: 'Copyright © 2026 IceHugh',
    },

    search: {
      provider: 'local',
    },
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
