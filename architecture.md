# 架构文档

本文档从架构角度介绍项目的设计原理和核心机制。

## 📐 架构概览

项目采用分层架构设计，主要分为以下几个层次：

```
┌─────────────────────────────────────────┐
│          Views Layer (视图层)           │
│  - 业务页面组件                          │
│  - API 接口定义                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Runtime Layer (运行时层)        │
│  - HTTP 客户端                          │
│  - 认证服务 (SSO)                        │
│  - DPoP 签名                            │
│  - 环境变量管理                          │
│  - qiankun 集成                         │
│                                          │
│  功能：                                  │
│  - 通过用户操作修改平台层状态            │
│  - 监听平台层状态变更并响应              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Platform Layer (平台层)          │
│  - Store 状态管理                        │
│  - Boot 启动模块                         │
│    - 资源管理                            │
│    - 路由生成                            │
│    - 权限控制                            │
│  - 类型定义                              │
│  - 事件系统                              │
│                                          │
│  职责：                                  │
│  - 统一管理应用状态                      │
│  - 提供状态变更响应机制                  │
│  - 管理应用资源和权限                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Shared Layer (共享层)           │
│  - 工具函数                              │
│  - JWT 工具                             │
│  - 代码生成器                            │
│  - 配置生成工具                           │
└─────────────────────────────────────────┘
```

### 层次关系说明

- **平台层 (Platform Layer)**：负责统一管理应用状态，通过 Pinia Store 存储和管理所有状态数据，提供状态变更的响应机制。

- **运行时层 (Runtime Layer)**：
  - 支持通过用户操作（如登录、HTTP 请求等）修改平台层状态
  - 通过监听平台层状态变更（如 Token 状态、登录状态等）来响应并更新显示内容
  - 作为视图层和平台层之间的桥梁，处理业务逻辑和状态同步

- **视图层 (Views Layer)**：专注于业务页面展示，通过运行时层访问和修改平台层状态

- **共享层 (Shared Layer)**：提供通用的工具函数和基础能力

## 🔐 认证与授权架构

### JWT Token 生命周期管理

#### Token 结构

JWT Token 包含以下信息：

```typescript
interface Token {
  clientId: string;              // 客户端 ID
  clientPublicKey: string;       // 客户端公钥（JSON 字符串）
  applicationCodes: string[];   // 应用代码列表
  expireAt: number;              // Access Token 过期时间（Unix 时间戳）
  refreshExpireAt: number;       // Refresh Token 过期时间（Unix 时间戳）
}
```

#### Token 生命周期流程

```
┌─────────────┐
│  1. 初始化   │
│  生成 Client │
│  (密钥对)    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  2. SSO 认证 │
│  跳转到 SSO  │
│  携带公钥    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  3. 获取 Code│
│  SSO 回调    │
│  携带 code   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  4. 生成 Token│
│  使用 code + │
│  DPoP 签名   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  5. 存储 Token│
│  验证并保存  │
│  到 Store   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  6. 使用 Token│
│  HTTP 请求   │
│  自动携带    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  7. Token 刷新│
│  过期前刷新  │
│  或重新认证  │
└─────────────┘
```

#### Token Store 管理

Token 存储在 `useAccessTokenStore` (Pinia Store) 中：

```typescript
state: {
  client: Client | null;        // 客户端密钥对
  token: Token | null;           // Token 对象（反序列化）
  tokenString: string | null;    // Token 字符串（原始）
  logged: boolean;               // 登录状态
  status: 'NORMAL' | 'SSO' | 'LOGOUT';  // 状态
  tokenExpired: boolean;         // 是否过期
}
```

#### Token 验证与持久化

1. **验证流程**

```typescript
async setTokens(tokenString: string, tokenKid: string, iamKeyId: string, publicKey: string) {
  // 1. 验证 tokenKid 是否匹配
  if (tokenKid !== iamKeyId) {
    throw new Error('SSO公钥不存在');
  }
  
  // 2. 使用公钥验证 JWT
  const publicKeyJwk = await publicKeyStringToJwk(publicKey);
  const { payload } = await jwtVerify(tokenString, publicKeyJwk);
  
  // 3. 解析并存储 Token
  this.token = {
    clientId: payload.clientId,
    clientPublicKey: payload.clientPublicKey,
    applicationCodes: payload.applicationCodes,
    expireAt: payload.expireAt,
    refreshExpireAt: payload.refreshExpireAt,
  };
  
  this.logged = true;
  this.status = 'NORMAL';
}
```

2. **持久化策略**

- **独立运行模式**：使用 `localStorage` 持久化 Token
- **qiankun 模式**：不持久化，Token 由主应用管理

```typescript
persist: isIntegrateMode()
  ? false  // qiankun 模式不持久化
  : {
      key: 'g2rain_token',
      storage: localStorage,
      pick: ['client', 'token', 'tokenString', 'logged', 'tokenExpired'],
    }
```

#### Token 过期检查

```typescript
getters: {
  isLogin(): boolean {
    if (!this.client || !this.token) {
      return (this.logged = false);
    }
    
    // 检查 refreshExpireAt（刷新过期时间）
    const refreshExpireAt = new Date(this.token.refreshExpireAt * 1000);
    const now = new Date();
    
    return (this.logged = refreshExpireAt > now);
  },
  
  isAccessTokenValid(): boolean {
    if (!this.token?.expireAt) return false;
    
    const expireAt = new Date(this.token.expireAt * 1000);
    const now = new Date();
    
    return expireAt > now;
  },
}
```

### DPoP (Demonstrating Proof-of-Possession) 生命周期管理

DPoP 用于证明客户端拥有私钥，防止 Token 被盗用。

#### DPoP 结构

```typescript
interface DpopHeader {
  typ: 'dpop+jwt';
  alg: 'ES256';
  ph_alg: 'SHA-256';
  jwk: JWK;           // 客户端公钥
  kid: string;        // 客户端 ID
}

interface DpopPayload {
  htu: string;        // HTTP URI（请求 URL）
  htm: string;        // HTTP Method（请求方法）
  acd: string;        // Application Code（应用代码）
  pha: string;        // Payload Hash Algorithm（载荷哈希）
  jti: string;        // JWT ID（唯一标识）
  iat: number;        // Issued At（签发时间）
  exp: number;        // Expiration Time（过期时间，5分钟）
}
```

#### DPoP 生成流程

```
┌─────────────────┐
│ 1. 处理请求参数  │
│   - params      │
│   - data        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 2. 计算 PHA      │
│   SHA256(       │
│     params +    │
│     SHA256(data)│
│   )             │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 3. 构建 Header   │
│   - typ, alg    │
│   - jwk, kid    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 4. 构建 Payload  │
│   - htu, htm    │
│   - acd, pha    │
│   - jti, iat, exp│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 5. 使用私钥签名  │
│   生成 DPoP JWT │
└─────────────────┘
```

#### DPoP 签名实现

```typescript
export const dpopSign = async (
  url: string,
  method: string,
  params: unknown,
  data: unknown,
  applicationCode: string,
  client: Client,
  jti: string,
): Promise<string> => {
  // 1. 处理 params 和 data（在此函数内部统一规范化 params，调用方无需关心具体格式）
  const processedParams = processParams(params);
  const processedData = processData(data);
  
  // 2. 计算 PHA
  const pha = calculatePha(processedParams, processedData);
  
  // 3. 构建 Header
  const dpopHeader = generateDpopHeader(client.publicKey, client.clientId);
  
  // 4. 构建 Payload
  const dpopPayload: DpopPayload = {
    htu: url,
    htm: method.toUpperCase(),
    acd: applicationCode,
    pha: pha,
    jti: jti,
  };
  
  // 5. 生成 JWT
  return await generateDpop(dpopHeader, dpopPayload, client.privateKey);
};
```

#### DPoP 使用场景

1. **Token 生成请求**

```typescript
// 在 generateToken 中使用
headers.DPoP = await dpopSign(
  env.VITE_TOKEN_END_POINT,
  'post',
  '',
  dataArrayBuffer,
  env.VITE_APPLICATION_CODE,
  accessTokenStore.client,
  jti,
);
```

2. **应用签名请求**

```typescript
// 调用 Lua 签名接口时使用
headers['Application-DPoP'] = await callSignApi(
  axiosInstance,
  data,
  headers.DPoP,
  jti,
);
```

### 应用身份信息签名 - Lua 脚本

应用签名用于证明应用的身份，由后端 Lua 脚本处理。

#### Lua 脚本位置

- `lua/sign.lua` - 签名核心逻辑
- `lua/sign_api.lua` - 签名 API 接口
- `lua/config.lua` - 配置文件

#### 签名流程

```
┌─────────────────┐
│ 1. 前端请求      │
│   POST /lua/    │
│   sign_code     │
│   + DPoP Header │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 2. Nginx 接收    │
│   转发到 Lua     │
│   处理          │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 3. Lua 验证      │
│   - 验证 DPoP    │
│   - 提取信息     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 4. Lua 签名      │
│   使用应用私钥   │
│   生成签名 Token │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 5. 返回签名      │
│   给前端        │
└─────────────────┘
```

#### Lua 脚本关键功能

1. **DPoP 验证**

```lua
-- 验证 DPoP Token
local dpop_token = ngx.req.get_headers()["DPoP"]
if not dpop_token then
    ngx.status = 401
    ngx.say('{"error": "Missing DPoP header"}')
    ngx.exit(401)
end

-- 解析并验证 DPoP
local dpop_payload = verify_dpop(dpop_token)
```

2. **应用签名生成**

```lua
-- 使用应用私钥签名
local private_key = load_private_key()
local signature = sign_with_key(dpop_payload, private_key)

-- 返回签名 Token
ngx.header.content_type = "application/json"
ngx.say('{"token": "' .. signature .. '"}')
```

#### 前端调用

```typescript
public async callSignApi(
  axiosInstance: AxiosInstance,
  data: any,
  headerDPoP: string,
  jti: string,
): Promise<string> {
  const response = await axiosInstance.post(
    APPLICATION_SIGN_URL() + '?jti=' + jti,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        DPoP: headerDPoP,
        'x-g2rain-mock': isMockEnabled() ? 'true' : 'false',
      },
    },
  );
  return response.data.token;
}
```

## 🗄️ Store 存储的数据

### Token Store (`useAccessTokenStore`)

存储认证相关的所有数据：

```typescript
state: {
  // 客户端信息
  client: {
    clientId: string;           // 客户端 ID
    publicKey: JWK;              // 公钥（JWK 格式）
    privateKey: JWK;             // 私钥（JWK 格式）
  } | null,
  
  // Token 信息
  token: {
    clientId: string;
    clientPublicKey: string;
    applicationCodes: string[];
    expireAt: number;            // Access Token 过期时间
    refreshExpireAt: number;     // Refresh Token 过期时间
  } | null,
  
  tokenString: string | null,    // Token 原始字符串
  
  // 状态信息
  logged: boolean;               // 是否已登录
  status: 'NORMAL' | 'SSO' | 'LOGOUT';  // 当前状态
  tokenExpired: boolean;         // Token 是否过期
}
```

### Store 持久化

- **独立运行模式**：使用 `localStorage` 持久化
- **qiankun 模式**：不持久化，由主应用管理

持久化字段：
- `client` - 客户端密钥对
- `token` - Token 对象
- `tokenString` - Token 字符串
- `logged` - 登录状态
- `tokenExpired` - 过期状态

## 🔄 Runtime 与 Store 交互

### HTTP 拦截器与 Token

HTTP 拦截器自动从 Store 获取 Token 并添加到请求头：

```typescript
// 请求拦截器
requestInterceptor: (config) => {
  const tokenStore = getAccessTokenStore();
  
  // 获取 Token
  if (tokenStore.tokenString) {
    config.headers.Authorization = `Bearer ${tokenStore.tokenString}`;
  }
  
  // 添加 DPoP（如果需要）
  if (needsDpop(config)) {
    const dpop = await generateDpop(...);
    config.headers.DPoP = dpop;
  }
  
  return config;
}
```

### SSO 服务与 Store

SSO 服务通过 Store 管理认证状态：

```typescript
class SSOService {
  // 1. 初始化 Client（存储到 Store）
  async redirectToSSO() {
    const store = useAccessTokenStore();
    if (!store.client) {
      const client = await generateClient();
      store.client = client;  // 存储到 Store
    }
    // 跳转到 SSO
  }
  
  // 2. 生成 Token（存储到 Store）
  async generateToken(code: string) {
    // ... 获取 Token
    await store.setTokens(token, keyId, iamKeyId, publicKey);
  }
  
  // 3. 监听 Token 变化
  async listenTokenChanges() {
    watch(
      () => tokenStore.logged,
      async (newLogged) => {
        if (!newLogged) {
          await this.redirectToSSO();
        }
      },
    );
  }
}
```

### qiankun 集成与 Store

在 qiankun 模式下，Token 由主应用传递：

```typescript
// 从主应用接收 Token
export async function initTokenFromProps(props: QiankunProps) {
  if (props.token && props.tokenKid) {
    const store = useAccessTokenStore();
    const iamKeyId = await fetchIamKeyId();
    const publicKey = await fetchIamPublicKey();
    
    // 存储 Token 到 Store
    await store.setTokens(
      props.token,
      props.tokenKid,
      iamKeyId,
      publicKey,
    );
  }
}
```

### Store 状态变更流程

```
┌─────────────────┐
│ Runtime 操作     │
│ (SSO/HTTP/等)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 调用 Store Action│
│ setTokens()      │
│ logout() 等      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Store State 更新 │
│ - token          │
│ - logged         │
│ - status         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 触发响应式更新   │
│ - Vue 组件       │
│ - Watch 监听     │
│ - 拦截器         │
└─────────────────┘
```

## 🔗 模块间交互

### HTTP 客户端 → Store

```typescript
// HTTP 拦截器从 Store 获取 Token
const tokenStore = useAccessTokenStore();
const token = tokenStore.tokenString;
```

### SSO 服务 → Store

```typescript
// SSO 服务更新 Store 状态
const store = useAccessTokenStore();
await store.setTokens(token, keyId, iamKeyId, publicKey);
```

### qiankun → Store

```typescript
// qiankun 初始化时从 props 设置 Store
await initTokenFromProps(props);
```

### Store → Vue 组件

```typescript
// Vue 组件响应式使用 Store
const tokenStore = useAccessTokenStore();
const isLogged = computed(() => tokenStore.logged);
```

## 📊 数据流图

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│   SSO    │─────▶│  Store   │◀─────│ qiankun  │
│ Service  │      │          │      │  Props   │
└──────────┘      └─────┬────┘      └──────────┘
                        │
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│   HTTP   │      │   Vue    │      │  Watch   │
│ Client   │      │Component │      │Listener  │
└──────────┘      └──────────┘      └──────────┘
```

## 🔒 安全机制

1. **JWT 验证**：使用 IAM 公钥验证 Token 签名
2. **DPoP 绑定**：Token 与请求绑定，防止重放攻击
3. **密钥管理**：客户端密钥对存储在 Store，不暴露私钥
4. **Token 过期**：自动检查过期时间，及时刷新
5. **HTTPS 传输**：生产环境使用 HTTPS 加密传输

## 🚀 应用启动与资源管理

### Boot 模块架构

Boot 模块负责应用启动时的资源加载和初始化：

```
┌─────────────────────────────────────────┐
│          Boot Module                    │
│  ┌───────────────────────────────────┐  │
│  │  Resource Manager                 │  │
│  │  - 加载页面资源                    │  │
│  │  - 加载页面元素                    │  │
│  │  - 加载 API 端点                   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Router Generator                 │  │
│  │  - 从资源生成路由                  │  │
│  │  - 动态组件加载                    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Permission System                │  │
│  │  - 页面元素权限                    │  │
│  │  - API 权限检查                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 资源加载流程

```
┌─────────────────┐
│ 1. 应用启动      │
│    main.ts       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 2. 初始化资源    │
│    initApplication│
│    Resources()   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 3. 请求资源接口  │
│    GET /basis/  │
│    auth/resource│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 4. 解析资源数据  │
│    - pages      │
│    - elements   │
│    - endpoints  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 5. 生成路由      │
│    initRoutes   │
│    FromResources│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 6. 注册权限插件  │
│    permission   │
│    Plugin       │
└─────────────────┘
```

### 权限控制架构

权限控制系统分为两个层面：

#### 1. 页面元素权限

```typescript
// 权限状态
type PageElementStatus = 'visible' | 'enabled';

// 权限检查
class PageElementPermission {
  static getStatus(elementCode: string): PageElementStatus | undefined;
  static isEnabled(elementCode: string): boolean;
  static isVisible(elementCode: string): boolean;
}

// Vue 指令
v-permission="'user:add'"
```

#### 2. API 权限

```typescript
// API 权限检查
class ApiPermission {
  static has(apiUrl: string, method: string): boolean;
  static checkRequest(url: string, method: string, baseURL?: string): boolean;
}

// HTTP 拦截器中自动检查
requestInterceptor: (config) => {
  if (!ApiPermission.checkRequest(url, method)) {
    throw new Error('API_PERMISSION_DENIED');
  }
}
```

### 代码生成器架构

代码生成器采用模板驱动的方式生成代码：

```
┌─────────────────┐
│ 1. 解析数据库表  │
│    parseTable()  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 2. 加载模板      │
│    EJS Template  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 3. 渲染模板      │
│    render()     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 4. 写入文件      │
│    writeFile()  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 5. 更新路由      │
│    ts-morph     │
└─────────────────┘
```

### 配置生成器架构

配置生成器从现有代码中提取配置信息：

```
┌─────────────────┐
│ 1. 解析路由      │
│    route-map.ts  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 2. 解析 Vue 文件 │
│    v-permission  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 3. 解析 API 文件 │
│    http.get/post│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 4. 生成 JSON     │
│    resources.json│
└─────────────────┘
```

## 📝 总结

项目采用分层架构，通过 Store 统一管理状态，Runtime 层提供核心服务，Views 层专注于业务实现。认证流程通过 JWT + DPoP 双重验证确保安全性，Lua 脚本提供应用签名能力，qiankun 集成支持微前端架构。

新增的 Boot 模块实现了基于资源的动态路由加载和权限控制，代码生成器和配置生成器提供了高效的开发工具，大大提升了开发效率。

