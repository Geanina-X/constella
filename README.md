# Constella · 考研词汇星系

一个为考研英语设计的**交互式词汇关系图谱**。每个单词是一颗星，词根词缀是星系中心，同义反义是连线——学单词的同时建造一座属于自己的词汇宇宙。

**[直接打开 →](https://geanina-x.github.io/constella/)**

---

## 两种用法

| | Demo（不用登录） | 个人空间（登录后） |
|---|---|---|
| 能做什么 | 浏览 50+ 预设考研词汇，搜索，点词看释义 | 从零建造自己的词汇星系，增删改查 |
| 数据存哪 | 代码里（只读） | 云端（你一个人） |
| 清缓存会丢吗 | 不会 | 不会（存在服务器上） |

---

## 怎么用

### 新手上路
1. 打开网站，先看看预设的星图长什么样
2. 注册一个账号（邮箱 + 密码）
3. 你会得到一颗起始词 `constellation`
4. 点击它 → 再点一次 → 添加同义词、反义词、词根关联
5. 每加一个关系，星图上就多一颗星
6. 点喇叭 🔊 按钮可以听单词发音（浏览器自带，不用联网）

### 关系类型
- **同义**（绿）/ **反义**（红）
- **词根/前缀/后缀**（棕/紫/蓝）
- **词族**（橙）—— 派生词
- **形近**（青）

### 持续学习
- 每次学到新词 → 加进来，连上关系
- 考前导出 JSON 备份
- 手机、平板、任何设备登录都能看到同一份数据

---

## 技术栈

| 层 | 技术 |
|---|---|
| 3D 渲染 | Three.js + React Three Fiber |
| UI 框架 | React 19 + TypeScript |
| 状态管理 | Zustand |
| 认证 + 数据库 | Supabase |
| 部署 | GitHub Pages |

---

## 本地开发

```bash
cd constella
npm install
npm run dev        # → http://localhost:5173
npm run build      # 生产构建（零报错再提交）
```

需要创建 `.env`（不提交到 git）：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 项目历史

StarWords → Constella：5 次视觉大改版 + 2 次架构重构。
完整设计决策、常见错误、交互规范见 [CLAUDE.md](./CLAUDE.md)。
