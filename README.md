# 订单记账应用

这是一个基于Next.js的订单记账网页应用程序，具有订单的增删改查功能和仪表盘页面。

## 部署到Netlify

要将此应用程序部署到Netlify，请按照以下步骤操作：

1. 将代码推送到GitHub仓库
2. 在Netlify控制台中创建新站点并连接到您的GitHub仓库
3. Netlify将自动检测Next.js项目并进行相应配置
4. 点击"Deploy site"开始部署

## 数据存储

由于Netlify Functions的限制，此应用程序在Netlify上部署时使用内存存储，这意味着数据不会持久化。要获得持久化存储，您需要：

1. 集成外部数据库服务，如Supabase、Firebase或MongoDB Atlas
2. 修改API路由文件以使用所选的数据库服务

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000 查看应用。