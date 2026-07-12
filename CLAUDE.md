# Constella · 项目规范与设计决策记录

> 这份文档记录了整个开发过程中踩过的坑、验证过的方案、用户确认的偏好。
> **下次打开这个项目时，先读这个文件再动手。**

---

## 一、技术栈（不可随意更换）

| 层 | 选型 | 备注 |
|---|---|---|
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing | 已卸载 Cytoscape、d3-force，不要再装回来 |
| 状态管理 | Zustand | store 文件 `src/data/store.ts`，云端数据存 Supabase |
| 认证 | Supabase Auth | Email + 密码，邮箱验证开启 |
| 数据库 | Supabase PostgreSQL | RLS 行级安全，用户只能读写自己数据 |
| 构建 | Vite 8 + TypeScript | `npm run build` 零报错才能算改完 |
| 样式 | 内联 style 对象 + App.css | 没有 Tailwind，没有 CSS modules |
| 部署 | GitHub Pages | `https://geanina-x.github.io/constella/`，GitHub Actions 自动构建 |

---

## 二、视觉方案（经过 5 次大迭代后确定）

### 当前方案：羊皮纸星图

- **背景色**：`#f5f1e8`（暖色羊皮纸）
- **节点**：Canvas 绘制的星芒 Sprite（十字衍射光芒 + 亮核 + 柔光晕）
  - 词根：金色大星，`#c4923a`，比普通词大约 2 倍
  - 前缀：紫色星，`#7b5ea7`，比普通词大约 1.6 倍
  - 普通词：星芒 Sprite，颜色由第一词性决定（v.粉 `#f08080` / n.青 `#5ec4c0` / adj.金 `#e8c84a` / adv.紫 `#a89af0`）
  - 大小：连接数越多节点越大（`baseSize=0.9+conns*0.15`，上限 1.0）
- **文字标签**：在星芒正上方居中（`Html position={[0,0,0]}`），font-family 用 Georgia/Noto Serif SC
- **连线**：三层叠加贝塞尔弧线（外层光晕 6% + 中层 20% + 内层 35%），颜色按关系类型编码
- **Bloom**：`intensity=0.5, luminanceThreshold=0.4`（羊皮纸底不能太高，会脏）
- **节点不使用 NormalBlending 以外的混合模式**

### 为什么是羊皮纸？

暗黑星空 + Bloom 的问题：
1. 光晕在暗底上容易脏、糊成一片
2. 文字对比度不够，长时间学习刺眼
3. 技术上调不好，效果远不如预期

羊皮纸暖底 + 深色文字干净舒适，文字清晰，关系边对比度够。

### 已废弃的方案（不要再试）

| 方案 | 废弃原因 |
|---|---|
| Cytoscape.js 2D 力导向 | 节点挤在一起，无空间感 |
| 暗黑星空 + 强 Bloom | 光晕脏，文字不清 |
| AI 生图花卉（Cloudflare FLUX） | 加载异步不可靠、白色背景去不掉、花形干扰记忆 |
| 3D 土星环星球 | 球体半透明效果差、视觉不协调 |
| d3-force 2D 力仿真 | 只能做 2D 平面，Z 轴无深度，出来的形状是方块 |

---

## 三、布局系统（核心）

当前使用**手写 3D 轨道布局**（`useGalaxyLayout` in GraphCanvas.tsx）：

1. 词根节点按黄金角螺旋在 3D 空间散布（Z 轴有深度）
2. 每个词根的关联词沿倾斜轨道绕行（Quaternion 随机倾斜）
3. 词缓慢公转（`timeRef += delta * 0.03`，非常慢，不抢眼）
4. 孤词（无词根归属）散布在远处

**这个布局是确定的、稳定的、不抖动的。** 不要换力导向布局。

---

## 四、交互模型（用户反复确认的偏好）

1. **默认态**：所有词可见，缓慢公转，间距舒适
2. **点击一个词（聚焦）**：
   - 关联词被拉到中心围成圈（orbitR=3.5）
   - 无关词淡化到 35% 透明度（不是 0，不是消失）
   - 镜头自动移到该词中心（向右偏 4.5 单位，给右侧面板留空间）
   - 公转暂停（聚焦词和邻居从 orbiters 中移除）
3. **再点同一个词（选中）**：打开右侧详情面板
4. **点空白**：退出聚焦，恢复全局视角，重新公转
5. **动画速度**：所有过渡用 lerp 0.15，快速到位后停止，不要持续飘动

---

## 五、详情面板（WordDetailPanel）

- 宽度：420px，top:56px，左侧圆角 12px，柔光阴影
- 字号：单词名 24px，释义 16px，关系词 14px
- 区块用 Card 组件包裹（浅灰底 + 圆角边框），分为：释义/Word Family/词根词缀/形近词
- 同义词、反义词是可折叠的（默认收起）
- 删除按钮要低调（`color: '#c0b8a8'`，字号 10px）
- 添加按钮要低调（SubtleAdd 组件，opacity 0.6，hover 时变亮）
- 词根/前缀节点不显示 syn/ant 按钮，改为「包含以下单词」列表
- 关系显示逻辑：释义卡片下只显示 syn/ant/similar-form/derivative，root-share/prefix-share 在单独的区块里

---

## 六、数据模型关键约定

- `Word.meanings[]` — 一个词可以有多个释义
- `Relationship.sourceMeaningIndex` / `targetMeaningIndex` — 关系可以绑定到具体释义
- 没有 meaningIndex 的关系（预设数据中的）默认归到第一个释义
- 添加关系时可以创建全新单词（AddRelationModal 的"创建新单词"功能）
- 存储 key：`constella-hub`（已废弃 localStorage，改用 Supabase）

### 双模式架构（v2）

- **Demo 模式（未登录）**：展示预设 50+ 词汇星图，只读（搜索 + 浏览 + 点词看释义）
- **个人模式（已登录）**：从 Supabase 加载用户数据，完整增删改查
- **首次登录**：创建一颗起始词 `constellation`，显示 Onboarding 引导提示
- **Toolbar**：Demo 显示搜索 + 登录按钮；User 显示完整工具 + 头像下拉菜单（UserMenu）
- **WordDetailPanel**：支持 `readonly` 属性，Demo 下隐藏编辑/删除/添加按钮

---

## 七、常见错误和修复

| 症状 | 原因 | 修复 |
|---|---|---|
| 页面空白/崩溃 | `npm run build` 有 TS 错误 | 先跑 build 查错 |
| 节点不显示 | `useTexture` 异步加载失败 | 用 Canvas 程序化绘制，不要用外部图片 |
| 节点抖动不停 | 力仿真未收敛 | 已废掉力仿真，用确定性轨道布局 |
| 面板遮住工具栏 | panel top 值太小 | 设 `top:56px` |
| 删除按钮太抢眼 | 颜色太深 | 改为 `#c0b8a8` |
| 文字看不清 | 字体太小或颜色太淡 | 关键词字号 14-16px，颜色 `#3a3028` |

---

## 八、用户全局约束（来自 ~/.claude/CLAUDE.md）

本项目遵守以下全局规则：
- 所有决策从问题本质出发，不因惯例照搬
- 遇到模糊需求，先给最合理的方案，再问要不要调整
- 改完代码主动跑 `npm run build` 验证
- 密钥不进代码、不进 commit
- 删除文件前先确认
- 默认中文沟通，代码用英文

---

## 九、补充技术细节

### 字体
App.css 从 Google Fonts 加载 Exo（标题/UI）字体。如果网络不通，fallback 到系统字体。

### Vite 配置
`vite.config.ts` 已精简到只有 `plugins: [react()]`。之前配置过 cytoscape 的 CommonJS 转译和 optimizeDeps，已全部移除。

### npm 工作目录
终端 cwd 可能重置到 `~`，需要用 `npm --prefix /Users/lvlvy/constella` 代替 `cd constella && npm`。

### 存储 key 历史
`starwords-data` → `starwords-v2` → `starwords-v3` → `starwords-hub` → `constella-hub`（当前）。
历史 key 保留记录以备迁移。更改 key 会强制重置预设数据（旧格式数据不会被加载）。

### CosmicBackground
`CosmicBackground.tsx` 仍在用，在 Canvas 上画细微的尘埃粒子作背景纹理。不要删。

### 当前已删除的文件（备忘）
- `src/types.d.ts`（cytoscape-fcose 类型桩）
- `src/utils/layoutConfig.ts`（Cytoscape 布局配置）
- `src/flowerImports.ts`（AI 花卉图片导入）
- `public/flower-*.png`（8 个 AI 生成的花卉图）
- `public/test-img.html`（图片加载测试页）
- `.env`（Cloudflare API keys）
- npm 包：`cytoscape`, `cytoscape-fcose`, `d3-force`, `@types/cytoscape`, `@types/d3-force`

---

## 十、下次打开项目的检查清单

1. `npm install` — 确保依赖完整
2. `npm run build` — 确认零报错
3. `npm run dev` — 启动开发服务器
4. 打开 `http://localhost:5173` — 确认能正常看到预设词汇的星图
5. **在改任何代码之前**，先读这份 CLAUDE.md 和 README.md
6. 如果看不到节点：检查 `npm run build` 是否有错、浏览器 console 是否有报错
7. 如果布局乱了：检查 `useGalaxyLayout` 的 `useEffect` 依赖是否正确触发
