# 宗族数字化平台 (Digital Genealogy Platform)

基于 Web 的现代化宗族管理系统，致力于通过数字化手段传承家族文化。平台核心功能包括按需展开的动态族谱树、GIS 墓冢地图定位、在线虚拟祭扫、宗族互助基金管理以及多支系协作修谱。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)

## ✨ 核心功能

*   **🌳 动态族谱树**: 基于 D3.js 开发的交互式家谱，支持无限层级钻取、多配偶并排显示、同代对齐，支持导出高清图片。
*   **📍 GIS 墓冢导航**: 集成 Leaflet 地图，支持墓地精准定位、全景图展示、一键生成导航二维码。
*   **🙏 在线祭拜**: 沉浸式虚拟祠堂，支持献花、点烛、上香、留言寄托哀思，记录祭扫日志。
*   **🤝 宗族互助**: 发布困难帮扶、奖学助学倡议，全程透明化的认捐与资金公示流程。
*   **📚 电子谱书**: 自动生成欧式/苏式排版的电子族谱，便于移动端阅读与传播。
*   **🛡️ 隐私与权限**: 完善的 RBAC 角色体系（超级管理员、族长、修谱员、普通成员），支持敏感信息（如在世成员生辰）隐私分级控制。

## 🛠 技术栈

*   **前端**: Vue 3 (Composition API), TypeScript, Vite, Tailwind CSS, Pinia
*   **可视化**: D3.js (树图), Leaflet (地图), html-to-image
*   **后端**: Node.js, Express, PostgreSQL
*   **部署**: Docker, Docker Compose

## 🚀 快速开始

### 前置要求

*   Node.js >= 18
*   Docker & Docker Compose (推荐用于数据库和生产环境部署)

### 1. 启动数据库

如果您本地没有 PostgreSQL，推荐使用 Docker 快速启动：

```bash
docker run --name genealogy-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=genealogy -p 5432:5432 -d postgres:15-alpine
```

**初始化表结构与数据：**

```bash
# 1. 导入表结构
docker cp database/schema.sql genealogy-db:/schema.sql
docker exec -i genealogy-db psql -U postgres -d genealogy -f /schema.sql

# 2. 填充测试数据 (需先安装后端依赖)
cd server && npm install
npx tsx src/scripts/seed.ts
```

### 2. 启动后端服务

```bash
cd server
# 复制环境变量配置 (可选)
cp .env.example .env 
npm run dev
```
后端 API 服务将在 `http://localhost:3000` 启动。

### 3. 启动前端服务

新开一个终端窗口：

```bash
# 回到根目录
cd .. 
npm install
npm run dev
```
前端开发服务将在 `http://localhost:5173` 启动。

默认管理员账号：`admin` / `admin123`

## 🧪 测试

本项目包含单元测试和集成测试。

### 1. 后端测试

**单元测试**:
```bash
cd server
npm run test
```

**集成测试**:
确保本地数据库或 Docker 数据库已启动。集成测试会直接操作数据库，建议使用测试数据库。

```bash
cd server
npx vitest run --config vitest.config.integration.ts
```

### 2. 前端测试

```bash
npm run test
```

## 📦 生产环境部署

本项目支持 Docker 一键全栈部署（包含前端静态资源托管、后端 API 和数据库）。

```bash
# 构建镜像并启动所有服务
docker-compose -f docker-compose.prod.yml up -d --build
```

启动后，直接访问 `http://服务器IP:3000` 即可使用完整应用。

## 📂 项目结构

```
.
├── database/           # 数据库 SQL 脚本 (Schema)
├── docs/              # 需求文档与设计资料
├── server/            # 后端 Node.js 项目
│   ├── src/
│   │   ├── routes/    # API 路由控制器
│   │   ├── middleware/# 中间件 (Auth, RateLimit)
│   │   ├── scripts/   # 运维脚本 (Seed, Migration)
│   │   └── index.ts   # 服务入口 (Express + Static Serve)
├── src/               # 前端 Vue 项目
│   ├── components/    # 业务组件
│   │   ├── family-tree/ # 核心族谱树组件 (D3)
│   │   └── map/       # 地图组件 (Leaflet)
│   ├── stores/        # Pinia 状态管理
│   ├── views/         # 页面视图
│   └── utils/         # 工具函数 (Data Mapper, GEDCOM Parser)
├── docker-compose.prod.yml # 生产环境编排文件
└── Dockerfile         # 多阶段构建 Dockerfile
```

## 📄 许可证

MIT License
