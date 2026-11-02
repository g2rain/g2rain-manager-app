# 构建与部署

## 前端构建

```bash
npm ci
npm run build
```

产物位于 `dist`，包含启动时可替换的 `env-config.js`。`dist` 已被 Git 忽略，不应提交。

## 镜像

```bash
docker build \
  --build-arg VITE_BUILD_MODE=production \
  --build-arg IMAGE_VERSION=1.0.0 \
  --build-arg VCS_REF="$(git rev-parse HEAD)" \
  -t ghcr.io/g2rain/g2rain-manager-app:1.0.0 \
  .
```

或使用项目脚本：

```bash
./build.sh --tag 1.0.0 --build-mode production
```

构建阶段使用 Node 22 Alpine，运行阶段使用 OpenResty Alpine，并从仓库 tar 包离线安装 luaossl。根目录 `Dockerfile` 是本地与 CI 唯一的镜像构建方案；入口为 `/docker-entrypoint.sh`，声明端口为 `8080`，实际监听端口仍由 `SERVER_PORT` 决定（默认 `80`）。OCI 元数据包含 title、source、url、version、revision 与许可证 `Apache-2.0`。

最终镜像包含 Vite 静态产物、OpenResty/Nginx 模板、Lua 签名脚本及由仓库内离线包编译的 luaossl。`.env.production` 是已跟踪的公开构建期配置，会进入 Docker 构建上下文；其余 `.env*` 与 `lua/keys/` 被排除。运行时镜像只创建密钥目录，不复制任何密钥。Docker 忽略规则不改变 Git 已跟踪文件的公开性；发布前仍须检查配置中没有默认 Token、私有地址或真实凭据。

## GitHub Container Registry（GHCR）发布

镜像地址为 `ghcr.io/g2rain/g2rain-manager-app:<tag>`。工作流 `.github/workflows/image.yml` 只在推送稳定版 tag 时运行，不响应普通分支、Pull Request 或手动触发。它严格校验 `v<major>.<minor>.<patch>` 格式、标签提交属于 `origin/main` 历史、标签提交中存在同名非空 `docs/releases/v<版本>.md`，并确认 tag 版本和 `package.json` 一致。

CI 使用 Node 22 执行 `npm ci` 与 `npm run build`，这是当前自动验证的全部范围（本仓没有独立 unit/E2E/lint 测试脚本）。随后它以同一 Dockerfile、`VITE_BUILD_MODE=production`、版本和完整提交 SHA 构建，并使用 `GITHUB_TOKEN` 推送 `:1.0.0` 与 `:sha-<完整提交 SHA>`。只有两个标签均推送成功才会写入 Actions Summary；工作流不创建 GitHub Release、不部署服务且不更新 `latest`。

发布按 `feature/* → develop → main` 流程进行：先将发布改动与 `docs/releases/v1.0.0.md` 合入并验证 `main`，再在该提交创建 tag：

```bash
git tag v1.0.0
git push origin v1.0.0
```

首次成功推送后，如需匿名拉取，请在 GitHub Packages 的包页打开 **Package settings → Change visibility → Public**。若组织策略禁止此操作，请联系组织管理员。已有同名包若出现 `denied`，优先在 **Package settings → Actions access** 授予本仓库 Actions 写权限，并检查组织 Packages 策略；`packages: write` 本身不保证这些设置已满足。

## 启动示例

```bash
docker run --rm -p 8080:8080 \
  -e SERVER_PORT=8080 \
  -e CONTEXT_PATH=/manager \
  -e GATEWAY_HOST=gateway \
  -e GATEWAY_PORT=8080 \
  -e IAM_HOST=iam \
  -e IAM_PORT=8080 \
  -e SSO_BASE_URL=https://platform.example.com \
  -v /secure/manager-keys:/usr/local/openresty/nginx/lua/keys:ro \
  ghcr.io/g2rain/g2rain-manager-app:1.0.0
```

生产部署通过 Secret/只读 Volume 注入 Lua/IAM 密钥文件，不在镜像或仓库保存真实私钥；`VITE_*` 和 `env-config.js` 对浏览器用户可见，不能存放密钥。真实 Gateway/IAM 联调、浏览器访问、匿名拉取和实际部署验收必须在目标环境单独完成，不能由本地构建或 GHCR 推送推定。

## Nginx 路径

- `${CONTEXT_PATH}/api/` → Gateway 根路径。
- `${CONTEXT_PATH}/auth/` → IAM `/auth/`。
- `${CONTEXT_PATH}/doc/` → Gateway。
- `${CONTEXT_PATH}/lua/sign_code` → Lua 签名处理。
- 其他路径 → 静态资源和 SPA `index.html` 回退。

修改代理规则时验证 Context Path rewrite 后的实际上游路径，避免多删或多加一段服务前缀。

## 部署前检查

- `npm run build` 通过。
- 镜像可以在目标架构构建，luaossl 加载成功。
- `SERVER_PORT` 与 Service/Ingress 健康检查端口一致。
- `VITE_CONTEXT_PATH`、`CONTEXT_PATH`、main-shell entry/activeRule 一致。
- Gateway/IAM DNS、端口、网络策略和证书正确。
- SSO Redirect URI 与公开域名一致。
- 资源配置已导入，应用编码与 `VITE_APPLICATION_CODE` 一致。
- 静态资源、刷新路由、独立登录、qiankun mount/update/unmount 均验证。
- 日志和镜像层不包含 Token、Client 私钥或生产密钥。

## 回滚

镜像使用不可变版本 Tag，保留上一个可用镜像和对应资源配置。Manager App 发布可能同时改变前端产物与平台资源，回滚前确认两者兼容，不能只回滚镜像而保留不兼容的页面/权限配置。
