# arXivist

arXivist uses advanced AI (powered by GLM) to scan thousands of daily arXiv submissions and surface only the most insightful, rigorous, and impactful papers. No noise, no fluff—just high-signal research, thoughtfully scored and curated for curious minds.

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios

## 项目结构

```
arXivist-frontend/
├── public/                 # 静态资源目录
├── src/
│   ├── api/               # API 服务层
│   │   ├── services/      # 业务 API 服务
│   │   │   └── paperService.ts  # 论文相关 API
│   │   ├── interceptors/  # 请求/响应拦截器
│   │   └── index.ts       # API 配置入口
│   ├── assets/            # 静态资源（图片、字体等）
│   ├── components/        # Vue 组件
│   │   ├── common/        # 通用组件
│   │   │   ├── Button.vue      # 按钮组件
│   │   │   ├── Card.vue        # 卡片组件
│   │   │   ├── Loading.vue     # 加载动画组件
│   │   │   └── Select.vue      # 下拉选择组件
│   │   ├── layout/        # 布局组件
│   │   │   └── Header.vue      # 页面头部
│   │   └── paper/         # 论文业务组件
│   │       ├── PaperCard.vue   # 论文卡片组件
│   │       └── PaperList.vue   # 论文列表组件
│   ├── composables/       # 组合式函数（可复用逻辑）
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定义
│   ├── store/             # Pinia 状态管理
│   │   ├── modules/       # Store 模块
│   │   └── index.ts       # Store 入口
│   ├── styles/            # 全局样式
│   │   ├── reset.css      # CSS 重置
│   │   └── global.css     # 全局样式变量
│   ├── types/             # TypeScript 类型定义
│   │   ├── api.ts         # API 相关类型
│   │   ├── paper.ts       # 论文相关类型
│   │   └── index.ts       # 类型导出入口
│   ├── utils/             # 工具函数
│   │   ├── constants.ts   # 常量定义
│   │   └── format.ts      # 格式化函数
│   ├── views/              # 页面视图
│   │   └── HomeView.vue   # 主页
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口文件
├── .gitignore             # Git 忽略文件
├── index.html              # HTML 模板
├── package.json            # 项目配置和依赖
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node 环境 TypeScript 配置
└── vite.config.ts          # Vite 构建配置
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 功能特性

- ✅ **按日期筛选** - 支持自定义开始日期查询论文
- ✅ **按分类筛选** - 支持多个 arXiv 分类（cs.AI、cs.CV 等）
- ✅ **数量控制** - 可自定义返回数量（1-2000 篇）
- ✅ **自动加载** - 页面加载时自动获取最新论文
- ✅ **美观 UI** - 现代化的渐变配色和卡片式布局
- ✅ **响应式设计** - 完美适配移动端和桌面端
- ✅ **加载状态** - 友好的加载动画和错误处理
- ✅ **统计信息** - 实时显示查询结果数量

## 许可证

MIT License
