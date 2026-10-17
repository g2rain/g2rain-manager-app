# 控制单元 SessionType 管理端升级

## 1. 文档状态

- 状态：已落地（与 Basis 按租户 MEMBER 开通语义对齐）
- 目标仓库：`g2rain-manager-app`
- 权限事实来源：`g2rain-basis`
- 前置方案：[控制单元 SessionType 权限模型升级](https://github.com/g2rain/g2rain-basis/blob/main/docs/design/control-unit-session-type-upgrade.md)

## 2. 目标

在管理端为控制单元增加 `sessionType`（`USER` / `MEMBER` / `PASSPORT` / `ANONYMOUS`）的查询、展示与配置，并保证员工角色分配不会引入非 `USER` 控制单元。MEMBER 经控制域关联 + 应用授权开通到租户，不经员工角色分配。

## 3. 控制单元页

页面：`src/views/control_unit/index.vue`

| 区域 | 行为 |
| --- | --- |
| 查询 | `DictSelect` + `SESSION_TYPE` |
| 列表 / 明细 | `DictText` 展示 |
| 新增 | `sessionType` 必填 |
| 编辑 | `sessionType` 只读（与 `controlUnitScope` 一致） |
| 提交 | payload 携带 `sessionType` |

类型：`src/views/control_unit/type.ts` 的 `ControlUnit` / `ControlUnitPayload` / `ControlUnitQuery`。

生成器 SQL：`src/shared/generator/database.sql` 的 `control_unit.session_type` 与函数索引需与 Basis 初始化脚本保持一致。

## 4. 角色分配

- `RoleEditDialog`：可分配列表展示 `sessionType`，并兜底过滤非 `USER`
- `RolePermissionTags`：展示已分配项的 `sessionType`，便于排查误配
- 强制边界仍由 Basis `RoleControlUnitRelationService` 校验；前端过滤只是体验与防呆
- MEMBER 控制单元不通过员工角色分配给会员；租户侧开通走应用授权 / 控制域交付。Gateway 入口按「该 organ 已开通的 MEMBER 控制单元」鉴权，见 Basis / Gateway 对应方案

## 5. 控制域关联

页面：`src/views/control_domain/index.vue`「关联功能权限」弹窗展示控制单元 `sessionType`，便于区分 MEMBER / USER，避免把会员能力误配进仅员工场景（或反之）。开通仍走「开通功能 / 应用授权同步」，不按 sessionType 单独选型。

## 6. 验收

- 新建控制单元必须选择会话类型
- 编辑不可改会话类型
- 角色分配列表不出现 MEMBER / PASSPORT / ANONYMOUS
- 控制域关联列表可区分会话类型
- 与 Basis `/control_unit`、`/role_control_unit_relation/assignable` 契约一致
- MEMBER 能力对租户生效依赖应用授权开通，而不是角色分配页勾选
