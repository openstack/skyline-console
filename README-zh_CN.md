# 使用说明

简体中文 | [English](./README.md)

## 环境依赖

- `node`: lts/erbium (v12.\*)
- `yarn`: 1.22.4 +

## 本地环境搭建

以 CentOS 为例

- 安装 nvm (nodejs 版本管理工具)

  ```shell
  wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
  bash /root/install.sh
  . /root/.nvm/nvm.sh
  ```

- 安装 nodejs

  ```shell
  NODE_VERSION=erbium
  nvm install --lts=$NODE_VERSION
  nvm alias default lts/$NODE_VERSION
  nvm use default
  ```

- 验证 nodejs 和 npm 版本

  ```shell
  node -v
  # v12.*.*
  npm -v
  # 6.*.*
  ```

- 安装 yarn

  ```shell
  npm install -g yarn
  ```

- 安装项目依赖

  在项目根目录下，`package.json`同级。

  ```shell
  yarn install
  ```

  等待安装完成即可。

## 开发使用方法

在项目根目录下，`package.json`同级。

- `yarn run mock`: 使用[rap2](http://rap2.taobao.org/)工具 mock 接口
- `yarn run dev`: 使用实际接口，需要将`webpack.dev.js`文件第 47 行的 "http://pre.xxx.com"
  修改为实际地址
- `yarn run build`: 构建打包，可将生成的 dist 目录的内容交给后端

## 文档

### 如何开发

- [开发前的准备](docs/zh/develop/1-ready-to-work.md)
- [目录结构](docs/zh/develop/2-catalog-introduction.md)
- [开发一个资源的页面](docs/zh/develop/3-0-how-to-develop.md)
- [BaseList 介绍](docs/zh/develop/3-1-BaseList-introduction.md)
- [BaseTabList 介绍](docs/zh/develop/3-2-BaseTabList-introduction.md)
- [BaseDetail 介绍](docs/zh/develop/3-3-BaseDetail-introduction.md)
- [BaseDetailInfo 介绍](docs/zh/develop/3-4-BaseDetailInfo-introduction.md)
- [BaseStore 介绍](docs/zh/develop/3-5-BaseStore-introduction.md)
- [FormAction 介绍](docs/zh/develop/3-6-FormAction-introduction.md)
- [ModalAction 介绍](docs/zh/develop/3-7-ModalAction-introduction.md)
- [ConfirmAction 介绍](docs/zh/develop/3-8-ConfirmAction-introduction.md)
- [StepAction 介绍](docs/zh/develop/3-9-StepAction-introduction.md)
- [FormItem 介绍](docs/zh/develop/3-10-FormItem-introduction.md)
- [Action 介绍](docs/zh/develop/3-11-Action-introduction.md)
- [Menu 介绍](docs/zh/develop/3-12-Menu-introduction.md)
- [Route 介绍](docs/zh/develop/3-13-Route-introduction.md)
- [I18n 介绍](docs/zh/develop/3-14-I18n-introduction.md)

### How to test

- [两种不同的测试方式](docs/zh/test/1-ready-to-work.md)
- [目录结构](docs/zh/test/2-catalog-introduction.md)
- [如何修改 e2e 测试用例](docs/zh/test/3-0-how-to-edit-e2e-case.md)
- [E2E - 表单操作](docs/zh/test/3-1-E2E-form-operation.md)
- [E2E - 列表页操作](docs/zh/test/3-2-E2E-table-operation.md)
- [E2E - 详情页操作](docs/zh/test/3-3-E2E-detail-operation.md)
- [E2E - 资源操作](docs/zh/test/3-4-E2E-resource-operation.md)
