# ChatGPT Next

使用 Next.js 构建的 ChatGPT 应用，私有化部署的最佳选择！

https://chatgpt-next.com

备份网址：

- https://chatgpt-next-xcatliu.vercel.app
- https://chatgpt-next.zeabur.app

如果你也部署了一个站点并且愿意公开出来，欢迎 pr！

## 特性

- 支持私有化部署，通过环境变量配置多组密钥
- 配置密钥别名，无需暴露 apiKey 就可以分享给朋友
- 微信风格的聊天气泡，支持移动/PC 端，打造最极致的交互体验

<img src="./public/screenshot.png" width="390">

## 快速开始

需要先安装 Node.js 环境，可以在[官网下载安装](https://nodejs.org/en/)。

```bash
# 安装依赖
npm i -g pnpm
pnpm i
# 本地开发
pnpm dev
```

## 配置

### 配置 apiKey 別名

配置环境变量 OPENAI_API_KEY_ALIAS 即可支持 apiKey 别名，使用 `|` 分隔多项别名配置，每个别名配置使用 `:` 分隔别名和真实 apiKey，举例如下：

```
OPENAI_API_KEY_ALIAS=firstkey:sk-********FUt3|secondkey:sk-********f1J3
```

## 部署

```bash
# 构建
pnpm build
# 启动
pnpm start
```

### 使用 pm2 后台运行

```bash
# 使用 pm2 后台运行
npm i -g pm2
pm2 start npm --name chatgpt-next -- start
# 一行命令更新应用
git pull && pnpm i && pnpm build && pm2 restart chatgpt-next
```

### 使用 [Zeabur](https://github.com/zeabur) 部署

1. Fork 本仓库
2. 在 [Zeabur](https://dash.zeabur.com) 中创建新服务，选择 chatgpt-next 并导入部署
   <img src="./public/zeabur/deploy.png" width="390">
3. [可选] 在设置页面为其添加一个域名
   <img src="./public/zeabur/domain.png" width="390">
