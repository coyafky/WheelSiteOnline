# 运维手册：备份与恢复

最后验证：2026-10-17（**已做真实恢复演练**，见文末记录）
脚本：`scripts/backup/backup.sh` ｜ `scripts/backup/restore.sh`

---

## 1. 这个手册解决什么

17 个模块审计里，M16（监控与备份）是**评级最高、最空**的一块：仓库内没有任何备份脚本，
之前只有「备份目录存在」的历史记录，没有可复核的恢复演练。
没有演练过的备份不算备份 —— 它只是「你以为你有一份副本」。

---

## 2. 备份

```bash
# 默认输出到 ~/.config/alma/backups/fenghuai-wp，保留最近 7 份
./scripts/backup/backup.sh

# 自定义
./scripts/backup/backup.sh --out /path/to/dir --keep 14 --label pre-release

# 只做前置检查，不落盘
./scripts/backup/backup.sh --dry-run
```

**产出**：`fenghuai-wp-<时间戳>[-标签].tar.gz` + 同名 `.sha256`

内含：`db.sql.gz`（mysqldump，`--single-transaction`）｜ `uploads.tar.gz`

### 设计要点

| 点 | 说明 |
|---|---|
| 前置检查 fail-fast | 容器不存在/未运行时直接退出 2，不会产出半成品 |
| dump 完整性 | 除了非空，还要求文件尾含 `Dump completed`，否则拒绝生成备份 |
| 写后回读 | 生成 `.sha256` 后**重新读一遍归档**做比对（`shasum -c` 需在归档目录内执行） |
| 轮转范围收敛 | 只删 `fenghuai-wp-*.tar.gz` 这个命名模式，不动目录里其它文件 |
| 凭据不落盘 | 口令从容器环境读取，不写进脚本、不写进归档 |

### 凭据是怎么取的（踩过的坑）

`MYSQL_ROOT_PASSWORD`（MySQL 容器）与 `WORDPRESS_DB_PASSWORD`（WordPress 容器）
**是两个不同的口令**。用前者连 `wp` 用户会得到：

```
ERROR 1045 (42000): Access denied for user 'wp'@'localhost' (using password: YES)
```

正确来源是 **WordPress 容器的环境变量** —— 与 `wp-config.php` 里
`getenv_docker('WORDPRESS_DB_*')` 同源。脚本已按此实现，并可用
`DB_USER` / `DB_PASSWORD` / `DB_NAME` 环境变量覆盖。

---

## 3. 恢复

```bash
# 必须先验校验和，再解包；目标库名强制显式指定
./scripts/backup/restore.sh <归档路径> --db <目标库名> [--drop-target] [--dry-run]
```

**默认行为是安全的**：不指定 `--db` 直接拒绝（防止手滑覆盖运行库）。
`--drop-target` 是唯一会清空已存在库的开关，必须显式给出。

### 建库权限

应用账号 `wp` 没有 `CREATE` 权限（实测报 `1044 Access denied`）。
脚本因此分两条通道：

- **建库/清库** → `root`（`ADMIN_USER` / `ADMIN_PASSWORD` 可覆盖）
- **导入/查询** → 应用账号 `wp`

建库后自动 `GRANT ALL ON <目标库>.* TO 'wp'@'%'`，使导入可用应用账号完成。

### 回读验证（不做这步不算恢复成功）

导入后脚本会强制检查并打印：

```
wp_posts   : 1046 行
wp_options : 162 行
home       : http://localhost:8081
```

任一项为空即判失败。**「导入命令没报错」不等于「数据回来了」**。

### uploads 不会被自动解入运行目录

`uploads.tar.gz` 属于文件系统层。脚本刻意不解它，避免静默覆盖现有媒体。
正式恢复时单独处理：

```bash
tar xzf uploads.tar.gz -C <wp-content 挂载点>
# 之后确认文件属主与权限与原环境一致
```

---

## 4. 恢复演练记录

| 项 | 值 |
|---|---|
| 日期 | 2026-10-17 |
| 执行人 | Alma |
| 源环境 | 本地 Docker Compose（`fh-wp` / `fh-wp-db`） |
| 归档 | `fenghuai-wp-20261017-172041-verify.tar.gz`（112 MB） |
| 校验和 | 通过（写后回读比对） |
| 目标库 | `fh_restore_drill`（独立库，不碰运行库） |
| 结果 | **通过** |
| 回读数据 | `wp_posts` 1046 行 ｜ `wp_options` 162 行 ｜ `home` = `http://localhost:8081` |
| 耗时 | 备份约 27 秒；恢复到独立库约 3 秒 |
| 事后清理 | 演练库已 DROP，确认库列表仅剩 `wordpress` |

**结论**：备份脚本能产出经过校验的归档，恢复脚本能从该归档在独立库中重建出可读数据。
这是「可恢复」的**本地证据**。

### 仍未验证 / 待办

- **服务器侧未做**：按负责人口径，本轮只做本地；生产备份、异地副本、加密与
  定时任务尚未实施
- **同机风险未解**：本地归档与源数据在同一台机器；异地副本是 M16 的剩余要求
- **归档未加密**：当前归档不含 `.env`，但正式环境若纳入配置文件必须先加密
- **uploads 未做过恢复演练**：只验证了数据库层

---

## 5. 定时化（尚未启用）

建议在**系统 cron**（不是 WP-Cron）中每日执行：

```cron
0 3 * * *  cd /path/to/repo && ./scripts/backup/backup.sh --keep 14 >> /var/log/fenghuai-backup.log 2>&1
```

⚠️ 启用前必须先解决异地副本与加密，否则只是把风险换了个位置。
