# g2rain-manager-app

## 1. 徽标与状态标识

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![qiankun](https://img.shields.io/badge/qiankun-2.x-1f6feb)](https://qiankun.umijs.org/)

## 2. 项目简介

`g2rain-manager-app` 是 G2rain 平台的管理端 qiankun 子应用，负责承载平台控制台中的管理型业务页面，同时提供资源配置生成、CRUD 页面代码生成与前端安全协同能力。

## 3. 平台定位

在 G2rain“企业级 AI 原生开源 SaaS 平台”体系中，`g2rain-manager-app` 位于交互接入层，是平台管理端业务能力的重要前端承载仓库。

它主要承担以下角色：
- 作为 `g2rain-main-shell` 的管理类子应用，承载平台治理相关页面
- 作为开发阶段可独立运行的前端工程，方便页面调试与局部联调
- 作为平台资源配置生成入口，把页面、按钮、接口资源快速整理为可导入配置
- 作为 CRUD 页面工程化入口，根据表名快速生成页面、接口、类型与 Mock 基础代码
- 作为前端与 IAM / 网关安全链路协同节点，通过 OpenResty + Lua 提供签名与密钥协同能力

它与 `g2rain-main-shell`、`g2rain-basis`、`g2rain-iam`、`g2rain-gateway-webmvc`、`g2rain-gateway-webflux` 等仓库协同，共同构成平台统一交互、统一身份与统一资源治理链路。

## 4. 核心能力

本章回答“这个仓库在平台里提供什么能力、解决什么问题”。

- 管理端页面承载能力：解决平台治理类页面如何统一承载在子应用中的问题，通过 `src/views` 与平台运行时装配层承载应用、角色、资源、服务注册、审计等管理页面。
- 独立运行与主壳集成双模式能力：解决开发阶段单独调试与联调阶段接入主壳之间的切换问题，通过 `VITE_RUN_MODE`、qiankun 适配层与主壳跳转工具支持两种运行模式。
- 资源配置生成能力：解决页面、按钮、接口资源如何快速整理成平台可导入配置的问题，通过 `shared/config-util` 从 `route-map.ts` 扫描并生成资源配置。
- CRUD 页面生成能力：解决管理端大量表单型页面重复开发的问题，通过 `shared/generator` 根据表名生成 `index.vue`、`api.ts`、`type.ts`，按需生成 `mock.ts`。
- 前端签名与安全协同能力：解决前端如何进入平台既定身份与安全链路的问题，通过 `components/http/sign.ts`、`nginx`、`lua` 协同获取 IAM 公钥并生成签名结果。
- 平台运行时装配能力：解决子应用资源加载、认证、路由、权限、HTTP 环境如何统一初始化的问题，通过 `platform`、`runtime` 两层抽象沉淀稳定运行基座。

## 5. 技术栈

- 前端框架：`Vue 3`
- 语言：`TypeScript`
- 构建工具：`Vite 7`
- 微前端：`qiankun`、`vite-plugin-qiankun`
- UI 与状态：`Element Plus`、`Pinia`
- 网络与认证：`axios`、`jose`、`elliptic`、`crypto-js`
- Mock：`vite-plugin-mock`、`mockjs`
- 国际化：`vue-i18n`
- 运行环境：`OpenResty`、`Lua`、`Nginx`

## 6. 快速开始

### 环境要求

- `Node.js >= 22`
- `npm >= 9`
- `Docker`（可选，用于容器化交付）

### 环境变量

当前仓库同时使用构建时环境变量与运行时环境变量。

| 变量名 | 说明 | 典型用途 |
| --- | --- | --- |
| `VITE_APPLICATION_CODE` | 应用编码 | 子应用身份标识 |
| `VITE_CONTEXT_PATH` | 上下文路径 | 默认 `/manager` |
| `VITE_BACKEND_ORIGIN` | 后端服务地址 | 开发代理目标 |
| `VITE_TOKEN_END_POINT` | Token 接口路径 | 令牌获取 |
| `VITE_AUTH_END_POINT` | 认证路径 | SSO 跳转 |
| `VITE_MOCK_ENABLED` | 是否启用 Mock | 本地联调开关 |
| `VITE_SERVER_PORT` | 本地开发端口 | 默认 `3001` |
| `VITE_SSO_BASE_URL` | SSO 根地址 | 认证跳转与回调 |
| `VITE_REDIRECT_URI` | SSO 回调路径 | 登录回跳 |
| `VITE_RUN_MODE` | 运行模式 | `alone` 为独立运行 |
| `VITE_MAIN_SHELL_REDIRECT_PREFIX` | 主壳重定向前缀 | 集成意图直链跳转 |
| `VITE_MAIN_SHELL_ORIGIN` | 主壳来源地址 | 跨端口联调 |
| `VITE_I18N_TAGS` | 国际化文案包标签 | 拉取平台文案包 |

运行时部署还会使用：
- `SSO_BASE_URL`
- `CONTEXT_PATH`
- `SERVER_PORT`
- `GATEWAY_HOST` / `GATEWAY_PORT`
- `IAM_HOST` / `IAM_PORT`

建议：
- 开发阶段可使用 `VITE_RUN_MODE=alone` 独立运行，方便页面调试。
- 联调阶段应部署到测试环境，并接入 `g2rain-main-shell` 验证完整流程。
- 生产环境通过运行时注入方式管理易变地址与接入参数。

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

默认可通过 `http://localhost:3001` 访问。

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 代码生成

```bash
npm run build:generate -- --tables=dict
```

### 资源配置生成

```bash
npm run build:config
```

### 镜像构建

```bash
./build.sh
./build.sh --image g2rain/g2rain-manager-app --tag latest --build-mode production
```

## 7. 项目结构

本章回答“代码与模块是如何组织的、排查和扩展时应该先看哪里”。

```text
g2rain-manager-app/
├── src/
├── lua/
├── nginx/
├── build.sh
├── Dockerfile
├── vite.config.ts
└── package.json
```

### `src` 分层说明

- `src/platform`：平台抽象、qiankun 适配、i18n、状态与类型定义。
- `src/runtime`：启动装配、认证、路由、HTTP、环境变量与运行时接口。
- `src/components`：HTTP、权限、微前端、查询、远程选择、表格等基础组件。
- `src/shared`：生成器、配置工具与共享工具函数。
- `src/views`：业务页面目录，当前明显按表名/模块组织。

### `src/views` 目录规范

- 默认每个表或页面模块对应一个目录，如 `application`、`role`、`service_registry`。
- 每个目录默认包含 `index.vue`、`api.ts`、`type.ts`。
- 按需补充 `mock.ts` 或其他页面文件。
- 允许手工新增业务页面，但仍建议遵循“目录即模块、页面/接口/类型/Mock 配套齐全”的规范。

### 运行环境目录

- `nginx`：默认运行环境模板与启动脚本，基于 OpenResty。
- `lua`：IAM 公钥获取、应用私钥签名等安全协同脚本。
- `build.sh` 与 `Dockerfile`：默认容器化交付入口。

### 代码查阅指引

- 查看运行模式与 qiankun 挂载时，优先看 `src/main.ts`、`src/platform/apps/adapter.qiankun.ts`。
- 查看认证、回调与 Token 流程时，优先看 `src/runtime/auth`、`src/runtime/boot`。
- 查看 HTTP、签名与 Mock 时，优先看 `src/components/http`。
- 查看页面生成器时，优先看 `src/shared/generator`。
- 查看资源配置生成时，优先看 `src/shared/config-util`。
- 查看主壳直链跳转时，优先看 `src/shared/utils/mode.util.ts` 与 `src/shared/utils/shell-gateway.util.ts`。

## 8. 核心业务流程

本章回答“这些能力在运行时是如何串起来工作的”。

#### 1. 独立运行与主壳接入主线

- 开发阶段可通过 `VITE_RUN_MODE=alone` 让子应用独立运行。
- 如果是集成意图但当前未被 qiankun 挂载，子应用会优先跳转到 `g2rain-main-shell` 网关入口。
- 联调阶段应把子应用部署到测试环境，并由主壳统一装载验证完整流程。
- 这一主线解决的是“单页调试”和“平台集成验证”两种场景之间的切换问题。

#### 2. 子应用挂载与启动装配主线

- `main.ts` 负责判断运行场景并创建挂载容器。
- `platform/apps/adapter.qiankun.ts` 统一注册 qiankun 的 `bootstrap / mount / unmount` 生命周期。
- `runtime/boot` 初始化路由、资源、权限与 HTTP 环境。
- 这一主线保证了子应用在独立运行和主壳运行两种模式下都能稳定启动。

#### 3. CRUD 页面生成主线

- 开发者执行 `npm run build:generate -- --tables=<table>`。
- 生成器根据模板输出 `src/views/<table>/index.vue`、`api.ts`、`type.ts`，按需生成 `mock.ts`。
- 同时更新 `src/views/route-map.ts`。
- 这一主线解决的是管理端大量标准化页面的快速交付问题。

#### 4. 资源配置生成主线

- 开发完成后执行 `npm run build:config`。
- `shared/config-util` 解析 `src/views/route-map.ts`。
- 生成页面资源、页面元素与接口资源配置文件。
- 这些配置可进一步导入平台，快速完成应用资源登记。

#### 5. 前端安全协同主线

- 前端通过 `components/http/sign.ts` 请求 `/keys/iam-key-id` 与 `/keys/iam-public-key` 获取 IAM 公钥信息。
- 请求 `/lua/sign_code` 时，由 OpenResty + Lua 协同完成签名能力输出。
- `nginx/default.conf.template` 负责把 `/api`、`/auth`、`/keys`、`/lua` 等路径串入统一安全链路。
- 这一主线解决的是前端如何与平台身份、网关和 IAM 协同，而不是单纯直接调接口。

## 9. 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run build:generate -- --tables=dict
npm run build:config
./build.sh
./build.sh --image g2rain/g2rain-manager-app --tag latest --build-mode production
```

## 10. 质量与测试

- 当前扫描未识别到独立测试目录。
- 当前质量保障主要依赖 TypeScript 编译、页面联调、主壳集成验证与生成器输出验证。
- 后续建议优先补充运行模式切换、生成器输出、配置生成、认证回调与签名链路相关测试或校验脚本。

## 11. 相关仓库

- `g2rain-main-shell`：主壳与统一交互入口
- `g2rain-basis`：平台治理与资源权限底座
- `g2rain-iam`：统一身份认证与令牌服务
- `g2rain-gateway-webmvc`：网关与接入安全协同实现之一
- `g2rain-gateway-webflux`：网关与接入安全协同实现之一
- `g2rain-app-template`：子应用模板仓库
- `g2rain-app-cli`：子应用初始化 CLI

## 12. 使用建议

- 适合作为平台管理端子应用长期承载治理类页面，而不是把所有前端能力继续堆入主壳。
- 开发阶段可独立运行，联调阶段应接入主壳验证完整流程。
- 新增页面时优先保持 `src/views` 的目录规范与生成器兼容性。
- 生产环境应把运行时地址、签名相关参数与密钥材料统一纳入安全配置体系。

## 13. 贡献指南

欢迎通过文档改进、Issue 反馈、测试补充、代码优化、功能增强等形式参与贡献。

建议流程：
1. Fork 本仓库
2. 创建特性分支
3. 提交修改
4. 推送分支
5. 提交 Pull Request

提交前请尽量确保：
- 遵循现有技术栈与代码规范
- 更新相关文档
- 如涉及生成器、运行模式或安全链路，补充必要验证

## 14. 许可证

本项目基于 [Apache 2.0许可证](LICENSE) 开源。

## 15. 联系我们

- **站点**: https://www.g2rain.com/
- **Issues**: [GitHub Issues](https://github.com/g2rain/g2rain/issues)
- **讨论**: [GitHub Discussions](https://github.com/g2rain/g2rain/discussions)
- **邮箱**: g2rain_developer@163.com

## 16. 致谢

感谢所有为这个项目做出贡献的开发者们。

如果这个项目对您有帮助，欢迎 Star 支持。
