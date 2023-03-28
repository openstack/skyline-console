简体中文 | [English](../../en/test/2-catalog-introduction.md)

```
test
├── e2e （E2E代码存放位置）
│   ├── config
│   │   ├── config.yaml (E2E运行时的部分配置，主要配置了测试用例文件列表，登录账号等信息)
│   │   └── local_config.yaml   (E2E运行时的部分配置，主要配置了测试用例文件列表，登录账号等信息，是gitignore的，优先级高于config.yaml)
│   ├── fixtures    (存放运行时需要的上传文件，读取文件等)
│   │   ├── keypair (测试密钥读取的文件)
│   │   ├── metadata.json   (测试元数据读取的文件)
│   │   ├── stack-content.yaml  (测试堆栈读取的文件)
│   │   └── stack-params.yaml   (测试堆栈读取的文件)
│   ├── integration (存放测试用例)
│   │   └── pages   (按网页菜单结构调整目录)
│   │       ├── compute (计算)
│   │       │   ├── aggregate.spec.js   (主机集合)
│   │       │   ├── baremetal.spec.js   (裸机配置)
│   │       │   ├── flavor.spec.js  (云主机类型)
│   │       │   ├── hypervisor.spec.js  (虚拟机管理器)
│   │       │   ├── image.spec.js   (镜像)
│   │       │   ├── instance.spec.js    (云主机)
│   │       │   ├── ironic.spec.js  (裸机)
│   │       │   ├── keypair.spec.js (密钥)
│   │       │   └── server-group.spec.js    (云主机组)
│   │       ├── configuration   (平台配置)
│   │       │   ├── metadata.spec.js   (元数据)
│   │       │   └── system.spec.js  (系统信息)
│   │       ├── error.spec.js   (错误页面)
│   │       ├── heat    (资源编排)
│   │       │   └── stack.spec.js   (堆栈)
│   │       ├── identity    (身份管理)
│   │       │   ├── domain.spec.js  (域)
│   │       │   ├── project.spec.js (项目)
│   │       │   ├── role.spec.js    (角色)
│   │       │   ├── user-group.spec.js  (用户组)
│   │       │   └── user.spec.js    (用户)
│   │       ├── login.spec.js   (登录)
│   │       ├── management  (运维管理)
│   │       │   └── recycle-bin.spec.js (回收站)
│   │       ├── network (网络)
│   │       │   ├── floatingip.spec.js  (浮动IP)
│   │       │   ├── lb.spec.js  (负载均衡)
│   │       │   ├── network.spec.js (网络)
│   │       │   ├── qos-policy.spec.js  (Qos策略)
│   │       │   ├── router.spec.js  (路由器)
│   │       │   ├── security-group.spec.js  (安全组)
│   │       │   ├── topology.spec.js    (网络拓扑)
│   │       │   ├── port.spec.js (端口)
│   │       │   └── vpn.spec.js (VPN)
│   │       └── storage (存储)
│   │           ├── backup.spec.js  (备份)
│   │           ├── qos.spec.js (QoS)
│   │           ├── snapshot.spec.js    (云硬盘快照)
│   │           ├── storage.spec.js (存储后端)
│   │           ├── volume-type.spec.js (云硬盘类型)
│   │           └── volume.spec.js  (云硬盘)
│   ├── plugins (Cypress的扩展)
│   │   └── index.js    (配置了对配置文件的读取，配置了使用代码覆盖率功能)
│   ├── report  (存放E2E的测试报告)
│   │   ├── merge-report.html   (最终生成的测试报告，记录了每个用例的执行情况)
│   │   └── merge-report.json   (results目录下的测试结果的汇总)
│   ├── results (存放测试用的结果文件)
│   ├── screenshots (存放测试出错时的快照)
│   ├── support (编写测试用例时，二次封装的函数)
│   │   ├── commands.js (存放登录、登出等操作函数)
│   │   ├── common.js   (存放基础函数)
│   │   ├── constants.js    (存放每个资源的路由)
│   │   ├── detail-commands.js  (存放资源详情页相关的函数，基于框架，详情页的操作具有一致性)
│   │   ├── form-commands.js  (存放表单相关的函数，基于框架，对表单项的操作具有一致性)
│   │   ├── index.js
│   │   ├── resource-commands.js    (存放资源操作相关的函数，如：创建云主机、创建路由、删除资源等)
│   │   └── table-commands.js   (存放资源列表相关的函数，基于框架，对列表的操作具有一致性)
│   └── utils   (存放对于配置文件的读取函数)
│       └── index.js
└── unit    (单元测试)
    ├── local-storage-mock.js   (本地存储的mock函数)
    ├── locales (测试国际化时使用的翻译文件)
    │   ├── en-US.js
    │   └── zh-hans.js
    ├── setup-tests.js  (配置单元测试)
    └── svg-mock.js (图片加载的mock)
```

- E2E 测试的代码，存放在`test/e2e`目录下
  - E2E 的其他全局配置，存放在`cypress.json`
- 单元测试的基础代码，存放在`test/unit`目录下
  - 单元测试的其他全局配置，存放在`jest.config.js`
  - 单元测试的测试代码，通常是与待测试文件放在相同的目录下，并以`test.js`或`spec.js`为后缀
    - 如：`src/utils/index.js`与`src/utils/index.test.js`
    - 如：`src/utils/local-storage.js`与`src/utils/local-storage.spec.js`
