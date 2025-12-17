# 项目重构计划： "失物招领 Next"

## 1. 执行摘要 (Executive Summary)

**背景：** 当前项目（Legacy 版本）存在难以维护的"技术债"，样式混乱（混用 Element Plus 与 Tailwind），且前后端逻辑耦合严重。
**目标：** 从零开始，打造一个现代、优雅、轻量级的新版本（Next 版本）。
**核心理念：** "少即是多 (Less is More)"。统一使用 Vue/Nuxt 生态系统，配合 Bun 的极致性能，打造工业级的开发体验。

---

## 2. 核心业务与功能设计 (Core Features)

本项目不只是简单的增删改查 (CRUD)，而是围绕 **"高效寻回"** 与 **"信任构建"** 打造的闭环系统。

### 2.1 物品全生命周期管理

1. **快速发布 (One-Click Post)**
   - **极简模式：** 拍照 -> AI 自动填表（识别物品类别、颜色） -> 确认发布。用户只需 10 秒即可完成。
   - **隐私保护：** 发布者可选择隐藏具体联系方式，通过平台内置 IM 或虚拟中间号联系。
2. **智能匹配与推送 (Smart Match)**
   - 当有人发布"丢失"信息时，系统自动检索历史"拾取"记录。
   - **双向通知：** 一旦 AI 判定高相似度（图片特征+文本描述），同时向失主和拾主发送 "Found It!" 提醒。
3. **认领验证流程 (Claim & Verify)**
   - **提问验证：** 拾主可设置"验证问题"（如：捡到的校园卡尾号是多少？），系统自动比对答案，防止冒领。
   - **线下交接：** 双方确认识别后，生成一次性"交接码"，线下扫码完成状态流转。

### 2.2 信用与激励体系 (Credit System)

为了解决"好人没好报"和"恶意冒领"的问题，我们将引入动态信用分：

- **基础分：** 新用户注册即得 60 分。
- **加分项：** 成功归还物品 (+10)、获得对方五星评价 (+5)、协助鉴别虚假信息 (+2)。
- **减分项：** 冒领被举报 (-20)、发布虚假广告 (-50)。
- **权益：** 高分用户在首页获得 "金牌雷锋" 标识，且发布的寻物启事拥有更高搜索权重。

### 2.3 校园地图足迹 (Campus Footprint)

- 利用 Leaflet/Mapbox，在校园地图上热力显示"高频丢失点"（如：图书馆三楼饮水机旁、操场看台）。
- 提醒路过该区域的用户注意保管随身物品。

---

## 3. 技术栈选型 (Tech Stack)

### 3.0 运行环境与工具链：**Bun (v1.1+)**

- **核心定位：** 这是一个 All-in-One 的 JavaScript 运行时。它将替换 Node.js + npm + Jest/Vitest。
- **选择理由：**
  - **极速包管理：** `bun install` 的速度通常是 npm/pnpm 的 20-100 倍。对于依赖众多的全栈项目，这意味着"秒装"。
  - **原生 TypeScript：** 它是唯一可以直接运行 `.ts` 文件的运行时，在这个项目中，我们**不需要**任何转译配置即可运行脚本。
  - **内置测试：** `bun test` 兼容 Jest API 但速度极快，无需单独配置 Vitest。
  - **启动速度：** 结合 Nuxt 的热更新，实现毫秒级的开发响应。

### 3.1 核心框架：**Nuxt 4 (Bleeding Edge)**

- **选择理由：** 拥抱 Vue 生态的最前沿。利用 Vite 6+ 带来的极致性能提升，以及更现代化的目录结构。
- **关键特性：**
  - **全新目录结构：** 使用 Nuxt 4 推荐的更扁平化结构（或可选的 `app/` 目录），让代码组织更清晰。
  - **Turbo Performance：** 更快的冷启动速度和热更新 (HMR)。
- **收益：** 获得全栈 TypeScript 类型支持 + 顶级的开发体验。

### 3.2 样式与 UI：**UnoCSS + Una UI**

- **CSS 引擎：** **UnoCSS**。
  - **性能：** 比 Tailwind CSS 更快、更轻量。
  - **Attributify 模式：** 允许直接写 `<div text-red-500>` 这样的属性，让模板代码极其整洁。
- **组件库：** **Una UI** (`@una-ui/nuxt`)。
  - *注：我们将在初始化阶段验证其与 Nuxt 4 的兼容性。*
  - **特点：** 专为 Nuxt/UnoCSS 设计，轻量且高度可定制。
  - **去臃肿化：** 彻底抛弃由 Element Plus 带来的打包体积膨胀。我们将基于 Una UI 封装自己的语义化组件（如 Card, Dialog）。

### 3.3 数据库：**SQLite (by Better-SQLite3) + Drizzle ORM**

- **数据库：** **SQLite**。
  - **配置：** 零配置。无需 Docker，无需在本地装 MySQL/PostgreSQL。所有数据就在一个 `db.sqlite` 文件里。
  - **数据完整性：** WAL 模式开启后，并发性能对于校园级应用完全过剩。
- **ORM：** **Drizzle ORM**。
  - **特点：** TypeScript 优先。相比 Prisma 或 SQLAlchemy 更轻量，生成的 SQL 更可控。
  - **driver：** 使用 `bun:sqlite` (Bun 原生驱动) 或 `better-sqlite3`，性能极致。

### 3.4 AI 与智能特性：**Transformers.js + CLIP**

我们摒弃传统的“分类打标”模式，采用更先进的 **"向量化语义搜索"** 方案。

- **视觉/多模态模型 (Vision/Multimodal)：**
  
  - **核心库：** **Transformers.js** (Hugging Face 官方 JavaScript 库)。这是目前 JS 领域运行 AI 模型的**事实标准**，生态极其丰富且主流。
  - **模型：** **CLIP** (Quantized 量化版, `Xenova/clip-vit-base-patch32`, 约 60MB)。
  - **实现逻辑：**
    1. **Embedding (向量化)：** 无论是用户上传的图片，还是用户搜索的文字（如"黑色皮夹"），都通过 CLIP 模型转换为 512 维的数学向量。
    2. **Vector Search (向量匹配)：** 计算向量之间的**余弦相似度**。
  - **优势：**
    - **以图搜图：** 彻底解决"描述不准"的问题。
    - **语义搜索：** 用户搜"用来喝水的东西"，AI 能从图片中找到"水杯"，通过理解概念而非简单的关键词匹配。
    - **轻量级：** 模型仅 60MB，在 Bun 中冷启动只需数秒，无需独立显卡即可流畅推理。

- **文本匹配 (Text Matching)：**
  
  - 辅助逻辑：对于非搜索场景的纯文本比对，继续利用 Bun 原生的高性能字符串算法（Levenshtein 距离）作为兜底策略。

---

## 4. 架构概览 (Architecture)

```
/
├── .github/                    # CI/CD (GitHub Actions)
├── server/                     # 服务端逻辑 (Nitro)
│   ├── api/                    # API 路由 (文件即接口)
│   │   ├── auth/               # 登录/注册
│   │   ├── posts/              # 物品增删改查
│   │   └── ai/                 # AI 推理接口
│   ├── db/                     # Drizzle Schema 定义与配置
│   └── utils/                  # 服务端工具函数 (AI 逻辑放这里)
├── app/                        # (Nuxt 4) 核心应用逻辑
│   ├── components/             # 自动导入的 Vue 组件 (Atomic Design)
│   │   ├── ui/                 # 基础 UI (Una UI)
│   │   └── feature/            # 业务组件
│   ├── pages/                  # 基于文件的路由
│   ├── layouts/                # 布局文件
│   └── app.vue                 # 根组件
├── public/                     # 静态资源 (ONNX 模型文件, Uploads)
├── tests/                      # 测试文件 (bun test)
├── bun.lockb                   # Bun 的二进制锁定文件
├── unocss.config.ts            # 设计系统 Token
└── nuxt.config.ts              # 核心配置
```

---

## 5. 开发路线图 (Roadmap)

### 第一阶段：环境与地基 (Day 1-2)

1. **环境准备:** 
   - `curl -fsSL https://bun.sh/install | bash`
   - `bun create nuxt lost-and-found-next`
2. **依赖安装:**
   - `bun add -d unocss @una-ui/nuxt @iconify-json/ph`
   - `bun add drizzle-orm better-sqlite3`
   - `bun add -d drizzle-kit`
3. **数据库设计:**
   - 编写 `server/db/schema.ts`。
   - 运行 `bunx drizzle-kit push:sqlite` 初始化数据库。
4. **认证模块:**
   - 集成 `nuxt-auth-utils`。

### 第二阶段：核心业务 (Day 3-5)

1. **API 开发:**
   - 使用 Nuxt Server Handler 编写 REST 接口。
   - 使用 `bun:sqlite` 进行极速数据库查询。
2. **前端页面:**
   - 落地 Una UI，实现 Dashboard 和 发布页。
   - 充分利用 `<script setup lang="ts">`。
3. **图片上传:**
   - 编写 `server/api/upload.post.ts`，利用 Bun 的 `file()` API 高效处理文件流。

### 第三阶段：AI 集成 (Day 6)

1. **模型部署:**
   - 将 `mobilenet.onnx` 放入 `public/models/`。
2. **推理逻辑:**
   - `bun add onnxruntime-node`。
   - 编写 `server/utils/ai.ts`: `classifyImage(buffer)`.
   - *注意：需验证 Bun 对 onnxruntime 的 Node-API 兼容性，如遇问题可回退到 Node 环境或使用 WASM 版本 (onnxruntime-web) 在服务端运行。*

### 第四阶段：测试与部署 (Day 7)

1. **单元测试:**
   - 编写 `tests/ai.test.ts`。
   - 运行 `bun test` 验证 AI 逻辑和工具函数。
2. **生产构建:**
   - `bun run build`。
   - 输出 `.output/server/index.mjs`。
3. **部署:**
   - 推荐使用 PM2 或 Docker 容器运行，基础镜像直接使用 `oven/bun:alpine` (极小体积)。
   - 启动命令: `bun run .output/server/index.mjs`。

---

## 6. 迁移策略 (Migration Strategy)

鉴于我们是"另起炉灶"，我们将**不复制粘贴旧代码**，而是**复制粘贴逻辑**。

- 原 FastAPI 后端逻辑 -> 将被重写为强类型的 **TypeScript** 代码。
- 原 Element Plus 页面 -> 将被使用 `Una UI` + `UnoCSS` 重新设计实现。

---

## 7. 常见问题 (Q&A)

**Q: 为什么是 Bun 而不是 pnpm?**
A: pnpm 解决了磁盘占用问题，但 Bun 解决了**一切速度**问题。从安装依赖到运行测试，Bun 提供了数量级的提升。而且 Bun 原生支持 .ts 使得我们在编写 server scripts (如数据迁移脚本) 时体验极佳。

**Q: Bun 的兼容性如何？**
A: Nuxt (Nitro) 对 Bun 有官方支持。绝大多数 Node.js API 在 Bun 中都已实现。这里的唯一风险点是 `onnxruntime-node` 的 native binding，但 Bun 团队一直在积极完善 Node-API 支持。

**Q: 为什么数据库选 SQLite?**
A: "轻量"是本项目的核心。SQLite 在现代 NVMe SSD 上的性能惊人，且备份只需复制一个文件。结合 Drizzle ORM，我们能在保持极其轻量的同时拥有完整的类型安全和迁移能力。
