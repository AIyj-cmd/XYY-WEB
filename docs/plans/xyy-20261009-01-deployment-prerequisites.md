# XYY-20261009-01 测试站部署前置动作

以下是 2026-10-09 本轮只读核对结果与待单独授权动作。当前提交/推送/应用发布授权不自动包含数据库迁移、服务器历史目录删除或独立运行配置变更。

## 当前事实

- 唯一目标：root@47.82.105.103，https://wz.tomatopia.top，应用 /var/www/xyy-web，CMS /var/www/xyy-cms。
- /version 当前为 0ffe149df13148d6280b5230979eb0a3d0ea26cb / 20261004T044635Z-0ffe149 / staging / 2026-08-cms-hardening。
- /healthz 两依赖均 ok；current 为上述版本，其 .previous_target 为 20261002T102719Z-5beb6a2。根目录不存在可用 previous 符号链接，回退必须使用实际 .previous_target。
- 服务器本轮最终可用 866316288 bytes（约 826 MiB），小于 2 GiB 远端底线；此前清单为 25 个历史 release。监听仍为 0.0.0.0:50031。
- 本轮实际运行 manifest 工具返回 release_manifest_blocked: cms_schema_status=candidate_unverified，未产出 manifest。应用源码 CI 通过不能改变此结果。

## 待批准的准确动作

1. 仅清理下表标为“删除候选”的 20 个旧 release 目录；保留五个最新版本、current、实际 previous 和一切 pinned。执行前再核对 inode/真实路径/进程 cwd 与保护集合，变化即停止；不清理 CMS、日志或备份。
2. 对该测试 CMS 核对正式站/其他应用是否共享依赖；无法排除共享时停止。确认后短暂停写，生成成对数据库 custom dump 与 uploads 备份，加密保存到本机 /home/yj/data/xyy-release-20261009-01/private-backups/，私钥另存用户私有密钥目录，权限 0700/0600。记录一致性时间、版本、大小和 SHA，不记录凭据。
3. 在本机专用隔离 Docker 网络/临时容器恢复同一备份，禁止邮件/webhook/真实询盘外发；验证数据库与附件对应关系和恢复能力。
4. 仅对先前审核的 CMS E/G 契约生成 dry-run 差异并维护：不重建缺失 legacy 集合，FAQ page_key 可空只读、faq_page 非空必填且 RESTRICT，英文新闻分组及五字段默认 draft；孤儿项停止为 manual_mapping_required。先通过恢复，再执行迁移；二次 dry-run 零变化及严格验证通过后才允许更新 CMS 版本验证状态。
5. 测试 Web 随版本配套设置 TRUSTED_PROXY_CIDRS=127.0.0.1/32、HOST=127.0.0.1、PORT=50031；保存旧配置与 hash，应用/配置成对发布或回退；核对可信代理链和入口。完成适用 Luna/Nova 门禁及发布验证后，激活用户已授权的测试版本。

## 精确目录清单

候选大小为 apparent bytes，不等于保证可回收容量；执行后必须重新测量与容量门禁。目录根 inode 本轮为 1486639。

| 绝对路径                                             | 决策             | apparent bytes |
| ---------------------------------------------------- | ---------------- | -------------: |
| `/var/www/xyy-web/releases/20260821T235850Z-539bfd4` | 删除候选，待授权 |      363757139 |
| `/var/www/xyy-web/releases/20260824T090653Z-4c1f313` | 删除候选，待授权 |      362013169 |
| `/var/www/xyy-web/releases/20260825T054116Z-2c75bcd` | 删除候选，待授权 |      363758793 |
| `/var/www/xyy-web/releases/20260830T100940Z-82c01ed` | 删除候选，待授权 |      362086372 |
| `/var/www/xyy-web/releases/20260831T081814Z-b91a7b2` | 删除候选，待授权 |      363795850 |
| `/var/www/xyy-web/releases/20260908T081633Z-1e0a79b` | 删除候选，待授权 |      362091211 |
| `/var/www/xyy-web/releases/20260909T112839Z-63deee1` | 删除候选，待授权 |      384338912 |
| `/var/www/xyy-web/releases/20260923T005553Z-51d9c47` | 删除候选，待授权 |      331418955 |
| `/var/www/xyy-web/releases/20260923T070817Z-51d9c47` | 删除候选，待授权 |      504011311 |
| `/var/www/xyy-web/releases/20260924T040212Z-330969d` | 删除候选，待授权 |      504014466 |
| `/var/www/xyy-web/releases/20260924T091109Z-5081bdc` | 删除候选，待授权 |      504010539 |
| `/var/www/xyy-web/releases/20260927T004516Z-4a5bb2a` | 删除候选，待授权 |      500710118 |
| `/var/www/xyy-web/releases/20260928T002840Z-ce682ab` | 删除候选，待授权 |      500994904 |
| `/var/www/xyy-web/releases/20260928T023618Z-5a12274` | 删除候选，待授权 |      501003199 |
| `/var/www/xyy-web/releases/20260928T054511Z-b90b777` | 删除候选，待授权 |      501004593 |
| `/var/www/xyy-web/releases/20260928T101449Z-e764b74` | 删除候选，待授权 |      501038891 |
| `/var/www/xyy-web/releases/20260928T110250Z-54b41d2` | 删除候选，待授权 |      501038989 |
| `/var/www/xyy-web/releases/20260929T044842Z-79ba3c1` | 删除候选，待授权 |      501097437 |
| `/var/www/xyy-web/releases/20260929T234844Z-b50c4b3` | 删除候选，待授权 |      501107924 |
| `/var/www/xyy-web/releases/20260930T113222Z-3543ecb` | 删除候选，待授权 |      501105409 |
| `/var/www/xyy-web/releases/20261001T012818Z-7f90305` | 保留             |      501105768 |
| `/var/www/xyy-web/releases/20261002T001733Z-b8021b1` | 保留             |      501112925 |
| `/var/www/xyy-web/releases/20261002T032358Z-ab82cbd` | 保留             |      501112925 |
| `/var/www/xyy-web/releases/20261002T102719Z-5beb6a2` | 保留             |      501131178 |
| `/var/www/xyy-web/releases/20261004T044635Z-0ffe149` | 保留             |      501132199 |

正式站、Oracle、DNS/TLS、真实内容发布/询盘写入、权限扩大与其他历史文件删除均排除。以上尚未执行。
