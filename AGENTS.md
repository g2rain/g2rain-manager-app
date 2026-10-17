# g2rain-manager-app Agent Instructions

本文件是 AI Coding 在本项目中的执行入口。事实来源位于 `docs`、当前源码、`package.json` 和环境/部署文件。

## 项目定位

- 类型：Vue 3 平台管理微前端 App
- 项目事实：`docs/project.yaml`
- 文档入口：`docs/index.md`
- 中央 Profile：`frontend-app 1.0.0`
- 固定基线：`architecture-v1.1.0`
- Profile 路径：`docs/architecture/profiles/frontend-app`
- 本项目偏差：`docs/architecture/deviations.md`

本项目承载账号、用户、机构、角色权限、平台资源、应用授权、身份提供方、服务注册和审计等管理界面。它负责前端用例和交互，不拥有对应后端领域数据，也不替代 IAM、Gateway 或各平台服务的鉴权与业务规则。

## 开始前

按任务范围读取：

1. `docs/project.yaml`
2. 中央 `frontend-app 1.0.0` Profile
3. `docs/architecture/deviations.md`
4. `docs/architecture/overview.md`
5. `docs/architecture/layers.md`
6. `docs/architecture/dependencies.md`
7. `docs/development/code-conventions.md`
8. `docs/development/testing.md`
9. `docs/development/definition-of-done.md`
10. 当前需求对应的 `docs/requirements`、`docs/design` 或 `docs/decisions`

涉及页面、组件、生成器、配置、认证、安全或部署时，继续读取对应专题文档。

## 实现约束

- 保持目标依赖方向：`views → runtime → platform → components → shared`；`main.ts`/`App.vue` 是组合根。
- 不新增 components 对 platform/runtime/views、platform 对 runtime/views 的反向依赖；已知偏差仅用于迁移，不能作为新代码范例。
- 业务页面、页面 API、类型和 Mock 保留在 `src/views`；新增页面同步 `src/views/route-map.ts`。
- 可复用模块通过稳定 `index.ts` 暴露公共 API，不深度导入内部实现。
- 使用 Vue Composition API 和 `<script setup lang="ts">`；避免新增 `any`，第三方边界确需使用时限制范围并说明原因。
- 独立模式与 qiankun 集成模式都要考虑；集成模式保持 `appKey` 多实例隔离和 mount/update/unmount 配对清理。
- 前端权限只控制界面呈现，不能替代 Gateway 和后端服务鉴权。
- Token、私钥、生产域名、真实个人数据和敏感配置不得写入源码、Mock、生成结果、文档或提交记录。
- 修改路由或静态权限点后评估并运行 `npm run build:config`；当前工具不生成 API endpoint，不能伪造生成结果。
- 运行代码生成器前检查 Git 状态；生成器会覆盖文件，生成后必须 Review Diff。
- 修改 API、页面、配置、命令、生成流程、运行时或部署时同步更新 docs 和 README。
- 有意偏离中央 Profile 时更新 `docs/architecture/deviations.md`；跨项目长期变化提交中央 ADR/Profile。
- 不添加只供 Agent 使用的项目脚本；真正的自动检查应服务开发者和 CI。

## 完成前

- 检查 Git Diff，区分手写变化和生成结果，排除无关格式化、调试代码及敏感信息。
- 执行 `npm run build`；无法执行时说明原因和风险。
- 根据改动验证独立模式、qiankun 生命周期、Token/权限、路由和关键管理流程。
- 动态检查 Markdown 链接、`docs/project.yaml`、`package.json`、环境变量、脚本和源码一致性。
- 页面或权限变化检查 `route-map.ts` 与资源 JSON；生成器变化在临时输入上验证。
- 按 `docs/development/definition-of-done.md` 报告已验证项、未验证项和剩余偏差。

