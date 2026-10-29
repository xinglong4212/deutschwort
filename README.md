# DeutschWort - 德语单词解释器 🇩🇪

为中文母语者设计的德语单词解释网站。输入德语单词，获得中文释义、变位变格、例句和发音。

![DeutschWort](https://img.shields.io/badge/Deutsch-Lernen-blue)

## 功能
- 🔍 智能查词（85+ 常用词离线 + 在线 API 兜底）
- 📚 词性、性、复数、四格、动词变位
- 🗣️ 一键德语发音 (Web Speech API)
- 💬 德语例句 + 中文 + 英文对照
- ⭐ 生词本 & 搜索历史 (localStorage)
- 📅 每日一词 Tageswort

## 本地运行
```bash
npm install
npm run dev
```

## 部署到 GitHub Pages

### 方法1：自动部署（推荐）
1. 在 GitHub 新建仓库，例如 `deutschwort`
2. 推送代码：
```bash
git init
git add .
git commit -m "feat: DeutschWort"
git branch -M main
git remote add origin https://github.com/你的用户名/deutschwort.git
git push -u origin main
```
3. 进入 GitHub 仓库 > Settings > Pages > Source 选择 `GitHub Actions`
4. 添加 workflow 文件 `.github/workflows/deploy.yml`（已包含在本项目）

### 方法2：手动部署 dist
```bash
npm run build
# 将 dist 文件夹内容推送到 gh-pages 分支
```

## 单文件版本
如果你只想传一个文件就能用，根目录的 `standalone.html` 可以直接拖到任何静态托管。

## 技术栈
- React + TypeScript + Vite
- Tailwind CSS
- lucide-react icons
- DictionaryAPI (free) fallback

Made with ❤️ for German learners.
