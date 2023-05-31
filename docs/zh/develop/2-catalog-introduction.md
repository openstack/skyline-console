简体中文 | [English](../../en/develop/2-catalog-introduction.md)

# 一级目录简介

- `Gruntfile.js`：用于收集 i18n
- `LICENSE`: 该项目使用 Apache License
- `Makefile`:
- `README-zh_CN.rst`: 前端启动的简单中文说明，详细信息请参考 docs 文档
- `config`目录: webpack 配置，其内包含公用、开发环境、测试环境、生成环境下的 webpack 配置
- `cypress.json`: e2e 测试的配置文件
- `docker`: 内含开发环境、生成环境、测试环境使用的 docker 配置
- `docs`目录: 文档介绍，包含中文、英文、开发说明文档、测试说明文档
- `jest.config.js`: 单元测试的配置文件
- `jsconfig.json`: js 代码的配置文件
- `package.json`: 安装包、命令等配置文件
- `yarn.lock`: 包的版本锁定文件
- `.babelrc`: babel 配置文件
- `.dockerignore`: docker 忽略的文件配置
- `.eslintignore`: eslint 忽略的文件配置
- `.eslint`: eslint 配置
- `.gitignore`: git 忽略的文件配置
- `.gitreview`: gitreview 配置
- `.prettierignore`: prettier 忽略的文件配置
- `.prettierrc`: prettier 的配置
- `src`目录: 开发代码所在文件夹！！！
- `test`目录: 测试代码所在文件夹！！！包含 e2e 测试代码及单元测试的基础代码
- `tools`目录: 其他工具文件夹，内含 git 工具

# src 目录介绍

- `src/components`目录：公共组件
- `src/api`目录：API，暂未使用
- `src/asset`目录：images, template 等静态文件
- `src/containers`目录:
  - 带状态的组件
  - 基础类
    - [BaseList](3-1-BaseList-introduction.md)
    - [BaseDetail](3-3-BaseDetail-introduction.md)
    - [BaseForm](3-6-FormAction-introduction.md)
    - [BaseModalAction](3-7-ModalAction-introduction.md)
    - [BaseConfirmAction](3-8-ConfirmAction-introduction.md)
    - [BaseStepAction](3-9-StepAction-introduction.md)
- `src/core`目录:
  - `index.js`: 入口文件
  - `routes.js`: 按模块的路由配置
  - `i18n.js`
  - `App.jsx`
- `src/layouts`目录:
  - 定义所有整体页面布局的组件
    - 空白布局 BlankLayout
    - 登录页使用的布局 UserLayout
    - 内容页使用的布局 BaseLayout(列表、详情、表单等使用)
  - `menu.jsx`: 控制台使用的菜单配置
  - `admin-menu.jsx`: 管理平台使用的菜单配置
- `src/locales`目录: i18n
- `src/resources`目录:
  - 定义各资源被公用的状态 / 搜索项
  - 定义各资源被公用的表格列
  - 定义各资源的复用函数
- `src/stores`目录:
  - 对资源的数据获取、操作等
  - 按照资源名小写字母加连字符命名
  - 目录分为两级：例如 `nova/instances.js`, `cinder/volume.js`
- `src/utils`目录:
  - 公共函数(时间处理、正则、cookie、localStorage、......)
  - 对应的单元测试，以 test.js 或 spec.js 结尾
- `src/styles`目录: 基础样式、公用样式、样式变量等
- `src/pages`目录:
  - 按照页面层级结构递进(按照：菜单项--二级菜单)
  - 所有目录命名均为小写加连字符命名, 目录包含两个文件夹 `containers` 和 `routers`, 一个文件 `App.js`
  - `containers`下存放二级目录对应的页面
  - `routes`用于配置路由

# src/pages 目录介绍

- 以一级、二级菜单划分目录，一级菜单列在`src/pages`下，其对应的二级菜单页面位于`src/pages/xxx/containers`下，以“计算-云主机”为例，“计算”对应于`src/pages/compute`目录，“云主机”对应于`src/pages/compute/containers/Instance`目录
- `src/pages/compute/containers/Instance/index.jsx`: 云主机列表页，继承于[BaseList 组件](3-1-BaseList-introduction.md)(带有 Tab
  的页面，继承 TabBaseList 组件即可)
- `src/pages/compute/containers/Instance/Detail`目录
  - 云主机详情页
  - `index.jsx`继承于[BaseDetail 组件](3-3-BaseDetail-introduction.md)
- `src/pages/compute/containers/Instance/actions`目录
  - 云主机的操作
  - `Lock.jsx` 锁定云主机，继承于[BaseConfirmAction](3-8-ConfirmAction-introduction.md)
  - `AttachInterface.jsx` 继承于[BaseModalAction](3-7-ModalAction-introduction.md)
  - `StepCreate/index.jsx`，继承于[BaseStepAction](3-9-StepAction-introduction.md)
- `src/pages/compute/routes`目录：
  - `index.js`，配置路由
  - 约定以路由中是否含有“-admin”来判定是管理平台还是控制台

# test 目录介绍

[简体中文](../../zh/test/2-catalog-introduction.md) | [English](../../en/test/2-catalog-introduction.md)

# 目录简介-图像版

```
.
├── Gruntfile.js (用于收集i18n)
├── LICENSE
├── Makefile
├── README.rst
├── config
│   ├── config.yaml （开发时 host, port, server 的默认配置）
│   ├── local_config.yaml （gitignore的文件，可配置实际开发时使用的 host/port/server，如实际使用的值与config.yaml中的默认值不一致，在该文件中修改即可）
│   ├── server.dev.js （读取开发时使用的自定义配置信息）
│   ├── utils.js
│   ├── theme.js
│   ├── webpack.common.js
│   ├── webpack.dev.js  (开发时使用的webpack配置)
│   ├── webpack.e2e.js  (e2e测试时使用的webpack配置，能生成用于检测覆盖率的包)
│   └── webpack.prod.js (生成环境使用的webpack打包配置)
├── cypress.json    (e2e的配置)
├── docker
│   ├── dev.dockerfile
│   ├── nginx.conf
│   ├── prod.dockerfile
│   └── test.dockerfile
├── docs    (文档)
├── jest.config.js  (单元测试配置)
├── jsconfig.json
├── package.json
├── src
│   ├── api (api汇总，暂未使用)
│   ├── asset
│   │   ├── image   (图片放置位置)
│   │   └── template
│   │       └── index.html
│   ├── components  (公用组件)
│   ├── containers
│   │   ├── Action
│   │   │   ├── ConfirmAction   (确认型的action基类)
│   │   │   ├── FormAction   (单页的action基类)
│   │   │   ├── ModalAction   (弹窗型的action基类)
│   │   │   ├── StepAction   (分多步的单页action，例如：创建云主机)
│   │   │   └── index.jsx
│   │   ├── BaseDetail  (带有详情信息的详情页基类)
│   │   ├── List    (列表页的基类，例如：云主机)
│   │   ├── TabDetail   (带有tab切换的详情页的基类，例如：云主机详情)
│   │   └── TabList (带有tab切换的列表页)
│   ├── core
│   │   ├── App.jsx
│   │   ├── i18n.js
│   │   ├── index.jsx   (入口)
│   │   └── routes.js   (按模块的路由配置)
│   ├── layouts
│   │   ├── Base    (登录后使用的布局)
│   │   ├── Blank    (空白布局)
│   │   ├── User    (登录使用的布局)
│   │   ├── admin-menu.jsx  (管理平台使用的菜单配置)
│   │   └── menu.jsx    (控制台使用的菜单配置)
│   ├── locales (翻译)
│   │   ├── en.json
│   │   ├── index.js
│   │   └── zh.json
│   ├── pages   (页面-目录结构按照：菜单项--二级菜单 分配，其中二级菜单的页面放在containers文件夹下)
│   │   ├── base
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   ├── 404 (404页面)
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── AdminOverview   (管理平台首页)
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ComputeService.jsx
│   │   │   │   │   │   ├── NetworkService.jsx
│   │   │   │   │   │   ├── PlatformInfo.jsx
│   │   │   │   │   │   ├── ResourceOverview.jsx
│   │   │   │   │   │   └── VirtualResource.jsx
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   └── style.less
│   │   │   │   └── Overview   (控制台首页)
│   │   │   │       ├── components
│   │   │   │       │   ├── ProjectInfo.jsx
│   │   │   │       │   ├── QuotaOverview.jsx
│   │   │   │       │   └── ResourceStatistic.jsx
│   │   │   │       ├── index.jsx
│   │   │   │       └── style.less
│   │   │   └── routes  (路由配置)
│   │   │       └── index.js
│   │   ├── compute
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   ├── BareMetalNode   (裸机配置)
│   │   │   │   ├── Flavor  (云主机类型)
│   │   │   │   ├── HostAggregate   (主机集合)
│   │   │   │   │   ├── Aggregate   (主机集合)
│   │   │   │   │   ├── AvailabilityZone    (可用域)
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Hypervisors (虚拟机管理器)
│   │   │   │   │   ├── ComputeHost (计算节点)
│   │   │   │   │   ├── Hypervisor  (虚拟机管理器)
│   │   │   │   │   └── index.jsx
│   │   │   │   ├── Image   (镜像)
│   │   │   │   ├── Instance    (云主机)
│   │   │   │   │   ├── Detail  (详情页)
│   │   │   │   │   │   ├── BaseDetail  (基础信息)
│   │   │   │   │   │   ├── SecurityGroup   (安全组)
│   │   │   │   │   │   └── index.jsx
│   │   │   │   │   ├── actions (操作)
│   │   │   │   │   │   ├── AssociateFip.jsx    (绑定浮动IP)
│   │   │   │   │   │   ├── AttachInterface.jsx (挂载网卡)
│   │   │   │   │   │   ├── AttachIsoVolume.jsx (挂载ISO光盘)
│   │   │   │   │   │   ├── AttachVolume.jsx (挂载云硬盘)
│   │   │   │   │   │   ├── ChangePassword.jsx  (修改密码)
│   │   │   │   │   │   ├── Console.jsx (控制台)
│   │   │   │   │   │   ├── CreateImage.jsx (创建镜像)
│   │   │   │   │   │   ├── CreateIronic    (创建裸机-分步型Form)
│   │   │   │   │   │   │   ├── BaseStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── ConfirmStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── NetworkStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── SystemStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── index.jsx
│   │   │   │   │   │   │   └── index.less
│   │   │   │   │   │   ├── CreateSnapshot.jsx  (创建快照)
│   │   │   │   │   │   ├── Delete.jsx  (删除云主机)
│   │   │   │   │   │   ├── DeleteIronic.jsx    (删除裸机实例)
│   │   │   │   │   │   ├── DetachInterface.jsx (卸载网卡)
│   │   │   │   │   │   ├── DetachIsoVolume.jsx (卸载ISO镜像)
│   │   │   │   │   │   ├── DetachVolume.jsx    (卸载云硬盘)
│   │   │   │   │   │   ├── DisassociateFip.jsx (解绑浮动IP)
│   │   │   │   │   │   ├── Edit.jsx    (编辑云主机)
│   │   │   │   │   │   ├── ExtendRootVolume.jsx    (扩容根磁盘)
│   │   │   │   │   │   ├── LiveMigrate.jsx (热迁移)
│   │   │   │   │   │   ├── Lock.jsx    (锁定云主机)
│   │   │   │   │   │   ├── ManageSecurityGroup.jsx (管理安全组)
│   │   │   │   │   │   ├── Migrate.jsx (迁移)
│   │   │   │   │   │   ├── Pause.jsx   (暂停云主机)
│   │   │   │   │   │   ├── Reboot.jsx  (重启云主机)
│   │   │   │   │   │   ├── Rebuild.jsx (重建云主机)
│   │   │   │   │   │   ├── RebuildSelect.jsx   (选镜像重建云主机)
│   │   │   │   │   │   ├── Resize.jsx  (修改配置)
│   │   │   │   │   │   ├── ResizeOnline.jsx    (在线修改配置)
│   │   │   │   │   │   ├── Resume.jsx  (恢复云主机)
│   │   │   │   │   │   ├── Shelve.jsx  (归档云主机)
│   │   │   │   │   │   ├── SoftDelete.jsx  (软删除云主机)
│   │   │   │   │   │   ├── SoftReboot.jsx  (软重启云主机)
│   │   │   │   │   │   ├── Start.jsx   (启动云主机)
│   │   │   │   │   │   ├── StepCreate  (创建云主机-分步创建)
│   │   │   │   │   │   │   ├── BaseStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── ConfirmStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── NetworkStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── SystemStep
│   │   │   │   │   │   │   │   └── index.jsx
│   │   │   │   │   │   │   ├── index.jsx
│   │   │   │   │   │   │   └── index.less
│   │   │   │   │   │   ├── Stop.jsx    (关闭云主机)
│   │   │   │   │   │   ├── Suspend.jsx (挂起云主机)
│   │   │   │   │   │   ├── Unlock.jsx  (解锁云主机)
│   │   │   │   │   │   ├── Unpause.jsx (恢复暂停的云主机)
│   │   │   │   │   │   ├── Unshelve.jsx    (恢复归档的云主机)
│   │   │   │   │   │   ├── index.jsx
│   │   │   │   │   │   └── index.less
│   │   │   │   │   ├── components  (组件)
│   │   │   │   │   │   ├── FlavorSelectTable.jsx
│   │   │   │   │   │   └── index.less
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   └── index.less
│   │   │   │   ├── Keypair (密钥)
│   │   │   │   └── ServerGroup (云主机组)
│   │   │   └── routes  (计算菜单下的路由配置)
│   │   │       └── index.js
│   │   ├── configuration   (平台配置)
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   ├── Metadata    (元数据定义)
│   │   │   │   ├── Setting (系统配置)
│   │   │   │   └── SystemInfo  (系统信息)
│   │   │   └── routes  (平台配置菜单下的路由配置)
│   │   │       └── index.js
│   │   ├── heat    (资源编排)
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   └── Stack   (堆栈)
│   │   │   └── routes  (资源编排菜单下的路由配置)
│   │   │       └── index.js
│   │   ├── identity    (身份管理)
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   ├── Domain  (域)
│   │   │   │   ├── Project (项目)
│   │   │   │   ├── Role    (角色)
│   │   │   │   ├── User    (用户)
│   │   │   │   └── UserGroup   (用户组)
│   │   │   └── routes  (路由配置)
│   │   │       └── index.js
│   │   ├── management  (运维管理)
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   └── RecycleBin  (回收站)
│   │   │   └── routes  (路由配置)
│   │   │       └── index.js
│   │   ├── network (网络)
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   ├── FloatingIp  (浮动IP)
│   │   │   │   ├── LoadBalancers   (负载均衡)
│   │   │   │   ├── Network (网络)
│   │   │   │   ├── QoSPolicy   (Qos策略)
│   │   │   │   ├── Router  (路由器)
│   │   │   │   ├── SecurityGroup   (安全组)
│   │   │   │   ├── Topology    (网络拓扑)
│   │   │   │   ├── VPN (VPN)
│   │   │   │   └── VirtualAdapter  (虚拟网卡)
│   │   │   └── routes  (路由配置)
│   │   │       └── index.js
│   │   ├── storage (存储)
│   │   │   ├── App.jsx
│   │   │   ├── containers
│   │   │   │   ├── Backup  (备份)
│   │   │   │   ├── Snapshot    (云硬盘快照)
│   │   │   │   ├── Storage (存储后端)
│   │   │   │   ├── Volume  (云硬盘)
│   │   │   │   └── VolumeType  (云硬盘类型)
│   │   │   │       ├── QosSpec (QoS)
│   │   │   │       ├── VolumeType  (云硬盘类型)
│   │   │   │       └── index.jsx
│   │   │   └── routes  ()
│   │   │       └── index.js
│   │   └── user    (登录页面)
│   │       ├── App.jsx
│   │       ├── containers
│   │       │   ├── ChangePassword  (修改密码--根据系统配置)
│   │       │   │   ├── index.jsx
│   │       │   │   └── index.less
│   │       │   └── Login   (登录)
│   │       │       ├── index.jsx
│   │       │       └── index.less
│   │       └── routes  (路由配置)
│   │           └── index.js
│   ├── resources   (存放各资源的自身使用的公用函数，状态等)
│   ├── stores  (数据处理，按资源类型划分文件夹)
│   │   ├── base-list.js    (列表数据的基类)
│   │   ├── base.js (数据操作的基类)
│   │   ├── cinder
│   │   ├── glance
│   │   ├── heat
│   │   ├── ironic
│   │   ├── keystone
│   │   ├── neutron
│   │   ├── nova
│   │   ├── octavia
│   │   ├── overview-admin.js
│   │   ├── project.js
│   │   ├── root.js
│   │   └── skyline
│   ├── styles  (公用样式)
│   │   ├── base.less
│   │   ├── main.less
│   │   ├── reset.less
│   │   └── variables.less
│   └── utils   (基础函数)
│       ├── RouterConfig.jsx
│       ├── constants.js
│       ├── cookie.js
│       ├── file.js
│       ├── file.spec.js
│       ├── index.js
│       ├── index.test.js   (单元测试)
│       ├── local-storage.js
│       ├── local-storage.spec.js   (单元测试)
│       ├── request.js
│       ├── table.jsx
│       ├── time.js
│       ├── time.spec.js
│       ├── translate.js
│       ├── translate.spec.js
│       ├── validate.js
│       ├── yaml.js
│       └── yaml.spec.js
├── test
│   ├── e2e (E2E测试)
│   └── unit (单元测试)
├── tools
│   └── git_config
│       └── commit_message.txt
└── yarn.lock
```
