# g2rain-manager-app

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

谷雨开源 SaaS 平台 - **管理端** qiankun 子应用，支持独立运行与由主壳加载。

**生态**：主壳 [g2rain-main-shell](https://github.com/g2rain/g2rain-main-shell)；通用子应用模板 [g2rain-app-template](https://github.com/g2rain/g2rain-app-template) 与脚手架 [create-g2rain-app](https://github.com/g2rain/g2rain-app-cli)；基建向子应用 [g2rain-infra-app](https://github.com/g2rain/g2rain-infra-app)。**本仓库**侧重管理控制台能力与权限、配置生成等。

## 📋 目录

- [项目目录结构](#-项目目录结构)
- [快速开始](#-快速开始)
- [环境变量配置](#-环境变量配置)
- [Docker 部署](#-docker-部署)
- [开发指南](#-开发指南)
- [权限控制](#-权限控制)
- [更多文档](#-更多文档)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)
- [联系我们](#-联系我们)
- [致谢](#-致谢)

## 📁 项目目录结构

```
g2rain-manager-app/
├── src/                          # 源代码目录
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 应用入口文件
│   ├── env.d.ts                  # 环境变量类型定义
│   │
│   ├── platform/                 # 平台层（核心功能）
│   │   ├── boot/                 # 应用启动模块
│   │   │   ├── index.ts          # 启动入口
│   │   │   ├── resource.ts       # 资源管理
│   │   │   ├── router.ts        # 路由生成
│   │   │   ├── permission.ts     # 权限控制
│   │   │   ├── plugin.ts         # Vue 插件
│   │   │   └── types.ts          # 资源类型定义
│   │   ├── event/                # 事件系统
│   │   ├── stores/               # Pinia 状态管理
│   │   │   ├── token.store.ts    # Token 存储
│   │   │   ├── setup.ts          # Store 初始化
│   │   │   └── index.ts          # Store 导出
│   │   └── types/                 # 类型定义
│   │
│   ├── router/                    # 路由配置
│   │   ├── index.ts              # 路由主文件
│   │   └── auth/                 # 认证相关路由
│   │
│   ├── runtime/                  # 运行时模块
│   │   ├── auth/                 # 认证服务（SSO）
│   │   ├── env/                  # 环境变量管理
│   │   ├── http/                 # HTTP 客户端
│   │   │   ├── axios.ts          # HTTP 客户端实现
│   │   │   ├── interceptors.ts  # 请求/响应拦截器
│   │   │   └── mock/             # Mock 数据
│   │   ├── qiankun/              # qiankun 集成
│   │   └── sign/                 # DPoP 签名
│   │
│   ├── shared/                    # 共享工具
│   │   ├── config-util/           # 配置生成工具
│   │   │   ├── cli.ts            # CLI 入口
│   │   │   ├── parser/           # 解析器（路由、Vue、API）
│   │   │   ├── generator/        # 生成器（JSON）
│   │   │   └── config/          # 生成的配置文件
│   │   ├── generator/             # 代码生成器
│   │   │   ├── cli.ts            # CLI 入口
│   │   │   ├── command/          # 生成命令
│   │   │   ├── core/             # 核心逻辑
│   │   │   ├── template/         # EJS 模板
│   │   │   └── util/             # 工具函数
│   │   └── utils/                # 工具函数
│   │
│   └── views/                    # 视图层（主要开发空间）
│       ├── auth/                 # 认证相关页面
│       ├── Home.vue              # 首页
│       └── route-map.ts          # 路由映射配置
│
├── lua/                          # Lua 脚本（用于应用签名）
│   ├── sign.lua                  # 签名脚本
│   └── keys/                     # 密钥文件目录
│
├── nginx/                        # Nginx 配置
│   ├── default.conf.template     # Nginx 配置模板
│   └── docker-entrypoint.sh     # Docker 启动脚本
│
├── vite-plugin-env-config.ts     # 环境变量配置插件
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── Dockerfile                    # Docker 构建文件
└── package.json                  # 项目依赖

```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

应用将在 `http://localhost:3001` 启动（端口可通过 `VITE_SERVER_PORT` 环境变量配置）。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览构建结果

```bash
npm run preview
```

### 代码生成

根据数据库表生成代码（View、API、Mock、Type）：

```bash
npm run build:generate -- --tables=dict
```

### 配置生成

根据现有代码生成资源配置（页面、页面元素、API端点）：

```bash
npm run build:config
```

## ⚙️ 环境变量配置

### 本地开发配置

在项目根目录创建 `.env` 文件（或 `.env.local`），配置以下变量：

```env
# 应用配置
VITE_APPLICATION_CODE=g2rain-test-app
VITE_CONTEXT_PATH=/test

# 后端服务地址
VITE_BACKEND_ORIGIN=http://localhost:8080
VITE_IAM_BACKEND_ORIGIN=http://localhost:8080

# SSO 配置
VITE_SSO_BASE_URL=http://localhost:8080
VITE_AUTH_END_POINT=/auth/authorize
VITE_REDIRECT_URI=/sso_callback
VITE_TOKEN_END_POINT=/auth/token

# Mock 配置
VITE_MOCK_ENABLED=true

# 开发服务器端口
VITE_SERVER_PORT=3001
```

### 环境变量说明

| 变量名 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| `VITE_APPLICATION_CODE` | 应用代码 | `g2rain-test-app` | ✅ |
| `VITE_CONTEXT_PATH` | 上下文路径 | `/test` | ✅ |
| `VITE_BACKEND_ORIGIN` | 后端服务地址 | `http://localhost:8080` | ✅ |
| `VITE_IAM_BACKEND_ORIGIN` | IAM 后端地址 | `http://localhost:8080` | ✅ |
| `VITE_SSO_BASE_URL` | SSO 跳转基础地址（不包含路径） | `http://localhost:8080` | ✅ |
| `VITE_AUTH_END_POINT` | 认证端点路径 | `/auth/authorize` | ✅ |
| `VITE_REDIRECT_URI` | SSO 回调路径 | `/sso_callback` | ✅ |
| `VITE_TOKEN_END_POINT` | Token 端点路径 | `/auth/token` | ✅ |
| `VITE_MOCK_ENABLED` | 是否启用 Mock | `true` 或 `false` | ❌ |
| `VITE_SERVER_PORT` | 开发服务器端口 | `3001` | ❌ |

**注意**：`VITE_APPLICATION_CODE` 用于从资源接口动态加载路由和权限配置。如果未配置，将使用静态路由配置。

### 生产环境配置

生产环境使用 `.env.production` 文件，配置方式与 `.env` 相同。注意：

- `VITE_CONTEXT_PATH` 在构建时确定，使用固定值
- `VITE_SSO_BASE_URL` 使用占位符 `__SSO_BASE_URL__`，在 Docker 容器启动时替换

## 🐳 Docker 部署

### 构建镜像

```bash
docker build -t g2rain/g2rain-manager-app:latest .
```

### 运行容器

```bash
docker run -d \
  -p 8080:80 \
  -e CONTEXT_PATH=/test \
  -e SSO_BASE_URL=https://sso.example.com \
  -e GATEWAY_HOST=gateway.example.com \
  -e GATEWAY_PORT=80 \
  -e IAM_HOST=iam.example.com \
  -e IAM_PORT=80 \
  g2rain-app:latest
```

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `CONTEXT_PATH` | 上下文路径 | `/test` |
| `SSO_BASE_URL` | SSO 基础地址 | `https://sso.example.com` |
| `GATEWAY_HOST` | 网关主机 | `gateway.example.com` |
| `GATEWAY_PORT` | 网关端口 | `80` |
| `IAM_HOST` | IAM 主机 | `iam.example.com` |
| `IAM_PORT` | IAM 端口 | `80` |

## 💻 开发指南

### 代码生成器

项目提供了强大的代码生成器，可以根据数据库表自动生成完整的 CRUD 代码。

#### 生成代码

```bash
npm run build:generate -- --tables=dict
```

#### 生成的文件

对于每个表（如 `dict`），会生成以下文件：

- `src/views/{table}/index.vue` - 页面组件（包含查询、分页、新增、编辑、删除）
- `src/views/{table}/api.ts` - API 服务类
- `src/views/{table}/type.ts` - TypeScript 类型定义
- `src/views/{table}/mock.ts` - Mock 数据

#### 自动更新

生成器会自动更新以下文件：

- `src/views/route-map.ts` - 添加路由映射
- `src/views/api/index.ts` - 导出 API（如果存在）
- `src/views/index.ts` - 导出类型（如果存在）

#### 生成器选项

```bash
# 生成多个表
npm run build:generate -- --tables=dict,role,menu

# 生成时包含 Mock 数据
npm run build:generate -- --tables=dict --mock

# 不生成 View 组件
npm run build:generate -- --tables=dict --no-view
```

### 配置生成工具

配置生成工具用于从现有代码中提取资源配置信息，生成 JSON 配置文件供后端使用。

#### 生成配置

```bash
npm run build:config
```

#### 生成的配置文件

配置会生成到 `src/shared/config-util/config/` 目录：

- `pages.json` - 页面资源配置
- `page-elements.json` - 页面元素配置（按钮权限等）
- `api-endpoints.json` - API 端点配置
- `resources.json` - 完整资源配置（包含以上所有）

#### 配置来源

- **页面资源**：从 `src/views/route-map.ts` 解析
- **页面元素**：从 Vue 文件中解析 `v-permission` 指令
- **API 端点**：从 API 服务文件中解析接口调用

### 动态路由加载

项目支持从后端资源接口动态加载路由，实现基于权限的路由管理。

#### 启用动态路由

在 `.env` 文件中配置应用编码：

```env
VITE_APPLICATION_CODE=g2rain-manager-app
```

应用启动时会自动从 `/basis/auth/resource` 接口加载路由配置。

#### 路由优先级

1. **资源路由**：如果配置了 `VITE_APPLICATION_CODE`，优先使用资源接口的路由
2. **静态路由**：如果资源加载失败或未配置，使用 `route-map.ts` 中的静态路由

### 权限控制系统

项目实现了完整的权限控制系统，支持页面元素权限和 API 权限。

#### 页面元素权限

使用 `v-permission` 指令控制按钮显示：

```vue
<template>
  <el-button v-permission="'dict:add'" @click="handleCreate">新增</el-button>
  <el-button v-permission="'dict:edit'" @click="handleEdit">编辑</el-button>
  <el-button v-permission="'dict:delete'" @click="handleDelete">删除</el-button>
</template>
```

#### 权限状态

页面元素支持两种状态：

- `enabled`：显示且可点击（默认）
- `visible`：显示但不可点击（禁用状态）

#### API 权限

API 权限检查已集成到 HTTP 拦截器中，会自动检查每个请求的权限。如果权限不足，会抛出 `API_PERMISSION_DENIED` 错误。

### views 目录 - 主要开发空间

`src/views` 目录是主要的开发空间，包含所有业务页面和 API 定义。

#### 目录结构

```
views/
├── auth/              # 认证相关页面
├── Home.vue           # 首页
└── route-map.ts       # 路由映射配置
```

### 新增功能模块

#### 使用代码生成器（推荐）

使用代码生成器可以快速生成完整的模块代码：

```bash
# 1. 生成代码
npm run build:generate -- --tables=dict

# 2. 检查生成的文件
# - src/views/dict/index.vue
# - src/views/dict/api.ts
# - src/views/dict/type.ts
# - src/views/dict/mock.ts

# 3. 根据需要调整生成的代码
```

#### 手动新增模块步骤

1. **创建 API 文件**

在 `src/views/` 目录下创建模块目录和 API 文件，例如 `src/views/dict/api.ts`：

```typescript
import { http } from '@runtime/http';
import type { Dict, DictPayload, DictQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

export class DictApi {
  static async page(
    params: DictQuery & PageSelectListDto,
  ): Promise<PageData<Dict>> {
    const res = await http.get<PageData<Dict>>('/dict/page', params);
    return res.data;
  }

  static async save(payload: DictPayload): Promise<Dict> {
    const res = await http.post<Dict>('/dict/save', payload);
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http.delete(`/dict/${id}`);
  }
}
```

2. **创建类型定义文件**

在 `src/views/dict/` 目录下创建类型文件，例如 `src/views/dict/type.ts`：

```typescript
import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

export interface Dict extends BaseVo {
  type: string;
  name: string;
  code: string | null;
}

export interface DictPayload {
  id?: number;
  type: string;
  name: string;
  code?: string | null;
}

export interface DictQuery extends BaseSelectListDto {
  type?: string;
  name?: string;
  code?: string;
}
```

3. **创建页面组件**

在 `src/views/dict/` 目录下创建页面组件，例如 `src/views/dict/index.vue`：

```vue
<template>
  <div class="dict-page">
    <!-- 参考其他页面的实现 -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { DictApi } from './api';
import type { Dict, DictPayload, DictQuery } from './type';

// 参考其他页面的实现逻辑
</script>
```

4. **添加路由配置**

在 `src/views/route-map.ts` 中添加路由映射：

```typescript
export const routeMap: Record<string, ViewRouteConfig> = {
  '/': {
    component: () => import('@/views/Home.vue'),
    name: 'Root',
    meta: { title: '首页', requiresAuth: true },
  },
  '/home': {
    component: () => import('@/views/Home.vue'),
    name: 'Home',
    meta: { title: '首页', requiresAuth: true },
  },
  '/dict': {
    component: () => import('@/views/dict/index.vue'), // 新增
    name: 'Dict',
    meta: { title: '字典配置', requiresAuth: true },
  },
};
```

### 路由添加说明

路由配置统一在 `src/views/route-map.ts` 文件中管理，使用统一的 `routeMap`：

```typescript
export interface ViewRouteConfig {
  component: () => Promise<unknown>;
  name?: string;
  meta: {
    title: string;
    requiresAuth: boolean;
    showInHome?: boolean;
  };
}

export const routeMap: Record<string, ViewRouteConfig> = {
  '/path': {
    component: () => import('@/views/Component.vue'),
    name: 'RouteName',
    meta: { title: '页面标题', requiresAuth: true, showInHome: true },
  },
};
```

#### 添加新路由

1. 在 `routeMap` 中添加一条完整的 `ViewRouteConfig` 配置

路由会自动注册到 Vue Router，无需额外配置。

### Mock 数据更新

Mock 数据用于本地开发时模拟后端接口响应。

#### Mock 数据位置

Mock 数据定义在 `src/runtime/http/mock/data.ts` 文件中。

#### Mock 数据格式

Mock 数据使用 URL 路径作为 key，支持精确匹配和通配符匹配：

```typescript
export const mockDataMap: MockDataMap = {
  // 精确匹配
  '/api/dict': { data: [...] },
  
  // 通配符匹配（支持 *）
  '/api/dict/*': { data: [...] },
  
  // 函数形式（支持动态生成）
  '/api/dict/page': (config: AxiosRequestConfig) => {
    const params = config.params || {};
    return { data: { records: [...], total: 100 } };
  },
};
```

#### 添加 Mock 数据

1. **静态数据**

```typescript
'/api/example': {
  requestId: '@guid',
  status: 200,
  data: { id: 1, name: '示例' },
}
```

2. **动态数据（使用函数）**

```typescript
'/api/example/page': (config: AxiosRequestConfig) => {
  const params = config.params || {};
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;
  
  return {
    requestId: '@guid',
    status: 200,
    data: {
      pageNum,
      pageSize,
      total: 100,
      records: [...],
    },
  };
},
```

3. **使用 Mock.js 生成随机数据**

```typescript
import Mock from 'mockjs';

'/api/example': () => {
  return Mock.mock({
    requestId: '@guid',
    status: 200,
    data: {
      'list|10': [{
        'id|+1': 1,
        'name': '@cword(3,8)',
        'email': '@email',
      }],
    },
  });
},
```

#### 启用 Mock

在 `.env` 文件中设置：

```env
VITE_MOCK_ENABLED=true
```

或者在请求头中添加：

```typescript
http.get('/api/example', params, {
  headers: {
    'x-g2rain-mock': 'true',
  },
});
```

#### Mock 数据优先级

1. 如果请求头中包含 `x-g2rain-mock: true`，强制使用 Mock
2. 如果 `VITE_MOCK_ENABLED=true`，自动使用 Mock（如果存在）
3. 否则使用真实接口

## 🔐 权限控制

### 页面元素权限

页面元素权限通过 `v-permission` 指令实现，支持两种状态：

- **enabled**：显示且可点击（默认）
- **visible**：显示但不可点击（禁用状态）

```vue
<template>
  <!-- enabled 状态：显示且可点击 -->
  <el-button v-permission="'dict:add'">新增</el-button>
  
  <!-- visible 状态：显示但不可点击（需要在后端配置 pageElementStatus='visible'） -->
  <el-button v-permission="'dict:edit'">编辑</el-button>
</template>
```

### API 权限

API 权限检查已集成到 HTTP 拦截器中，会自动检查每个请求的权限。权限配置从后端资源接口 `/basis/auth/resource` 获取。

### 权限配置

权限配置通过配置生成工具生成，然后同步到后端数据库：

```bash
# 1. 生成配置
npm run build:config

# 2. 将生成的 JSON 文件同步到后端
# - pages.json → resource_page 表
# - page-elements.json → resource_page_element 表
# - api-endpoints.json → resource_api_endpoint 表
```

## 📚 更多文档

- [架构文档](./architecture.md) - 了解项目架构和设计原理
- [API 文档](./docs/api.md) - API 接口文档（如有）

## 🤝 贡献指南

我们欢迎所有形式的贡献！

**Issue 与讨论**请统一到主仓库 [g2rain/g2rain](https://github.com/g2rain/g2rain/issues) 提交，便于集中跟踪；请在标题或正文中注明与 **g2rain-manager-app** 相关。

### 贡献流程

1. **Fork** 本仓库
2. **创建特性分支**：`git checkout -b feature/your-feature-name`
3. 本地修改后执行 `npm run build`，确保可正常编译
4. **提交更改**：`git commit -m "Add some feature"`
5. **推送分支**：`git push origin feature/your-feature-name`
6. **提交 Pull Request**

维护者信息与 `package.json` 中 `contributors` 字段一致（与 [g2rain-spring-boot-starter](https://github.com/g2rain/g2rain-spring-boot-starter) 开发者信息对齐）。

安全相关问题请见 [SECURITY.md](SECURITY.md)。

## 📄 许可证

本项目基于 [Apache 2.0许可证](LICENSE) 开源。

## 📞 联系我们

- **Issues**: [GitHub Issues](https://github.com/g2rain/g2rain/issues)
- **讨论**: [GitHub Discussions](https://github.com/g2rain/g2rain/discussions)
- **邮箱**: g2rain_developer@163.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！
