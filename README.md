# Everyday Tools

Simple, useful tools for everyday tasks.

常用工具网站，纯 HTML / CSS / JavaScript，无需安装依赖或运行后端，适合 GitHub Pages 免费托管。网站名称为 **Everyday Tools**；GitHub Repository 使用专用名称 `alex97fr.github.io`，以发布在账号的根网址。上面的英文简介可直接用作仓库的 About 描述。

仓库：[Alex97FR/alex97fr.github.io](https://github.com/Alex97FR/alex97fr.github.io) · 网站：[Everyday Tools](https://alex97fr.github.io/)

## 功能

- `index.html`：批量解析“姓名 + 电话”，预览后下载 VCF 3.0 通讯录；支持姓名前后缀、号码后四位及长中文姓名。
- `whatsapp.html`：批量生成 WhatsApp `wa.me` 链接；支持从 Excel 粘贴姓名和号码、默认国家区号和连续编号，只复制格式有效的号码。
- `todo.html`：待办清单，支持添加、编辑、搜索、完成筛选和排序，并自动保存到当前浏览器。
- `styles.css`：三个页面共用的界面样式，支持桌面和手机。

## 使用

直接用浏览器打开 `index.html`，通过导航切换工具。也可用任意静态 HTTP 服务预览。正式发布请使用 HTTPS，便于浏览器允许剪贴板复制。

联系人数据只在当前页面处理，不会上传或持久保存。刷新或切换页面会清空联系人输入，请先下载或复制结果。

待办沿用原有 `wctools.todo.v1` 存储键，已有记录可以继续使用。待办按浏览器和网址存储，不会跨设备同步；换域名、本地文件改为线上网址、隐私模式或清理浏览器数据都可能导致原记录不可见。迁移网址前请自行备份重要事项。

VCF 每行使用“姓名 + 分隔符 + 电话”，分隔符可以是空格、Tab、逗号、分号或冒号；电话号码为 7–15 位数字，可带 `+`、空格、括号和连字符。解析失败的行会提示行号。

WhatsApp 号码需要包含国家区号。以 `+` 或 `00` 开头的国际号码不会重复追加默认区号；以默认区号开头的裸号码也按已含区号处理，有歧义时请填写 `+` 开头的完整国际号码。本地号码需自行去掉国内拨号前导 `0`。这里只检查号码格式，不检查对方是否注册 WhatsApp。从姓名列粘贴两列数据时，按“姓名 [Tab] 号码”读取。

待办可点击铅笔或双击文字编辑。拖动左侧手柄排序；也可以用 Tab 聚焦手柄，再按上下方向键移动。

## 发布到 GitHub Pages

1. 使用 **Public** 仓库 `Alex97FR/alex97fr.github.io`。仓库名需为小写的 `alex97fr.github.io` 才能使用根网址。GitHub Free 的 Pages 需要公开仓库；网站源码会公开。
2. 将 `index.html`、`whatsapp.html`、`todo.html`、`styles.css`、`favicon.svg` 和 `.nojekyll` 上传到仓库根目录的 `main` 分支。不要上传真实联系人、生成的 VCF 文件或其他私人数据。
3. 打开仓库的 **Settings → Pages**，在 **Build and deployment → Source** 选择 **Deploy from a branch**。
4. 选择 `main` 分支和 `/ (root)` 文件夹，保存。无需构建命令、付费服务器或另外配置 Actions 工作流。
5. 等 GitHub 显示发布地址 `https://alex97fr.github.io/`。以后更新 `main` 上的网页文件即可自动更新网站。

项目使用相对路径，支持 GitHub Pages 的仓库子路径。`.nojekyll` 让 GitHub 直接发布静态文件。

本地 `origin` 应为 `https://github.com/Alex97FR/alex97fr.github.io.git`。更新后提交并推送到 `main`，GitHub Pages 会自动发布。

参考：[GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[从分支发布](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 检查

安装 Node.js 后运行：

```sh
node tests/check.cjs
```

无需安装测试依赖。检查实际页面脚本中的联系人解析、VCF 转义和折行、WhatsApp 区号与表格粘贴、待办旧数据兼容及存储失败处理。浏览器布局和真实手机通讯录导入仍需单独验证。
