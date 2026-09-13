<p align="center">
  <img src="https://github.com/g2rain.png" alt="G2Rain" width="180" />
</p>

# g2rain-manager-app

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5.26-42B883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Qiankun](https://img.shields.io/badge/micro--frontend-Qiankun-1677FF)](https://qiankun.umijs.org/)

下一代AI软件开发范式，AI原生Agent平台，开源的企业级SaaS底座。

平台管理控制台微前端子应用，提供账号、用户、机构、资源、角色、应用、授权与审计管理界面；承载 SaaS 平台管理侧的身份、权限与应用治理操作

[官网](https://www.g2rain.com) · [完整文档](docs/index.md) · [Frontend App Profile 1.0.0](https://github.com/g2rain/g2rain/tree/architecture-v1.1.0/docs/architecture/profiles/frontend-app) · [架构偏差](docs/architecture/deviations.md) · [Issues](https://github.com/g2rain/g2rain/issues) · [Discussions](https://github.com/g2rain/g2rain/discussions)

## 目录

- 项目简介
- 平台定位
- 应用角色
- 功能概览
- 使用场景
- 核心流程
- 技术栈
- 环境要求
- 快速开始
- 配置说明
- 构建与镜像
- 代码质量与测试
- 运行示例
- 与关联仓库的关系
- 模块说明
- 职责边界
- 常见问题
- 关联仓库
- 参与贡献
- 许可证
- 联系我们
- 致谢

## 项目简介

平台管理控制台微前端子应用，提供账号、用户、机构、资源、角色、应用、授权与审计管理界面；承载 SaaS 平台管理侧的身份、权限与应用治理操作

## 平台定位

该仓库位于 g2rain 前端应用层，正式采用 `frontend-app 1.0.0`，由 main-shell 统一装载，并通过 Gateway、IAM、Basis、Infra 等平台服务完成管理操作。

## 应用角色

该仓库聚焦于 `平台账号、用户、机构、资源、角色、应用与授权管理`。

主要流程包括：
- Shell 启动与路由映射注册流程
- 子应用挂载与卸载生命周期流程
- 子应用路由同步流程
- 令牌请求、响应与失效事件流程
- Qiankun 运行时初始化与多实例子应用编排流程

## 功能概览

| 能力 | 说明 |
| --- | --- |
| 账号与用户管理 | 维护账号、用户、登录令牌、身份提供方绑定与个人访问令牌。 |
| 机构与角色权限 | 维护机构、角色、功能权限及用户角色关系。 |
| 资源与能力治理 | 维护菜单、页面、页面元素、API 资源及业务能力与功能权限关系。 |
| 应用与授权管理 | 维护应用、应用套件、应用授权和身份提供方接入配置。 |
| 审计与服务治理 | 提供审计事件、服务注册和租户身份同步等平台管理界面。 |
| 前端业务代码生成 | 读取 src/shared/generator/database.sql 中的表结构，按表生成页面、API、类型与 Mock 文件，并可更新 src/views/route-map.ts。 |
| 平台资源配置生成 | 扫描路由和页面中的静态权限指令，生成页面、页面元素及汇总资源 JSON；当前执行流程未启用 API 端点扫描。 |

## 使用场景

| 场景 | 说明 |
| --- | --- |
| 按数据库表创建业务页面骨架 | 新增后端业务表或管理页面时，使用代码生成器一次生成视图、API、类型、Mock 和路由基础文件。 |
| 生成平台资源登记配置 | 页面或按钮权限调整完成后，自动生成平台所需的页面、页面元素和汇总资源配置。 |

## 核心流程

| 流程 | 关键步骤 | 代码线索 |
| --- | --- | --- |
| 业务代码生成流程 | 更新 database.sql → 执行 build:generate 并指定 --tables → 解析表字段与注释 → 渲染页面/API/类型/Mock 模板 → 按需更新 route-map.ts → 执行 npm run build 校验 | src/shared/generator、src/shared/generator/database.sql、src/views/route-map.ts |
| 资源配置文件生成流程 | 维护 route-map.ts 与页面静态 v-permission → 执行 build:config → 扫描路由和 Vue 页面 → 去重并生成 pages.json 与 page-elements.json → 汇总为 resources.json | src/shared/config-util、src/views/route-map.ts、src/views/**/*.vue |

## 技术栈

| 类别 | 说明 |
| --- | --- |
| 运行时 | Node.js、npm |
| 前端框架 | vue、vue-router、pinia、vue-i18n、element-plus |
| 构建与类型 | vite、typescript、vue-tsc |
| 微前端 | qiankun、vite-plugin-qiankun |
| 接口与模拟 | axios、mockjs、vite-plugin-mock |
| 部署 | Docker、Nginx |

## 环境要求

- Node.js >=22
- npm
- Docker

## 快速开始

| 步骤 | 命令或位置 | 说明 |
| --- | --- | --- |
| 安装依赖 | `npm ci` | 根据锁文件安装可复现依赖。 |
| 本地开发 | `npm run dev` | 启动本地开发服务。 |
| 构建产物 | `npm run build` | 执行类型检查与前端构建，生成可发布产物。 |
| 生成业务代码 | `npm run build:generate -- --tables=<table_name>` | 从 database.sql 中选择表，生成页面、API、类型、Mock 与路由骨架；同名文件可能被覆盖。 |
| 生成资源配置 | `npm run build:config` | 开发完成后扫描路由和静态权限指令，生成平台页面与页面元素资源配置 JSON。 |
| 预览产物 | `npm run preview` | 在本地预览构建后的前端产物。 |
| 容器化 | `docker build .` | 仓库提供 Dockerfile，可按组织镜像规范封装前端运行镜像。 |

版本号以项目构建配置为准，当前识别为 `0.1.0`。

## 配置说明

### 运行配置

| 配置项 | 说明 |
| --- | --- |
| `VITE_*` | 前端运行时环境变量，通常由 Vite 与部署环境共同注入。 |

### 路由配置

| 配置项 | 说明 |
| --- | --- |
| `Context Path` | 用于控制前端应用在平台或子路径下的访问基准路径。 |

### 部署配置

| 配置项 | 说明 |
| --- | --- |
| `nginx/default.conf.template` | 容器运行时 Nginx 配置模板，用于静态资源访问和请求转发。 |

### 代码生成

| 配置项 | 说明 |
| --- | --- |
| `src/shared/generator/database.sql` | 前端业务代码生成器的表结构输入；--tables 指定的表必须存在于该文件中。 |

### 资源配置生成

| 配置项 | 说明 |
| --- | --- |
| `src/shared/config-util/config/*.json` | 由路由和静态 v-permission 生成 pages.json、page-elements.json 与 resources.json；当前 API 端点生成逻辑未启用。 |

## 构建与镜像

| 目标 | 命令 | 产物 | 说明 |
| --- | --- | --- | --- |
| 本地开发 | `npm run dev` | 本地开发服务 | 启动前端本地开发服务。 |
| 前端产物 | `npm run build` | `dist` | 执行类型检查与 Vite/TypeScript 构建，生成可发布产物。 |
| 业务代码骨架 | `npm run build:generate -- --tables=<table_name>` | `src/views/<table_name> 与 src/views/route-map.ts` | 按数据库表生成页面、API、类型和 Mock，可用 --no-view、--no-api、--no-mock、--no-route 关闭部分生成项。 |
| 平台资源配置 | `npm run build:config` | `src/shared/config-util/config/*.json` | 生成 resources.json、pages.json 和 page-elements.json，供平台资源登记或导入使用。 |
| 产物预览 | `npm run preview` | 本地预览服务 | 在本地预览构建后的前端静态产物。 |
| 容器镜像 | `docker build .` | 前端运行镜像 | 基于 Dockerfile 封装静态前端运行镜像。 |
| 构建脚本 | `./build.sh` | 脚本定义的构建结果 | 执行仓库提供的构建脚本，承载组织内镜像或发布流程。 |

## 代码质量与测试

| 检查项 | 命令 | 说明 |
| --- | --- | --- |
| Vue 类型检查 | `npm run build` | 构建流程中使用 vue-tsc 检查 Vue 与 TypeScript 类型。 |

## 运行示例

| 示例 | 方法 | 路径 | 用途 | 调用示例 |
| --- | --- | --- | --- | --- |
| 平台前端应用本地开发 | npm | `npm run dev` | 启动前端本地开发服务，便于联调页面、路由和平台运行时能力。 | `npm run dev` |
| 平台前端应用构建 | npm | `npm run build` | 执行类型检查和前端构建，生成可部署的静态产物。 | `npm run build` |
| 平台前端应用预览 | npm | `npm run preview` | 在本地预览构建后的前端产物。 | `npm run preview` |
| 按表生成业务代码 | npm | `npm run build:generate -- --tables=<table_name>` | --tables 为必填参数，多个表使用逗号分隔；该命令不会交互询问，缺少参数会直接失败。生成器会覆盖同名文件，执行前应提交或备份已有改动。 | `npm run build:generate -- --tables=<table_name>` |
| 选择性生成业务代码 | npm | `npm run build:generate -- --tables=<table_name> --no-mock --no-route` | 可通过 --no-view、--no-api、--no-mock、--no-route 跳过对应生成项。 | `npm run build:generate -- --tables=<table_name> --no-mock --no-route` |
| 生成平台资源配置 | npm | `npm run build:config` | 输出 resources.json、pages.json 和 page-elements.json；动态权限表达式无法被扫描，应使用静态 v-permission 编码。当前执行流程未生成 API 端点文件。 | `npm run build:config` |

## 与关联仓库的关系

本仓库作为平台基础前端子应用，由 g2rain-main-shell 统一装载，并通过网关调用对应平台后端服务完成管理操作。

## 模块说明

| 模块 | 职责说明 | 代码线索 |
| --- | --- | --- |
| 身份与用户管理 | 管理账号、用户、登录令牌、身份绑定和个人访问令牌。 | src/views/passport、user、login_token、passport_idp_binding、personal_static_access_token |
| 资源与权限管理 | 管理菜单、页面、元素、API、角色、功能权限与业务能力。 | src/views/resource_*、role、control_unit、control_domain |
| 应用与身份提供方 | 管理应用、授权、应用套件及企业身份提供方配置。 | src/views/application*、idp_*、tenant_idp_sync |
| 平台治理 | 提供审计事件、服务注册和运行时资源管理。 | src/views/audit_event、service_registry、src/runtime |
| 组件（src/components） | 沉淀可复用的界面与基础设施组件，包括 HTTP、微前端、权限、选择器、查询表单、表格排序、加载与错误反馈等能力。 | src/components |
| 平台适配（src/platform） | 封装平台应用模型、状态、国际化、地区语言、错误处理和微前端适配契约，隔离业务页面与平台实现细节。 | src/platform |
| 运行时（src/runtime） | 组织应用启动、路由、认证、HTTP/API、环境配置和微前端 Shell 协同，负责应用进入可运行状态。 | src/runtime |
| 共享工具（src/shared） | 提供代码生成器、资源配置生成器以及环境、HTTP、URL 等跨模块通用工具。 | src/shared/generator、src/shared/config-util、src/shared/utils |
| 业务视图（src/views） | 承载领域页面及页面内聚的 API、类型、Mock、子组件与路由映射，是主要业务功能实现目录。 | src/views、src/views/route-map.ts |

## 职责边界

该仓库主要负责：
- 账号、用户、机构、角色、资源、应用授权、身份提供方、服务注册与审计的管理端页面和交互用例。
- 本应用的静态组件注册、动态资源路由、权限呈现、国际化和错误反馈。
- 独立 SSO 模式及 qiankun mount/update/unmount、多实例隔离和主应用上下文接入。

该仓库默认不负责：
- 不拥有 IAM、Basis、Infra、Department 等服务的数据和后端业务规则。
- 不替代 Gateway 与后端服务的认证、租户隔离和权限校验。
- 不负责 main-shell 的全局菜单、Tab 和子应用注册治理。

## 常见问题

| 问题 | 可能原因 | 处理建议 |
| --- | --- | --- |
| 代码生成找不到表或覆盖已有页面 | --tables 指定的表不在 database.sql 中，或目标目录已有同名文件。 | 先同步 database.sql 并检查表名；执行前提交或备份改动，必要时通过 --no-* 关闭不需要的生成项。 |
| 资源配置缺少页面或按钮 | 权限使用动态表达式，或页面未进入 route-map.ts。 | 使用静态 v-permission 字符串并检查路由映射，再重新执行 build:config。 |

## 关联仓库

| 仓库 | 协作关系 |
| --- | --- |
| g2rain-main-shell | 提供统一入口、菜单、Tab、qiankun 装载和运行上下文。 |
| g2rain-iam | 协同完成登录认证、令牌发放、SSO 回调或前端登录态衔接。 |
| g2rain-gateway-webflux | 作为后端业务 API 的统一鉴权与转发入口。 |
| g2rain-basis | 提供应用资源、机构与平台基础数据。 |
| g2rain-infra | 提供服务注册、平台资源和基础设施管理能力。 |

## 文档导航

| 主题 | 文档 |
| --- | --- |
| 项目事实与 Agent 入口 | [docs/project.yaml](docs/project.yaml) · [AGENTS.md](AGENTS.md) |
| 架构与依赖 | [架构概览](docs/architecture/overview.md) · [层次职责](docs/architecture/layers.md) · [依赖规则](docs/architecture/dependencies.md) |
| 运行时与偏差 | [运行时流程](docs/architecture/runtime-flows.md) · [架构偏差](docs/architecture/deviations.md) |
| 页面与生成器 | [Views 规范](docs/development/views-conventions.md) · [代码生成](docs/development/code-generation.md) · [资源生成](docs/development/resource-generation.md) |
| 配置、部署与安全 | [配置](docs/operations/configuration.md) · [部署](docs/operations/deployment.md) · [安全边界](docs/security/security-boundaries.md) |
| 测试与完成定义 | [测试策略](docs/development/testing.md) · [完成定义](docs/development/definition-of-done.md) |

## 参与贡献

我们欢迎所有形式的贡献：Issue 反馈、文档改进、功能建议与代码提交。

推荐流程：

1. Fork 本仓库。
2. 创建特性分支：`git checkout -b feature/your-feature-name`。
3. 提交更改：`git commit -m "Add some feature"`。
4. 推送分支：`git push origin feature/your-feature-name`。
5. 提交 Pull Request。

代码贡献前请尽量补充必要的测试和文档，并确保构建、测试与静态检查通过。

## 许可证

本项目基于 [Apache 2.0许可证](https://github.com/g2rain/g2rain-manager-app/blob/main/LICENSE) 开源。

## 联系我们

- Issues: [GitHub Issues](https://github.com/g2rain/g2rain/issues)
- 讨论: [GitHub Discussions](https://github.com/g2rain/g2rain/discussions)
- 邮箱: g2rain_developer@163.com

## 致谢

感谢所有为 g2rain 项目提交 Issue、代码、文档、建议和使用反馈的开发者们！
