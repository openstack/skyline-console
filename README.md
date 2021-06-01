# 使用说明

简体中文 | [English](./en.md)

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
- `yarn run dev`: 使用实际接口，需要将`webpack.dev.js`文件第 27 行的 "http://pre.xxx.com"
  修改为实际地址
- `yarn run build`: 构建打包，可将生成的 dist 目录的内容交给后端
