# 2026-10-14 安全报告修复与上线条件

任务：`XYY-20261014-04`。输入为用户提供的 `8.138.148.179-20261014` 安全报告。本文是本地修复及生产候选记录，不表示已在服务器应用变更。

本地验收已完成：`npm run verify` exit 0（127 文件、861 单测及构建），12 组中英桌面/手机浏览器检查通过，Luna PASS、Nova APPROVED、Sol 验收。未提交、推送或部署；下表中的线上关闭条件仍未执行，发布前仍须运行 `verify:release`。

## 发现与处理边界

| 发现               | 已确认范围                                                    | 本轮处理                                                   | 线上关闭条件                                                 |
| ------------------ | ------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| F-01 HTTP 明文表单 | HTTP 联系页可展示表单，空对象 POST 进入校验                   | 公开 HTTPS origin 下跳转页面、拒绝明文写请求，独立本地验证 | 应用发布与 HTTP 入口策略生效，真实浏览器在展示表单前转 HTTPS |
| F-02 管理员 MFA    | 报告中的管理员仅密码登录，策略未强制 TFA                      | 明确绑定、恢复与策略启用步骤；本轮未改账号或权限           | 管理员本人完成 TOTP 绑定，获授权后强制 TFA，新会话验证       |
| F-03 限流          | Directus 应用限流自报关闭，外层未知                           | 核对仓库规则与官方参数，保留外层待核验状态                 | 取得现场代理/网关配置及日志，验证必要规则及小流量 429        |
| F-04 CSP           | 脚本允许 unsafe-inline，连接白名单含 loopback                 | 加固本地脚本策略并验证正常交互与注入负例                   | 发布后复核响应及浏览器行为                                   |
| F-05 公开 URL      | canonical、hreflang、OG、JSON-LD、robots、sitemap 含 loopback | 加入公开 origin 校验及一致性防护                           | 使用公开 HTTPS origin 重建发布，复核全部元数据               |

## 已查明的构建原因

此前最终发布构建脚本 `output/release/xyy-20261014-03/luna/final-build/run-native-build.mjs` 同时设置了 `DEPLOY_ENVIRONMENT=staging` 与 `PUBLIC_SITE_URL=http://127.0.0.1:18080`。这些是构建输入，改变运行环境变量不能保证改掉已编译的元数据。`PUBLIC_DIRECTUS_URL` 也曾使用本地模拟地址。

本地模拟 CMS 的内部地址可以继续指向不可达 loopback，但发布构建的公开 site origin 应为 `https://8.138.148.179`。正式域名启用时再统一调整，测试期 noindex/nofollow 保持。构建和运行必须使用一致的公开 origin；验收必须检查最终发布包，不能只检查测试构建。

## 生产候选 A：HTTPS 与公开网址

准确目标：新 ECS `8.138.148.179`，当前对外 Web 应用及其 HTTP 入口。涉及应用发布、私有 Web 运行配置和 Nginx 重载，必须获得针对这些动作与环境的明确授权。

1. 发布前核对当前 release、代理拓扑、现行 Nginx 配置、Web/CMS 进程、公开证书和 ACME 路径。保存可回退的私有配置与原 release；不把秘密写入仓库或证据。
2. Web 构建及运行设置 `PUBLIC_SITE_URL=https://8.138.148.179`。内部 CMS 地址、令牌和存储配置保持；公开资源地址单独核对为目标服务器实际支持的同源路径，不复制本地模拟 URL。
3. 归档配置将 80/443 放在同一 server 块；应从原块中移除且仅移除 `listen 80 default_server;`，保留 HTTPS 全部代理及证书配置，再新增独立 HTTP server。现场回读必须先确认该拓扑仍成立。候选如下，不是整份配置替换脚本：

   ```nginx
   server {
       listen 80 default_server;
       server_name _;
       location ^~ /.well-known/acme-challenge/ {
           root /data/xyy/acme/webroot;
           default_type text/plain;
           try_files $uri =404;
       }
       location / {
           if ($request_method !~ ^(GET|HEAD)$) { return 403; }
           return 308 https://8.138.148.179$request_uri;
       }
   }
   ```

   不使用客户端 Host 构造目的地址；不得在 server 级无条件 return 覆盖 ACME。不得将上述 HTTP 默认 location 直接放进仍同时监听 443 的原 server，否则 HTTPS 会循环跳转。现场若有额外 HTTP listener 或 location，需逐项核对覆盖。Nginx 的 return 执行顺序见[官方 rewrite 文档](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return)。

4. 执行候选配置语法检查与 `npm run verify:release`，完成独立测试、审阅后才发布。TLS、DNS、数据库、CMS schema 与业务内容不属于本候选动作。
5. 上线验收 HTTP 中英文联系页、首页、后台和 API；GET 保留路径/查询后到 HTTPS，明文 POST 不进入业务处理。仅空对象用于 API 拒绝检查，有效咨询在本地模拟验证。
6. 检查 HTTPS 的 canonical、hreflang、OG、JSON-LD、robots 与 sitemap，确保全部使用公开 origin。浏览器验证字体、导航、图库、联系表单和脚本 CSP，保持 noindex。确认 ACME 原有路径仍可用。

HTTPS 重定向不能收回已经发出的明文请求正文；保护重点是展示表单前完成跳转。IP 站点不通过添加 HSTS 宣称完成保护，正式域名的 HSTS 另按其全部 HTTPS 前提评估。

## 生产候选 B：管理员 MFA

本轮未读取秘密、绑定 TOTP 或修改 Directus 策略。先枚举全部通过角色或直接绑定获得 Administrator Policy 的活跃用户；`enforce_tfa` 是 Policy 属性，会影响所有获得该策略的用户，不能仅检查当前账号。依据为 [Directus Policies API](https://directus.com/docs/api/policies)。

主管理员本人先在自己的验证器中绑定 TOTP，用全新会话完成密码加 OTP 登录。第二管理员应由不同人员保管，也必须已绑定 TOTP 并通过全新会话验证，再对准确 Administrator Policy 启用 `enforce_tfa`。不要在用户尚未绑定时批量强制，更不能生成、保存或替用户长期持有 MFA 秘钥。

Directus 12.5.0 官方 TFA API 提供生成、启用、停用操作，没有原生恢复码机制；恢复条件具体为第二管理员能够停用受影响用户的 TFA 并监督重新绑定，或另行获批并演练的恢复流程。强制策略对尚未绑定用户的设置引导不能代替恢复路径。依据为 [Directus Users API](https://directus.com/docs/api/users)。

需独立授权的动作是目标 Directus 的管理员策略修改。验收使用新会话：仅密码不能取得正常管理员访问，正确第二因素后才可用；正常编辑账号权限保持。策略变化需有独立审查及可恢复路径。网关/VPN/IP 白名单需要真实运维入口信息，当前不猜测 IP 或一并启用。

## 生产候选 C：限流核验

仓库联系接口已有单进程每地址十分钟 5 次的应用限流；`src/lib/contact/rate-limit.ts` 与 `server/trusted-proxy.mjs` 是当前实现。这个事实不代表生产代理身份链和多实例共享状态已经核验。旧 bootstrap 模板中的 Directus 限流配置也不证明目标服务器已启用。

2026-10-11 归档的已应用 Nginx 配置 `output/public-cms/xyy-20261011-05/terra/nginx.conf` 没有 `limit_req` / `limit_conn`；该历史证据不替代当前配置回读，云网关/WAF 仍未知。先核对生效 Nginx 配置、Directus 运行参数、实例数量及云网关策略，确认真实客户端地址不受外来转发头伪造，也不会把所有访问错误合为代理 loopback。若无等效外层保护，补充 CMS API 限流；联系接口保留其业务限流，不对全站静态图像套登录阈值。

在仍为单 Directus 进程、仅监听 loopback、`IP_TRUST_PROXY=loopback` 与 Nginx 转发链已经核实的前提下，最小候选是：

```dotenv
RATE_LIMITER_ENABLED=true
RATE_LIMITER_STORE=memory
RATE_LIMITER_POINTS=50
RATE_LIMITER_DURATION=1
RATE_LIMITER_GLOBAL_ENABLED=false
```

这是官方每 IP 50 次/秒的起始参数，不是本项目容量结论，也不是专门的登录暴力尝试防线。启用前检查正常后台突发请求；登录专用阈值及告警按现有外层能力另行确认。全局限流暂不同时开启，多进程/多实例时需使用共享计数。参数依据为 [Directus Security & Limits](https://directus.com/docs/configuration/security-limits)。`auth_login_attempts=25` 是账号失败尝试机制，不能代替每 IP 限流；资源压力 503 也不能代替请求限流 429。

如获授权，仅对目标 Directus 私有环境文件做唯一键原子更新，保留 `PUBLIC_URL`、Cookie、`IP_TRUST_PROXY`、`TEMP_PATH` 及其他原字节；仅重启 Directus，失败恢复原文件。验收 `/server/info` 的 `rateLimit={points:50,duration:1}`、`rateLimitGlobal=false`，以及后台登录、集合读取和资源加载。本候选不需要修改业务权限、数据库或重装 CMS。

小流量验收必须约定时间窗口和请求数量，使用专用无副作用测试入口或隔离环境；不通过重复真实管理员密码错误触发账号锁定。验证 429、退避响应、恢复时间和正常后台操作。Nginx 限流模块默认拒绝状态不是 429，若采用该模块须显式设置 `limit_req_status 429`，参见[官方限流文档](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)。

## 回退与交付记录

- 应用失败回退到保留 release；配置失败恢复对应私有备份并重新语法校验。不得以重新允许公开明文提交作为常规修复。
- MFA 或限流操作与应用发布分开验收，任何一项未完成均保留对应报告项，不宣称五项全部关闭。
- 当前完成状态、实际命令与结果在本任务证据及 `DEV_STATE.md` 更新；本文中的生产步骤尚未执行。
