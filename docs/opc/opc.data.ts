import { createContentLoader } from 'vitepress'

export default createContentLoader('opc/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(raw) {
    return raw
      .filter(page => page.url !== '/opc/')
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
      .map(page => ({
        title: page.frontmatter.title,
        url: page.url,
        date: page.frontmatter.date,
      }))
  },
})
