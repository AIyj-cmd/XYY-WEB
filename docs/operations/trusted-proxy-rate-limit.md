# 可信代理与咨询限流运行要求

`server.mjs` 默认不信任任何转发头。只有 `TRUSTED_PROXY_CIDRS` 显式列出的反向代理网段才可传递 `X-Forwarded-For`；`X-Real-IP` 从不参与身份判定。

部署前由运维核实验收站的应用 socket 对端地址和代理重写规则，再把精确 CIDR 写入该环境的私有运行配置。例如：

```text
TRUSTED_PROXY_CIDRS=10.42.0.0/16,2001:db8:42::/48
```

应用从 socket 对端向 `X-Forwarded-For` 右侧回溯可信链，使用第一个非可信地址作为请求方。IPv4、IPv4-mapped IPv6 和 IPv6 均规范化后比较。可信对端带有长度超过 2048 bytes、超过 16 跳或含非法地址的链会得到通用 `400 Bad Request`；非可信直连的转发头完全忽略。

该结果仅以 `locals.requesterIp` 传给 Astro，咨询接口不再读取任何外来 IP 头。限流仍是单进程、每地址十分钟 5 次、最多 1000 个桶；多实例场景不共享桶，未引入 Redis。

发布和回退须同时保留 `TRUSTED_PROXY_CIDRS` 与边缘重写规则。若真实代理地址或重写方式未核实，保持变量为空，系统将安全地按 socket 对端限流。启动时 CIDR 格式错误会失败，不能绕过校验。

本地补丁验收与 npm 审计分开执行：

```bash
node scripts/verify-http-cache-semantics-patch.mjs
npm audit --omit=dev
```

前者验证固定来源哈希、lockfile、本地运行时解析和 Astro 消费行为；由于它是 `file:` 依赖，后者不会覆盖该补丁的公告状态。
