---
title: Web3 资讯
description: 区块链、DeFi、NFT、DAO 等前沿动态
outline: 2
---

<script setup>
import { Links, Underline, BoxCube } from '@theojs/lumen'
</script>

# Web3 资讯

<Underline color="brand" />

区块链、DeFi、NFT、DAO 等前沿动态，把握去中心化世界的脉搏。

## 📌 核心资源

<Links
  :grid="3"
  :items="[
    {
      icon: { icon: 'logos:ethereum', color: '#627EEA' },
      name: '以太坊',
      desc: '去中心化的应用平台和智能合约区块链',
      link: 'https://ethereum.org/',
      linkText: '访问'
    },
    {
      icon: { icon: 'cryptologos:btc', color: '#F7931A' },
      name: '比特币',
      desc: '第一个去中心化的数字货币',
      link: 'https://bitcoin.org/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:solana', color: '#000' },
      name: 'Solana',
      desc: '高性能区块链网络',
      link: 'https://solana.com/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:polygon', color: '#8247E5' },
      name: 'Polygon',
      desc: '以太坊 Layer2 扩展方案',
      link: 'https://polygon.technology/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:uniswap', color: '#FF007A' },
      name: 'Uniswap',
      desc: '去中心化交易所协议',
      link: 'https://uniswap.org/',
      linkText: '访问'
    },
    {
      icon: { icon: 'logos:opensea', color: '#2081E2' },
      name: 'OpenSea',
      desc: 'NFT 数字资产交易市场',
      link: 'https://opensea.io/',
      linkText: '访问'
    }
  ]"
/>

## 🔥 热门话题

<BoxCube
  :items="[
    { icon: '🌐', title: 'DeFi', desc: '去中心化金融协议' },
    { icon: '🖼️', title: 'NFT', desc: '非同质化代币' },
    { icon: '🏛️', title: 'DAO', desc: '去中心化自治组织' },
    { icon: '⛓️', title: 'Layer2', desc: '扩展解决方案' },
    { icon: '🎮', title: 'GameFi', desc: '游戏化金融' },
    { icon: '🌉', title: '跨链', desc: '多链互操作性' }
  ]"
/>

## 📈 最新动态

- [2026-04-03 资讯](./2026-04-03-daily.md)

> 💡 提示：在 `/docs/web3/` 目录下创建新的 Markdown 文件来添加资讯
