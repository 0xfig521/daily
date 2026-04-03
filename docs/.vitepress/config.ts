import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '0xfig | 前沿科技资讯',
  description: '0xfig 专注 Web3、AI 和超级个体领域的前沿资讯与深度洞察平台',
  lang: 'zh-CN',

  head: [
    // 基础 Meta
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'author', content: 'IceHugh' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'googlebot', content: 'index, follow' }],
    
    // Keywords
    ['meta', { name: 'keywords', content: '0xfig,Web3,AI,人工智能,超级个体,一人公司,区块链,DeFi,NFT,DAO,独立开发,数字游民,前沿科技,技术创新,Github Trending,OpenClaw' }],
    
    // Description
    ['meta', { name: 'description', content: '0xfig 专注 Web3、AI 和超级个体领域，分享前沿科技资讯、技术深度解读与个体价值探索，助您把握去中心化未来的无限可能' }],
    
    // Open Graph (Facebook/LinkedIn)
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '0xfig | 前沿科技资讯' }],
    ['meta', { property: 'og:description', content: '0xfig 专注 Web3、AI 和超级个体领域，分享前沿科技资讯与深度洞察' }],
    ['meta', { property: 'og:url', content: 'https://daily.0xfig.xyz/' }],
    ['meta', { property: 'og:site_name', content: '0xfig' }],
    ['meta', { property: 'og:image', content: 'https://daily.0xfig.xyz/logo.png' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: '0xfig | 前沿科技资讯' }],
    ['meta', { name: 'twitter:description', content: '0xfig 专注 Web3、AI 和超级个体领域，分享前沿科技资讯与深度洞察' }],
    ['meta', { name: 'twitter:image', content: 'https://daily.0xfig.xyz/logo.png' }],
    ['meta', { name: 'twitter:site', content: '@icehugh' }],
    
    // Canonical URL
    ['link', { rel: 'canonical', href: 'https://daily.0xfig.xyz/' }],
    
    // Favicon
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.svg' }],
    
    // 主题色
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    
    // 验证 (可添加 Google Search Console 等)
    // ['meta', { name: 'google-site-verification', content: 'YOUR_VERIFICATION_CODE' }],
  ],

  themeConfig: {
    title: '0xfig',
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: 'Web3', link: '/web3/' },
      { text: 'AI', link: '/ai/' },
      { text: 'OPC', link: '/opc/' },
      { text: 'Claw', link: '/claw/' },
      { text: 'GitHub Trending', link: '/github-trending/' },
    ],

    sidebar: {
      '/web3/': [{ text: 'Web3 资讯', items: [{ text: '最新动态', link: '/web3/' }] }],
      '/ai/': [{ text: 'AI 资讯', items: [{ text: '最新动态', link: '/ai/' }] }],
      '/opc/': [{ text: '超级个体', items: [{ text: '最新动态', link: '/opc/' }] }],
      '/claw/': [{ text: 'Claw 资讯', items: [{ text: '最新动态', link: '/claw/' }] }],
      '/github-trending/': [{ text: 'GitHub Trending', items: [{ text: '最新动态', link: '/github-trending/' }] }],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/IceHugh/daily' },
    ],

    footer: {
      message: 'Powered by VitePress & OpenClaw',
      copyright: 'Copyright © 2026 IceHugh. All rights reserved.',
    },

    search: {
      provider: 'local',
    },
    
    // 完整链接
    cleanUrls: true,
  },

  vite: {
    ssr: {
      noExternal: ['@theojs/lumen']
    }
  },

  lastUpdated: true,
  markdown: {
    lineNumbers: false,
  },
})
