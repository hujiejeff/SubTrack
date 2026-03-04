# SubTrack - 智能订阅管理专家

SubTrack 是一款专为个人用户设计的智能订阅管理工具。它可以帮助您轻松追踪、管理和优化所有的周期性支出（如 Netflix, Spotify, iCloud, 各种会员等）。

## ✨ 核心功能

- **多维度追踪**：记录订阅金额、周期、开始日期及下次扣款日。
- **多货币支持**：内置实时汇率转换，支持 CNY, USD, HKD, JPY, EUR, GBP 等主流货币，自动换算至您的主货币。
- **智能日历**：动态计算并展示未来月份的扣款计划，支出一目了然。
- **支出统计**：直观的仪表盘展示月度/年度支出概况及趋势分析。
- **个性化体验**：支持 浅色/深色/系统 模式切换。

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <your-repository-url>
   cd subtrack
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 🔄 数据同步指南

SubTrack 支持通过 **GitHub Gist** 或 **WebDAV** 进行多端数据同步。

### 1. 使用 GitHub Gist 同步
1. 访问 [GitHub Settings -> Tokens (classic)](https://github.com/settings/tokens)。
2. 生成一个新的 Token，勾选 `gist` 权限。
3. 在 SubTrack 的 **设置 -> 通用设置 -> 数据同步** 中选择 GitHub Gist。
4. 填入您的 Token 并保存。
5. 点击“上传到云端”，系统会自动创建一个私有 Gist 并保存其 ID。

### 2. 使用 WebDAV 同步 (推荐)
1. 使用支持 WebDAV 的服务（如：坚果云、Nextcloud、Alist 等）。
2. 在 SubTrack 的 **设置 -> 通用设置 -> 数据同步** 中选择 WebDAV。
3. 填入服务器地址（需包含完整路径，如 `https://dav.jianguoyun.com/dav/subtrack/`）、用户名和**应用密码**。
4. 点击“上传到云端”或“从云端拉取”。

---

## 🛡️ 安全与隐私 FAQ

### 1. 纯前端应用的数据同步安全吗？
**基本安全，但取决于您的本地环境。**
- **无中转服务器**：同步过程是您的浏览器直接与 GitHub 或 WebDAV 服务器通信，不经过任何第三方中转服务器。
- **本地存储**：您的同步凭据（Token/密码）和订阅数据都加密/明文存储在浏览器的 `localStorage` 中。
- **风险点**：如果您在公共电脑上使用且未清除数据，或者您的电脑被他人访问，本地存储的凭据可能会被窃取。

### 2. 如何提高安全性？
- **使用最小权限 Token**：为 GitHub Gist 仅分配 `gist` 权限，不要分配 `repo` 或其他敏感权限。
- **使用应用专用密码**：对于 WebDAV（如坚果云），请务必生成“应用专用密码”，而不是使用您的主账号密码。
- **定期备份**：虽然有云同步，但建议定期手动导出 JSON 备份。

---

## 🛠️ 技术栈

- **前端**: React 18, TypeScript, Tailwind CSS
- **动画**: Motion (Framer Motion)
- **图标**: Lucide React
- **图表**: Recharts

## 🌐 部署指南

由于 SubTrack 目前是一个**纯前端应用**（数据存储在浏览器的 `localStorage` 中），您可以非常轻松地将其部署到各种静态托管平台。

### 1. 部署到 Cloudflare Pages (推荐)

这是最简单且性能最好的方式：
1. 将代码推送到您的 GitHub 仓库。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入 **Workers & Pages**。
3. 点击 **Create application** -> **Pages** -> **Connect to Git**。
4. 选择您的仓库，配置如下：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy**。

### 2. 部署到 GitHub Pages

1. 在您的 GitHub 仓库中，进入 **Settings** -> **Pages**。
2. 在 **Build and deployment** -> **Source** 中选择 **GitHub Actions**。
3. 点击 **Static HTML** 旁边的 "Configure"（或者创建一个新的 Workflow 文件 `.github/workflows/deploy.yml`）。
4. 使用以下配置：
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: ["main"]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'
         - run: npm install
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

### ⚠️ 注意事项

- **数据持久化**：目前数据保存在本地浏览器中。如果您清除浏览器缓存，数据将会丢失。建议定期使用“导出备份”功能。
