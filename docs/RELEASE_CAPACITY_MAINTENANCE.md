# 发布容量与媒体维护

`scripts/capacity-preflight.mjs` 在构建、上传和安装前按文件系统设备 ID 合并工作目录、测试产物目录和临时目录。每个设备必须同时保留：本地 3 GiB、远端 2 GiB，以及实测峰值的 125% 中较高的字节空间；同时保留至少 1,024 个 inode 或实测峰值的 125%。没有实测文件时，它以 `capacity_baseline_measurement_required` 失败，不能用零峰值假装通过。

在隔离环境中先设置测试产物和临时目录到容量充足的文件系统，再测量一次真实命令：

```sh
PLAYWRIGHT_ARTIFACTS_DIR=/safe/output TMPDIR=/safe/tmp \
  npm run capacity:baseline -- --output /safe/capacity-baseline.json \
  --path "$PWD" --path /safe/output --path /safe/tmp --command 'npm run verify:release'
```

部署使用 `CAPACITY_BASELINE_FILE`（本地）和 `REMOTE_CAPACITY_BASELINE_FILE`（远端）的 JSON。远端基线必须由运维在同一目标设备上以实际上传和安装工作负载测量；缺失、损坏、设备变化或空间/inode不足都会停止动作。基线文件只记录容量计数和测量命令，不得包含环境变量或凭据。

`npm run build`、`npm run verify` 和 `npm run verify:release` 会先运行 `scripts/check-capacity.mjs`；它合并工作目录、`TMPDIR` 和 `PLAYWRIGHT_ARTIFACTS_DIR`，缺少对应工作负载基线时失败关闭。npm 的 `preinstall` 生命周期在安装已开始后才执行，所以它只提供安装开始后的补充检查，不能作为安装前容量保护。首次安装必须用无需依赖的 `capacity:baseline` 包装 `npm ci`：工具会先做本地 3 GiB/inode floor 检查，再以 `CAPACITY_BASELINE_MEASUREMENT=true` 监控安装峰值；该标记仅传给受监控子进程，不能用于普通构建。首次完整 `verify:release` 必须另测一份完整工作负载基线，后续 `check-capacity` 使用这份基线预检。远端 `npm ci` 同时传入 `CAPACITY_SCOPE=remote` 和远端基线路径，安装前后仍由部署脚本显式预检。安装峰值不能替代包含构建、测试产物和发布验证的完整基线。

Playwright 的默认产物目录可通过 `PLAYWRIGHT_ARTIFACTS_DIR`、`PLAYWRIGHT_FORMAL_ARTIFACTS_DIR`、`PLAYWRIGHT_ENGLISH_NEWS_ARTIFACTS_DIR`、`PLAYWRIGHT_ENGLISH_WHITEPAPERS_ARTIFACTS_DIR` 重定向。它们应和 `TMPDIR` 一起传给容量测量和实际测试。

媒体清单只读取现有 `public/` 文件：

```sh
npm run media:manifest -- /safe/evidence/media-manifest.json
```

清单包含路径、URL、字节数、SHA-256、源码精确 URL 引用和 Git 跟踪/最近提交归属；不会压缩、移动或改写媒体。

`npm run release:cleanup -- --releases-dir ... --current-link ... --previous-file ... --legacy-dir ...` 默认只输出候选清单。它保留最新五版，以及 `current`、当前回退目标和 `PINNED_RELEASES` 中的精确版本。实际删除必须显式提供已审阅的 `--plan`；重新计算后的精确候选、根目录身份、受保护目标或固定保留文件任一变化都会拒绝操作。部署脚本始终只生成预览计划；`RELEASE_CLEANUP_APPLY=true` 会在本地构建和远端连接前被拒绝，已审阅计划须由受控的独立维护操作执行。
