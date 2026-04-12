
# AgentPet 补充设计：数据库结构与 SVG 宠物生成器

## 一、数据库设计（Cloudflare D1 / SQLite）

目标：

- 结构尽量少，但支持 MVP 到早期增长
- 支持 Agent 注册、事件上报、宠物快照、展示页、分享页
- 尽量避免过度范式化，优先独立开发者易维护

---

## 1. 表结构总览

建议先使用 5 张核心表：

1. `agents`：Agent 基础信息
2. `agent_events`：行为事件表
3. `pet_profiles`：宠物当前状态快照
4. `pet_timelines`：成长时间线
5. `share_cards`：分享记录

---

## 2. agents

用于存储 Agent 基础身份信息与接入配置。

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,                 -- agent_xxx
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,          -- 用于 profile url
  description TEXT DEFAULT '',
  api_key_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  personality_seed TEXT DEFAULT '',   -- 初始人格输入，可选
  is_public INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- active / disabled
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_status ON agents(status);
```

### 字段说明

| 字段 | 说明 |
|------|------|
| id | Agent 唯一 ID |
| name | Agent 名称 |
| slug | 展示页短链接 |
| api_key_hash | API Key 哈希，不存明文 |
| personality_seed | 初始人格描述，例如 `analytical, calm` |
| is_public | 是否公开展示 |
| status | 当前状态 |

---

## 3. agent_events

行为事件是整套系统的核心输入。

```sql
CREATE TABLE agent_events (
  id TEXT PRIMARY KEY,                 -- evt_xxx
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL,            -- chat / code / task / api
  score INTEGER NOT NULL DEFAULT 1,
  meta_json TEXT NOT NULL DEFAULT '{}',
  happened_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_agent_events_agent_time
ON agent_events(agent_id, happened_at DESC);

CREATE INDEX idx_agent_events_type
ON agent_events(event_type);
```

### 事件规范建议

`event_type` 建议第一版只保留：

- `chat`
- `code`
- `task`
- `api`

`meta_json` 可选内容：

```json
{
  "source": "openai",
  "success": true,
  "duration_ms": 920,
  "tokens": 1820
}
```

这样后续可以扩展：

- 成功率
- 活跃时段
- 响应速度
- 模型来源

---

## 4. pet_profiles

存储“当前宠物状态”，避免每次展示页实时全量计算。

```sql
CREATE TABLE pet_profiles (
  id TEXT PRIMARY KEY,                 -- pet_xxx
  agent_id TEXT NOT NULL UNIQUE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,               -- dragon / rabbit / wolf / bird
  personality_type TEXT NOT NULL,      -- tech / social / execution / activity
  level INTEGER NOT NULL DEFAULT 1,
  evolution_stage INTEGER NOT NULL DEFAULT 1,
  total_score INTEGER NOT NULL DEFAULT 0,
  social_score INTEGER NOT NULL DEFAULT 0,
  tech_score INTEGER NOT NULL DEFAULT 0,
  execution_score INTEGER NOT NULL DEFAULT 0,
  activity_score INTEGER NOT NULL DEFAULT 0,
  traits_json TEXT NOT NULL DEFAULT '[]',
  appearance_json TEXT NOT NULL DEFAULT '{}',
  stats_json TEXT NOT NULL DEFAULT '{}',
  last_event_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_pet_profiles_level ON pet_profiles(level DESC);
CREATE INDEX idx_pet_profiles_personality ON pet_profiles(personality_type);
```

### appearance_json 示例

```json
{
  "baseColor": "#6C8CFF",
  "secondaryColor": "#A9BCFF",
  "eyeStyle": "round",
  "pattern": "circuit",
  "accessory": "glasses",
  "effect": "none"
}
```

### traits_json 示例

```json
["night_owl", "geek", "high_output"]
```

---

## 5. pet_timelines

记录关键成长事件，用于展示“成长历史”。

```sql
CREATE TABLE pet_timelines (
  id TEXT PRIMARY KEY,                 -- tl_xxx
  agent_id TEXT NOT NULL,
  pet_id TEXT NOT NULL,
  event_kind TEXT NOT NULL,            -- level_up / evolved / trait_unlocked
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  happened_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (pet_id) REFERENCES pet_profiles(id)
);

CREATE INDEX idx_pet_timelines_agent_time
ON pet_timelines(agent_id, happened_at DESC);
```

### 示例

- `level_up`
- `evolved`
- `trait_unlocked`
- `milestone`

---

## 6. share_cards

如果后续要做分享追踪、A/B 测试，可以保留。

```sql
CREATE TABLE share_cards (
  id TEXT PRIMARY KEY,                 -- share_xxx
  agent_id TEXT NOT NULL,
  pet_id TEXT NOT NULL,
  card_type TEXT NOT NULL,             -- og / social / badge
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  share_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (pet_id) REFERENCES pet_profiles(id)
);

CREATE INDEX idx_share_cards_agent ON share_cards(agent_id, created_at DESC);
```

---

## 7. MVP 可选精简版

如果你想再省一点，MVP 只保留 3 张表也行：

- `agents`
- `agent_events`
- `pet_profiles`

其中：

- 时间线通过 `agent_events` 聚合生成
- 分享记录不入库

这样能最快上线。

---

## 8. 推荐 SQL 初始化（完整版）

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  api_key_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  personality_seed TEXT DEFAULT '',
  is_public INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_status ON agents(status);

CREATE TABLE agent_events (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 1,
  meta_json TEXT NOT NULL DEFAULT '{}',
  happened_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_agent_events_agent_time
ON agent_events(agent_id, happened_at DESC);

CREATE INDEX idx_agent_events_type
ON agent_events(event_type);

CREATE TABLE pet_profiles (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  personality_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  evolution_stage INTEGER NOT NULL DEFAULT 1,
  total_score INTEGER NOT NULL DEFAULT 0,
  social_score INTEGER NOT NULL DEFAULT 0,
  tech_score INTEGER NOT NULL DEFAULT 0,
  execution_score INTEGER NOT NULL DEFAULT 0,
  activity_score INTEGER NOT NULL DEFAULT 0,
  traits_json TEXT NOT NULL DEFAULT '[]',
  appearance_json TEXT NOT NULL DEFAULT '{}',
  stats_json TEXT NOT NULL DEFAULT '{}',
  last_event_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_pet_profiles_level ON pet_profiles(level DESC);
CREATE INDEX idx_pet_profiles_personality ON pet_profiles(personality_type);

CREATE TABLE pet_timelines (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  pet_id TEXT NOT NULL,
  event_kind TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  happened_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (pet_id) REFERENCES pet_profiles(id)
);

CREATE INDEX idx_pet_timelines_agent_time
ON pet_timelines(agent_id, happened_at DESC);

CREATE TABLE share_cards (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  pet_id TEXT NOT NULL,
  card_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  share_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (pet_id) REFERENCES pet_profiles(id)
);

CREATE INDEX idx_share_cards_agent ON share_cards(agent_id, created_at DESC);
```

---

## 9. 数据更新策略

推荐采用：

### 写入流程

1. Agent 上报 `agent_events`
2. Worker / API 内同步更新 `pet_profiles`
3. 如果发生升级、进化、Trait 解锁，则插入 `pet_timelines`

### 为什么这样做

因为展示页是高频读、低频写：

- 实时聚合所有事件会浪费性能
- 独立开发者更适合“写时更新快照”

---

## 10. 宠物状态计算规则

建议统一使用以下权重：

```ts
const EVENT_WEIGHTS = {
  chat: { social: 1, tech: 0, execution: 0, activity: 1 },
  code: { social: 0, tech: 2, execution: 1, activity: 1 },
  task: { social: 0, tech: 1, execution: 3, activity: 1 },
  api:  { social: 0, tech: 0, execution: 0, activity: 1 },
}
```

### 总分

```ts
totalScore = social + tech + execution + activity
```

### 等级

```ts
level = Math.max(1, Math.floor(totalScore / 20) + 1)
```

### 主人格

取四维得分最高值：

- `tech` → `dragon`
- `social` → `rabbit`
- `execution` → `wolf`
- `activity` → `bird`

### 进化阶段

```ts
if (level >= 21) evolutionStage = 4
else if (level >= 11) evolutionStage = 3
else if (level >= 6) evolutionStage = 2
else evolutionStage = 1
```

---

# 二、SVG 宠物生成器设计

目标：

- 不依赖图片素材
- 纯 SVG 动态生成
- 同一个 Agent 稳定生成一致风格
- 后续能平滑扩展为组件化皮肤系统

---

## 1. 生成器思路

采用：

> **“物种骨架 + 风格参数 + 状态配饰”的组合式 SVG 生成方案**

组成分为 6 层：

1. Base Shape（基础身体）
2. Ears / Horns（耳朵或角）
3. Eyes（眼睛）
4. Pattern（纹理）
5. Accessory（配饰）
6. Effect（进化特效）

---

## 2. 物种与人格映射

| 人格 | 物种 | 视觉方向 |
|------|------|----------|
| tech | dragon | 有角、偏机械、线路纹理 |
| social | rabbit | 耳朵长、表情友好 |
| execution | wolf | 轮廓更锐利、偏速度感 |
| activity | bird | 更轻、更活跃、羽毛感 |

---

## 3. 外观参数结构

建议统一为：

```ts
type PetAppearance = {
  species: "dragon" | "rabbit" | "wolf" | "bird"
  baseColor: string
  secondaryColor: string
  eyeStyle: "round" | "sharp" | "sleepy" | "spark"
  pattern: "none" | "circuit" | "spots" | "stripes" | "grid"
  accessory: "none" | "glasses" | "scarf" | "crown" | "headband"
  effect: "none" | "glow" | "sparkles"
  evolutionStage: 1 | 2 | 3 | 4
}
```

---

## 4. 参数生成规则

### 4.1 baseColor

使用 `agent_id` 哈希后取色相，保证同 Agent 稳定：

```ts
function hashToHue(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 360
  }
  return hash
}
```

```ts
baseColor = `hsl(${hue}, 70%, 60%)`
secondaryColor = `hsl(${hue}, 75%, 78%)`
```

---

### 4.2 eyeStyle

由人格决定：

- `dragon` → `sharp`
- `rabbit` → `round`
- `wolf` → `spark`
- `bird` → `sleepy`

也可以加一点随机偏移。

---

### 4.3 pattern

由高分属性占比决定：

| 条件 | pattern |
|------|---------|
| tech / total > 0.45 | circuit |
| social / total > 0.45 | spots |
| execution / total > 0.45 | stripes |
| activity / total > 0.45 | grid |
| 否则 | none |

---

### 4.4 accessory

按等级发放：

| 等级 | accessory |
|------|-----------|
| 1-5 | none |
| 6-10 | headband |
| 11-20 | glasses / scarf |
| 21+ | crown |

---

### 4.5 effect

按进化阶段：

| stage | effect |
|------|--------|
| 1 | none |
| 2 | none |
| 3 | glow |
| 4 | sparkles |

---

## 5. SVG 结构设计

统一使用 `viewBox="0 0 200 200"`，方便前端缩放。

### 层级结构建议

```xml
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>...</defs>

  <!-- effect -->
  <!-- ears/horns -->
  <!-- body -->
  <!-- pattern -->
  <!-- eyes -->
  <!-- accessory -->
</svg>
```

---

## 6. 各物种基础骨架建议

### 6.1 Dragon（代码龙）

特点：

- 圆身体
- 两个角
- 小翅膀
- 线路感纹理

适合 tech 人格。

### 6.2 Rabbit（社交兔）

特点：

- 长耳朵
- 圆眼睛
- 微笑嘴型
- 整体更软萌

适合 social 人格。

### 6.3 Wolf（执行狼）

特点：

- 尖耳
- 更锐的眼神
- 尾巴上扬
- 整体更有速度感

适合 execution 人格。

### 6.4 Bird（活跃鸟）

特点：

- 小翅膀
- 圆头
- 轻快感
- 更跳跃的线条

适合 activity 人格。

---

## 7. 推荐实现方式

建议代码层拆成：

```ts
renderPetSVG(appearance)
  -> renderBaseBody(species, colors)
  -> renderSpeciesFeature(species)
  -> renderPattern(pattern)
  -> renderEyes(eyeStyle)
  -> renderAccessory(accessory)
  -> renderEffect(effect)
```

这样后面换皮肤不会痛苦。

---

## 8. TypeScript 生成器示例

下面给你一份适合直接做成 util 的最小版本。

```ts
type Species = "dragon" | "rabbit" | "wolf" | "bird"
type EyeStyle = "round" | "sharp" | "sleepy" | "spark"
type Pattern = "none" | "circuit" | "spots" | "stripes" | "grid"
type Accessory = "none" | "glasses" | "scarf" | "crown" | "headband"
type Effect = "none" | "glow" | "sparkles"

export type PetAppearance = {
  species: Species
  baseColor: string
  secondaryColor: string
  eyeStyle: EyeStyle
  pattern: Pattern
  accessory: Accessory
  effect: Effect
  evolutionStage: 1 | 2 | 3 | 4
}

function renderEyes(style: EyeStyle) {
  switch (style) {
    case "round":
      return `
        <circle cx="80" cy="92" r="6" fill="#1F2937" />
        <circle cx="120" cy="92" r="6" fill="#1F2937" />
      `
    case "sharp":
      return `
        <path d="M72 92 Q80 84 88 92" stroke="#1F2937" stroke-width="4" fill="none" />
        <path d="M112 92 Q120 84 128 92" stroke="#1F2937" stroke-width="4" fill="none" />
      `
    case "sleepy":
      return `
        <path d="M72 92 Q80 96 88 92" stroke="#1F2937" stroke-width="4" fill="none" />
        <path d="M112 92 Q120 96 128 92" stroke="#1F2937" stroke-width="4" fill="none" />
      `
    case "spark":
      return `
        <circle cx="80" cy="92" r="5" fill="#1F2937" />
        <circle cx="120" cy="92" r="5" fill="#1F2937" />
        <circle cx="82" cy="90" r="2" fill="white" />
        <circle cx="122" cy="90" r="2" fill="white" />
      `
  }
}

function renderPattern(pattern: Pattern, color: string) {
  switch (pattern) {
    case "circuit":
      return `
        <path d="M70 110 H95 V125 H130" stroke="${color}" stroke-width="3" fill="none" opacity="0.45" />
        <circle cx="95" cy="110" r="3" fill="${color}" opacity="0.45" />
        <circle cx="130" cy="125" r="3" fill="${color}" opacity="0.45" />
      `
    case "spots":
      return `
        <circle cx="78" cy="118" r="6" fill="${color}" opacity="0.28" />
        <circle cx="110" cy="128" r="5" fill="${color}" opacity="0.28" />
        <circle cx="126" cy="112" r="4" fill="${color}" opacity="0.28" />
      `
    case "stripes":
      return `
        <path d="M78 106 L72 138" stroke="${color}" stroke-width="4" opacity="0.28" />
        <path d="M100 104 L94 140" stroke="${color}" stroke-width="4" opacity="0.28" />
        <path d="M122 106 L116 138" stroke="${color}" stroke-width="4" opacity="0.28" />
      `
    case "grid":
      return `
        <path d="M72 112 H128 M72 126 H128 M84 104 V136 M100 104 V136 M116 104 V136"
          stroke="${color}" stroke-width="2" opacity="0.2" />
      `
    default:
      return ""
  }
}

function renderAccessory(accessory: Accessory) {
  switch (accessory) {
    case "glasses":
      return `
        <rect x="68" y="84" width="22" height="16" rx="4" fill="none" stroke="#374151" stroke-width="3" />
        <rect x="110" y="84" width="22" height="16" rx="4" fill="none" stroke="#374151" stroke-width="3" />
        <path d="M90 92 H110" stroke="#374151" stroke-width="3" />
      `
    case "scarf":
      return `
        <path d="M70 138 Q100 150 130 138" fill="none" stroke="#EF4444" stroke-width="8" />
        <path d="M122 138 L128 158" stroke="#EF4444" stroke-width="8" />
      `
    case "crown":
      return `
        <path d="M62 54 L74 40 L92 56 L108 38 L126 56 L138 42 L146 54"
          fill="#FBBF24" stroke="#D97706" stroke-width="3" />
      `
    case "headband":
      return `
        <path d="M62 74 Q100 60 138 74" fill="none" stroke="#8B5CF6" stroke-width="7" />
      `
    default:
      return ""
  }
}

function renderEffect(effect: Effect) {
  switch (effect) {
    case "glow":
      return `
        <circle cx="100" cy="100" r="72" fill="url(#glow)" opacity="0.35" />
      `
    case "sparkles":
      return `
        <circle cx="52" cy="58" r="3" fill="#FDE68A" />
        <circle cx="148" cy="62" r="3" fill="#FDE68A" />
        <circle cx="42" cy="110" r="2" fill="#FDE68A" />
        <circle cx="156" cy="118" r="2" fill="#FDE68A" />
      `
    default:
      return ""
  }
}

function renderSpeciesFeature(species: Species, baseColor: string, secondaryColor: string) {
  switch (species) {
    case "dragon":
      return `
        <path d="M74 56 L62 28 L82 48" fill="${secondaryColor}" />
        <path d="M126 56 L138 28 L118 48" fill="${secondaryColor}" />
        <path d="M58 106 L42 96 L56 124" fill="${secondaryColor}" opacity="0.9" />
        <path d="M142 106 L158 96 L144 124" fill="${secondaryColor}" opacity="0.9" />
      `
    case "rabbit":
      return `
        <ellipse cx="76" cy="42" rx="10" ry="30" fill="${secondaryColor}" />
        <ellipse cx="124" cy="42" rx="10" ry="30" fill="${secondaryColor}" />
      `
    case "wolf":
      return `
        <path d="M72 58 L58 36 L80 48" fill="${secondaryColor}" />
        <path d="M128 58 L142 36 L120 48" fill="${secondaryColor}" />
        <path d="M146 132 Q164 126 158 148" fill="none" stroke="${secondaryColor}" stroke-width="6" />
      `
    case "bird":
      return `
        <path d="M58 110 Q40 100 52 126" fill="${secondaryColor}" />
        <path d="M142 110 Q160 100 148 126" fill="${secondaryColor}" />
        <path d="M100 102 L112 108 L100 114" fill="#F59E0B" />
      `
  }
}

export function renderPetSVG(appearance: PetAppearance) {
  const { species, baseColor, secondaryColor, eyeStyle, pattern, accessory, effect } = appearance

  return `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent pet">
    <defs>
      <radialGradient id="glow">
        <stop offset="0%" stop-color="${secondaryColor}" />
        <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0" />
      </radialGradient>
    </defs>

    ${renderEffect(effect)}

    ${renderSpeciesFeature(species, baseColor, secondaryColor)}

    <ellipse cx="100" cy="112" rx="48" ry="42" fill="${baseColor}" />
    <ellipse cx="100" cy="124" rx="30" ry="18" fill="${secondaryColor}" opacity="0.22" />

    ${renderPattern(pattern, secondaryColor)}
    ${renderEyes(eyeStyle)}

    <path d="M88 114 Q100 122 112 114" stroke="#374151" stroke-width="3" fill="none" />
    ${renderAccessory(accessory)}
  </svg>
  `
}
```

---

## 9. appearance 生成函数示例

```ts
type PetScores = {
  social: number
  tech: number
  execution: number
  activity: number
}

function hashToHue(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 360
  }
  return Math.abs(hash)
}

export function buildAppearance(
  agentId: string,
  personalityType: "tech" | "social" | "execution" | "activity",
  level: number,
  scores: PetScores
): PetAppearance {
  const hue = hashToHue(agentId)
  const total = Math.max(1, scores.social + scores.tech + scores.execution + scores.activity)

  const speciesMap = {
    tech: "dragon",
    social: "rabbit",
    execution: "wolf",
    activity: "bird",
  } as const

  let pattern: Pattern = "none"
  if (scores.tech / total > 0.45) pattern = "circuit"
  else if (scores.social / total > 0.45) pattern = "spots"
  else if (scores.execution / total > 0.45) pattern = "stripes"
  else if (scores.activity / total > 0.45) pattern = "grid"

  let accessory: Accessory = "none"
  if (level >= 21) accessory = "crown"
  else if (level >= 11) accessory = hue % 2 === 0 ? "glasses" : "scarf"
  else if (level >= 6) accessory = "headband"

  let effect: Effect = "none"
  if (level >= 21) effect = "sparkles"
  else if (level >= 11) effect = "glow"

  const eyeStyleMap = {
    tech: "sharp",
    social: "round",
    execution: "spark",
    activity: "sleepy",
  } as const

  const evolutionStage =
    level >= 21 ? 4 :
    level >= 11 ? 3 :
    level >= 6 ? 2 : 1

  return {
    species: speciesMap[personalityType],
    baseColor: `hsl(${hue}, 70%, 60%)`,
    secondaryColor: `hsl(${hue}, 75%, 78%)`,
    eyeStyle: eyeStyleMap[personalityType],
    pattern,
    accessory,
    effect,
    evolutionStage,
  }
}
```

---

## 10. 推荐前端接入方式

### 方案 A：服务端生成 SVG 字符串

适合：

- Next.js Route Handler
- 生成分享卡片
- SEO / OG 图

### 方案 B：前端组件直接渲染 SVG

适合：

- 互动页
- 动画扩展
- Hover 状态

---

## 11. 推荐目录结构

```bash
src/
  server/
    db/
      schema.sql
    services/
      event-service.ts
      pet-service.ts
  lib/
    pet/
      build-appearance.ts
      render-pet-svg.ts
      pet-rules.ts
  app/
    api/
      v1/
        events/route.ts
        profile/[slug]/route.ts
    agent/
      [slug]/
        page.tsx
```

---

## 12. 独立开发者版本建议

你最省成本的落地组合是：

- D1 存核心数据
- KV 缓存 profile JSON
- SVG 不入库存文件，按需即时生成
- 分享图第一版可以直接复用 SVG + 文本，不需要复杂画布

### 第一版最推荐做法

- 数据库只保留 3 张表：`agents`、`agent_events`、`pet_profiles`
- Trait 先只做 4 个：`night_owl`、`geek`、`social_star`、`high_output`
- 物种先只做 4 种：龙 / 兔 / 狼 / 鸟
- 配饰先只做 4 种：none / headband / glasses / crown

这样最容易一周内做完。

---

## 13. 最终建议

数据库层：

- 不要一开始追求复杂分析模型
- 先保证“上报事件 -> 宠物变化 -> 页面展示”闭环通顺

SVG 层：

- 不要一开始追求插画级精度
- 先保证“稳定、可区分、可进化、可分享”

真正重要的是：

> 用户一眼能看出  
> **这是我的 AI，而且它和别人的不一样。**
