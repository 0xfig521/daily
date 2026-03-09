import DefaultTheme from 'vitepress/theme-without-components'
import type { Theme } from 'vitepress'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 在这里可以注册全局组件、指令等
  },
} satisfies Theme
