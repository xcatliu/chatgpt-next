FROM node:18.15.0-alpine3.17

# 设置工作目录
WORKDIR /app

# 复制项目文件到容器中
COPY . .

# 安装依赖
RUN npm i -g pnpm
RUN pnpm i -P

# 构建
RUN pnpm build

# 暴露 3000 端口
EXPOSE 3000

# 运行 pnpm start 脚本
CMD ["pnpm", "start"]
