# g2rain-manager-app 国际化用法

登录后拉取 `.env` 中 `VITE_I18N_TAGS` 配置的文案包；HTTP 自动带 `Accept-Language`。
## 三种写法

## 写法
## 约定

| 场景 | 写法 |
|------|------|
| 模板 | `{{ $t('KEY', '默认文案') }}` |
| JS | `t('KEY', '默认文案')` |
## 页面默认值

## Key 命名
## 独立运行（`mode=alone`）

| 前缀 | Tag | 说明 |
|------|-----|------|
| `G2_*` | G2RAIN_SHARED | 按钮、字段、校验、错误码等**跨应用通用**（与 main-shell 等同 key，后台只配一份） |
| `MG_*` | MANAGER | 管理端**页面/模块专属**文案 |
## 集成运行（qiankun）

**复用原则：**
- 查询/重置/编辑/删除/保存/取消 → `G2_BTN_*`
- 姓名、邮箱、手机号等字段 → `G2_FIELD_*` / `G2_PH_*`
- 树形表「新增顶级」「新增子级」等**语义不同** → 单独 `MG_*` key（如 `MG_MENU_BTN_ADD_ROOT` / `MG_MENU_BTN_ADD_CHILD`）

## Tags（`.env`）

- 默认：`G2RAIN_SHARED,MANAGER`（公共在前，应用在后）

## 运行模式

- **独立**（`mode=alone`）：`Home.vue` 语言下拉，`localeBoot` 拉列表
- **集成**（qiankun）：用主应用 props `locale`，不展示语言下拉

完整 key 清单见 [KEYS.md](./KEYS.md)。
