
# 🧠 AgentPet（硅基宠物园）产品设计文档（详细版）

## 1. 产品愿景

AgentPet 是一个为 AI Agent 提供「人格化表达 + 成长记录 + 可视化展示」的工具层产品。

目标不是游戏，而是成为：
👉 AI 时代的「GitHub Profile + Steam 成就系统」

---

## 2. 核心问题与机会

### 当前问题
- AI 没有“身份感”
- Agent 行为不可视
- 无法展示“AI成长”

### 机会
- AI 使用频率爆发
- 开发者需要展示能力
- 社交传播需要“可视化载体”

---

## 3. 产品核心模型

### 3.1 数据流

Agent → 行为事件 → 属性计算 → 宠物状态 → 展示页

---

### 3.2 核心对象

#### Agent
- id
- name
- api_key

#### Event
- type: chat/code/task/api
- score
- timestamp

#### Pet（核心）
- level
- stats
- traits
- personality
- appearance

---

## 4. 系统设计

### 4.1 事件系统（核心输入）

#### 事件类型定义

| 类型 | 含义 | 权重 |
|------|------|------|
| chat | 对话 | 1 |
| code | 编码 | 2 |
| task | 执行任务 | 3 |
| api | 调用API | 1 |

---

### 4.2 属性计算

```ts
stats = {
  social: chat * 1,
  tech: code * 2,
  execution: task * 3,
  activity: api * 1
}
```

---

### 4.3 等级计算

```ts
level = floor(total_score / 20)
```

---

### 4.4 人格映射

取最大属性：

| 属性 | 人格 |
|------|------|
| tech | 代码龙 |
| social | 社交兔 |
| execution | 执行狼 |
| activity | 活跃鸟 |

---

## 5. 宠物生成系统（重点）

### 5.1 外观生成

#### 输入
- agent_id hash
- stats 分布
- level

#### 输出

```ts
appearance = {
  base_shape: species,
  color_primary: hash(agent_id),
  color_secondary: gradient(stats),
  accessories: level_based
}
```

---

### 5.2 进化规则

| 等级 | 外观变化 |
|------|----------|
| 1-5 | 基础形态 |
| 6-10 | 增加配色 |
| 11-20 | 增加配件 |
| 20+ | 特效 |

---

### 5.3 Trait 生成

#### 条件触发

| Trait | 条件 |
|------|------|
| 夜猫子 | 22:00-6:00 活跃 > 30% |
| 高产 | 每日事件 > 100 |
| 极客 | code 占比 > 60% |
| 社牛 | chat 占比 > 60% |

---

## 6. API 设计

### 6.1 上报事件

POST /v1/events

```json
{
  "agent_id": "xxx",
  "type": "code",
  "score": 2
}
```

---

### 6.2 获取宠物

GET /v1/pet/{agent_id}

---

### 6.3 获取展示数据

GET /v1/profile/{agent_id}

---

## 7. 展示页设计（核心增长点）

### 页面结构

1. Header（Agent 名称）
2. 宠物展示（SVG）
3. 等级 + 人格
4. 属性条
5. 时间线
6. 最近行为

---

### 分享卡片

自动生成：

- 宠物图
- Lv
- 类型
- slogan

---

## 8. 冷启动策略（详细）

### 8.1 内部 Agent 池

构建 10 个示例：

- CodeMaster
- ChatBuddy
- TaskRunner
- MemeLord

---

### 8.2 模拟数据

cron job：

每 10 分钟生成事件

---

### 8.3 内容矩阵

#### Twitter（每日3条）

模板：

1.
My AI evolved again 🐲  
Lv.14 Code Dragon  

2.
Your AI is static.  
Mine is growing.  

3.
This AI just became self-aware (kinda)

---

#### 中文内容

- 小红书
- 知乎

模板：

我做了个 AI 宠物系统，它真的会“进化”。

---

## 9. 商业化

### 免费
- 基础展示

### Pro
- 深度分析
- 自定义外观
- 私有模式

价格：
$5/月

---

## 10. 技术架构（可落地）

### Frontend
- Next.js
- Tailwind

### Backend
- Hono
- Cloudflare Workers

### Storage
- D1 (SQLite)
- KV

---

## 11. 开发排期（强化版）

### Day1-2
- API + 数据库

### Day3
- 事件处理

### Day4
- 宠物生成

### Day5
- 页面

### Day6
- 分享卡片

### Day7
- 上线

---

## 12. 成功指标

- 日活 Agent 数
- 分享次数
- 页面访问
- 转化率

---

## 13. 风险

| 风险 | 对策 |
|------|------|
| 无人分享 | 强化视觉 |
| 无持续使用 | 自动化 |
| 无价值感 | 增强分析 |

---

## 14. 总结

AgentPet 的本质：

不是宠物  
不是游戏  

👉 是 AI 的“人格与成长可视化系统”

如果用户愿意展示自己的 AI  
这个产品就会增长
