# g2rain-manager-app 国际化用法

登录后拉取 `MANAGER` 标签文案包；HTTP 自动带 `Accept-Language`（当前 `localeStore.locale`，如 `zh-CN`）。

## 三种写法

| 场景 | 写法 |
|------|------|
| 模板 | `{{ $t('MESSAGE_CODE', '页面默认文案') }}` |
| JS 要一段文字 | `t('MESSAGE_CODE', '页面默认文案')` |
| JS 弹提示 | `ElMessage.success(t('MESSAGE_CODE', '操作成功'))` |

## 约定

- 文案编码与后台 `i18n_message.message_code` 一致，`tag` 固定为 `MANAGER`（见 `runtime/api/i18n.api.ts`）。
- 拉包：`GET /api/infra/i18n_message/locale?tag=MANAGER&locale=zh-CN`。
- 模板不要用 `useI18n`，已开启 `globalInjection`，直接用 `$t`。
- 样例见 `views/Home.vue`。

## 页面默认值

第二个参数写在**当前页面**（见 `views/Home.vue`）：后台未配置时用默认文案，有配置则用后台。不要单独维护 defaults 文件。

## 独立运行（`mode=alone`）

- `localeBoot` 登录后拉 `code_name_map`，`Home.vue` 顶部语言下拉与主应用 Header 一致。
- 切换语言会重新拉文案包并写入 `localStorage`（`g2rain.locale`）。

## 集成运行（qiankun）

- 不展示语言下拉；使用主应用 props 的 **`locale`**。
- `mount` / `update` 时调用 `localeStore.applyFromMain(locale)` 拉包。
- 主应用切换语言时会 `update` 子应用，无需子应用自行监听。
