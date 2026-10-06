# 模板包元数据与运行时配置清理

- 状态：待执行
- 创建日期：2026-10-05
- 来源：架构与 README 校准审计

## 目标

在正式仓库名称、远程地址和 OpenNext 目标平台确定后，清理克隆模板遗留的包元数据与根 Docker 配置，使运行时文件与现行架构一致。

## 范围

1. 更新 `package.json` 的 name、description、repository、homepage、bugs 和 keywords，并同步锁文件；
2. 确定 OpenNext 目标平台后重做根 `Dockerfile` / `docker-compose.yml`，或将不再使用的模板文件归档；
3. 新增不含秘密的 `.env.example`，列出实际读取的环境变量；
4. 验证 npm install、lint、typecheck、build 和目标运行时；
5. 更新 README、ARCHITECTURE、DECISIONS 和 STATUS。

## 前置条件

- 正式 Git 远程仓库和项目名称已确认；
- OpenNext 样机完成，目标平台和部署方式已决定；
- 不在决定前把 Node standalone 或模板 Docker 文件包装成生产架构。
