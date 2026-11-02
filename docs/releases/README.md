# 发布记录

- [v1.0.0：平台管理控制台与 GHCR 镜像发布流程](v1.0.0.md)

发布遵循 `feature/* → develop → main`。发布改动和对应说明进入并验证 `main` 后，才可在该提交创建 `v<major>.<minor>.<patch>` tag；稳定版 tag 才会触发 GHCR 镜像发布。
