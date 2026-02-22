# Linux 服务器部署指南

本项目支持在任何安装了 Docker 的 Linux 服务器（如 Ubuntu, CentOS, Debian）上部署。

## 📋 准备工作

1.  **一台 Linux 服务器** (VPS/云主机/物理机)
2.  **安装 Git**
3.  **安装 Docker & Docker Compose**

### 安装 Docker (以 Ubuntu 为例)

```bash
# 更新源
sudo apt update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

## 🚀 部署步骤

### 1. 克隆代码

登录到您的服务器，克隆项目代码：

```bash
git clone https://github.com/JunyuZhan/genealogy.git
cd genealogy
```

### 2. 执行一键部署

我们提供了一个自动化脚本来处理构建和启动：

```bash
./scripts/deploy.sh
```

该脚本会自动：
1.  拉取最新代码
2.  停止旧容器
3.  构建新的 Docker 镜像（前端 + 后端）
4.  启动数据库和应用容器

### 3. 访问应用

部署完成后，应用将在 **3000** 端口运行。

访问地址：`http://您的服务器IP:3000`

## ⚙️ 环境变量配置

生产环境的配置位于 `docker-compose.prod.yml` 中。

如果需要修改数据库密码或 JWT 密钥，请编辑该文件：

```yaml
environment:
  - JWT_SECRET=your-secure-secret-key  # 修改这个！
  - POSTGRES_PASSWORD=your-secure-db-password # 修改这个！
```

## 🔄 更新部署

当代码有更新时，只需再次运行部署脚本：

```bash
cd genealogy
./scripts/deploy.sh
```

## 🛠 常见问题

**Q: 部署脚本提示 "Permission denied"？**
A: 请给脚本添加执行权限：`chmod +x scripts/deploy.sh`

**Q: 数据库数据在哪里？**
A: 数据持久化在 Docker Volume `postgres_data` 中，重启容器不会丢失数据。
