# Constella · 项目规范与设计决策记录

> 从 StarWords 到 Constella，从本地玩具到上线应用的完整演进记录。
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

## 二、双模式架构（v2）

访问同一个网址，根据登录状态呈现两种完全不同的体验：

### Demo 模式（未登录）
- 展示代码内置的 50+ 考研词汇星图（`presetData.ts`，只读）
- 工具栏：搜索框 + 登录按钮
- 可拖拽旋转浏览、点击单词查看释义（无编辑功能）
- 目的：不用登录就能体验产品，降低试用门槛

### 个人模式（已登录）
- 从 Supabase 加载用户自己的词汇数据
- 工具栏：搜索 + 新单词 + 布局 + 导出/导入 + 清空 + 头像菜单
- 完整增删改查功能

### 首次登录
- 创建种子词 `constellation`（词根 `-stell-`，星星）
- 显示引导卡片（不会自动消失，手动关闭）
- 引导内容：点击星星→看释义→再点编辑→添加关系→扩建星系

---

## 三、视觉方案（经过 5 次大迭代后确定）

### 当前方案：羊皮纸星图

- **背景色**：`#f5f1e8`（暖色羊皮纸）
- **节点**：Canvas 绘制的星芒 Sprite（十字衍射光芒 + 亮核 + 柔光晕）
  - 词根：金色大星，`#c4923a`
  - 前缀：紫色星，`#7b5ea7`
  - 普通词：星芒 Sprite，颜色由第一词性决定
  - 大小：连接数越多节点越大
- **文字标签**：星芒正上方，Georgia/Noto Serif SC
- **连线**：三层叠加贝塞尔弧线，颜色按关系类型编码（vine palette，统一在 `graphStyles.ts`）
- **Bloom**：`intensity=0.5, luminanceThreshold=0.4`

### 已废弃的方案（不要再试）

| 方案 | 废弃原因 |
|---|---|
| Cytoscape.js 2D 力导向 | 节点挤在一起，无空间感 |
| 暗黑星空 + 强 Bloom | 光晕脏，文字不清 |
| AI 生图花卉（Cloudflare FLUX） | 加载异步不可靠、白色背景去不掉、花形干扰记忆 |
| 3D 土星环星球 | 球体半透明效果差、视觉不协调 |
| d3-force 2D 力仿真 | 只能做 2D 平面，Z 轴无深度 |

---

## 四、布局系统（核心）

当前使用**手写 3D 轨道布局**（`useGalaxyLayout` in GraphCanvas.tsx）：

1. 词根节点按黄金角螺旋在 3D 空间散布（Z 轴有深度）
2. 每个词根的关联词沿倾斜轨道绕行（Quaternion 随机倾斜）
3. 词缓慢公转（`timeRef += delta * 0.03`，非常慢，不抢眼）
4. 孤词（无词根归属）散布在远处

**这个布局是确定的、稳定的、不抖动的。** 不要换力导向布局。

---

## 五、交互模型

1. **默认态**：所有词可见，缓慢公转，间距舒适
2. **点击一个词（聚焦）**：关联词被拉到中心围成圈（orbitR=3.5），无关词淡化到 35%，镜头自动移动
3. **再点同一个词（选中）**：打开右侧详情面板
4. **点空白**：退出聚焦，恢复全局视角，重新公转
5. **动画速度**：所有过渡用 lerp 0.15

---

## 六、细节面板规范（WordDetailPanel）

- 宽度：420px，top:56px，左侧圆角 12px
- Demo 模式：只读，无编辑/删除/添加按钮
- 用户模式：完整编辑功能
- 字号层级：词名 24px → 释义 16px → 关系词 14px
- 删除按钮低调（`color: '#c0b8a8'`，字号 10px）
- 同义词/反义词默认折叠

---

## 七、数据架构

```
Demo 模式：presetData.ts → loadDemoData() → Zustand store → UI

User 模式：Supabase → loadFromCloud() → Zustand store → UI
           用户操作 → store async action → Supabase 同步写入
```

### 数据库表（Supabase PostgreSQL）

```sql
words (id TEXT PK, user_id UUID FK→auth.users, word TEXT, pronunciation TEXT,
       meanings JSONB, tags TEXT[], notes TEXT)

relationships (id TEXT PK, user_id UUID FK→auth.users,
                source_id TEXT, target_id TEXT, type TEXT,
                label TEXT, source_meaning_index INT, target_meaning_index INT)
```

RLS 策略：`FOR ALL USING (auth.uid() = user_id)` — 用户只能读写自己的数据。

### 存储 key 历史
`starwords-data` → `starwords-v2` → `starwords-v3` → `starwords-hub` → `constella-hub` → 现用 Supabase

---

## 八、代码组织规范

### 颜色定义（单一来源原则）
所有 RELATION_COLORS（连线颜色）和 getNodeColor（词性→节点色）**只在 `src/utils/graphStyles.ts` 一处定义**。其他文件从此处导入，不要重复定义。

`src/types.ts` 只放类型定义和 RELATION_LABELS（中文关系名），不放颜色相关代码。

### 文件结构
```
src/
├── App.tsx                  # 根组件：路由 Demo / Auth / User 三种状态
├── App.css                  # 全局样式
├── main.tsx                 # React 入口
├── supabase.ts              # Supabase 客户端初始化
├── types.ts                 # 纯类型 + RELATION_LABELS
├── components/
│   ├── GraphCanvas.tsx      # Three.js 3D 渲染核心（布局、交互、渲染）
│   ├── WordDetailPanel.tsx  # 右侧详情面板（支持 readonly）
│   ├── AddWordModal.tsx     # 添加新单词弹窗（羊皮纸主题）
│   ├── AddRelationModal.tsx # 添加关系弹窗（羊皮纸主题）
│   ├── Toolbar.tsx          # 顶部工具栏（Demo/User 双模式）
│   ├── SearchBar.tsx        # 搜索组件
│   ├── AuthPage.tsx         # 登录/注册页
│   ├── UserMenu.tsx         # 头像下拉菜单
│   ├── OnboardingHint.tsx   # 首次登录引导卡片
├── data/
│   ├── store.ts             # Zustand 状态管理
│   └── presetData.ts        # 预设 50+ 考研词汇数据（Demo 模式使用）
└── utils/
    └── graphStyles.ts       # 颜色定义（RELATION_COLORS + getNodeColor）
```

---

## 九、部署流程

```
本地 git push → GitHub Actions 自动触发
  → npm ci → npm run build（注入 VITE_SUPABASE_* 环境变量）
  → deploy-pages → https://geanina-x.github.io/constella/
```

Git 仓库公开（GitHub Pages 免费版要求），但敏感信息（Supabase anon key）
不是秘密——它是公开的客户端密钥，受 RLS 保护。真正的秘密（service_role key）从未进入代码库。

---

## 十、开发经验教训

1. **先定型再上线。** 视觉方案经历了 5 次大改版，每次都是推翻重来。如果先在纸上/设计工具里定稿，能省大量时间。
2. **颜色别散落各处。** RELATION_COLORS 曾同时在 types.ts 和 graphStyles.ts 各定义一套不同的颜色值，导致 3D 场景和 UI 面板的连线颜色不一致。后来统一到 graphStyles.ts。
3. **弹窗主题要跟着主视觉走。** AddWordModal 和 AddRelationModal 在改羊皮纸后仍保留暗黑星空背景，直到代码审查才发现。
4. **localStorage 是便利贴，不是笔记本。** 清缓存数据全丢、换设备不同步。对于需要持久存储的应用，从一开始就应该用数据库。
5. **Demo 模式 + 登录模式的架构设计要从一开始想清楚。** 最初所有用户（包括未登录）都共用一个数据源，导致登录/未登录边界模糊。v2 重构成了两条独立路径。
6. **RLS 是最后一道防线。** 即使前端有 bug，Supabase 的行级安全策略确保用户 A 绝对读不到用户 B 的数据。
7. **写死数据不丢人。** Demo 模式的预设词汇写在 `presetData.ts` 里而非从数据库加载，零延迟、零成本、永不丢失。
8. **别猜用户的信息。** git 邮箱、Supabase 注册邮箱——两次没确认就自己假设，两次都猜错。

---

## 十一、下次打开项目的检查清单

1. `npm install` — 确保依赖完整
2. `npm run build` — 确认零报错
3. 检查 Supabase 项目状态（配额、服务是否正常）
4. 打开 `https://geanina-x.github.io/constella/` 确认 Demo 模式和登录模式都正常
5. 验证：注册新账号 → 看到种子词 + 引导 → 添加单词 → 退出 → Demo 模式不受影响
6. 如果看不到节点：检查 npm run build 是否有错、浏览器 console 是否有 Supabase 报错
7. 如果布局乱了：检查 useGalaxyLayout 的 useEffect 依赖
