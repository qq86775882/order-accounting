# 订单记账系统

一个基于 Next.js 的订单记账网页应用程序，支持订单的增删改查操作和数据统计功能。

## 功能特性

- 订单管理（增删改查）
- 订单状态跟踪（已下单、已完成、已结算）
- 数据统计仪表盘
- 响应式设计，支持移动端访问

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components 和 Client Components

## 部署到 Vercel

本项目可以直接部署到 Vercel 平台，无需额外配置。

### 部署步骤

1. 将代码推送到 GitHub/GitLab/Bitbucket 仓库
2. 登录 [Vercel](https://vercel.com) 并创建新项目
3. 选择对应的 Git 仓库
4. Vercel 会自动检测到这是一个 Next.js 项目并应用正确的构建设置
5. 点击 "Deploy" 开始部署

### 注意事项

- 本项目使用文件系统作为数据存储（`data/orders.json`），在 Vercel 上会正常工作，但每次部署都会重置数据
- 对于生产环境，建议使用外部数据库（如 PostgreSQL、MongoDB 等）

## 本地开发

### 环境要求

- Node.js 18 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 项目结构

```
src/
├── app/                 # Next.js App Router 页面
│   ├── api/             # API 路由
│   ├── orders/          # 订单管理页面
│   └── page.tsx         # 首页（仪表盘）
├── components/          # React 组件
└── lib/                 # 工具函数库
data/                    # 数据存储目录
```

## 数据存储

项目使用 JSON 文件存储数据，位于 `data/orders.json`。在部署到 Vercel 时需要注意数据持久性问题。