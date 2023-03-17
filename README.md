# ChatGPT Next

使用 Next.js 构建的 ChatGPT 应用，私人部署的最佳选择！

示例网址：https://chatgpt-next.com/

## 特性

- 支持私人部署，通过环境变量配置多组密钥
- 支持配置密钥别名，无需暴露 apiKey 就可以分享给朋友
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

## 部署

```bash
# 构建
pnpm build
# 启动
pnpm start
```

也可以使用 pm2 后台运行：

```bash
# 使用 pm2 后台运行
npm i -g pm2
pm2 start npm --name chatgpt-next -- start
```

## 配置

```
OPENAI_API_KEY_ALIAS=firstkey:sk-********FUt3|secondkey:sk-********f1J3
```
