# 控制域 SELF 类型管理端接入

## 1. 文档状态

- 状态：已落地
- 目标仓库：`g2rain-manager-app`
- 权限事实来源：`g2rain-basis`
- 后端枚举：`ControlDomainType` = `TRADE` | `APPLICATION` | `SELF`
- 自助开通接口：`POST /application_authorization/activate_self`（IAM consent 编排，非本仓页面）

## 2. 目标

管理端可配置并展示 `SELF`（租户自助开通）业务能力类型，与 Basis 契约一致；避免对 SELF 走「开通功能」人工授权入口，因为租户在应用授权确认时会自动开通该应用全部 SELF 控制域。

## 3. 控制域页

页面：`src/views/control_domain/index.vue`

| 区域 | 行为 |
| --- | --- |
| 类型选择 | `DictSelect` + `CONTROL_DOMAIN_TYPE`（须包含字典项 `SELF`） |
| 新增 / 明细 | 选中或查看 `SELF` 时展示说明文案 |
| 范围联动 | 仅 `TRADE` 强制 `CUSTOMER`；`APPLICATION` / `SELF` 可选全部范围 |
| 开通功能 | `SELF` 行隐藏「开通功能」；误触时提示不可手动开通 |
| 关联功能权限 | 与既有逻辑一致，不按类型额外过滤 |

类型：`src/views/control_domain/type.ts` 注明 `controlDomainType` 取值。

生成器 SQL：`src/shared/generator/database.sql` 的 `control_domain.control_domain_type` 注释含 `SELF`。

## 4. 字典前置

平台字典用途 `CONTROL_DOMAIN_TYPE` 需存在编码 `SELF`（建议名称：租户自助开通）。字典由运维/管理端字典页维护，不在本仓硬编码枚举下拉。

## 5. 验收

- 新增业务能力可选类型 `SELF` 并成功保存
- 列表 / 明细正确展示字典文案
- `SELF` 行不出现「开通功能」
- `TRADE` 范围仍仅 `CUSTOMER`
- 与 Basis `ControlDomainType` / `activate_self` 语义一致
