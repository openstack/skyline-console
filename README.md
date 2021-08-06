# Instructions

[简体中文](./README-zh_CN.md)| English

## Prerequisites

- `node`: lts/erbium (v12.\*)
- `yarn`: 1.22.4 +

## Local Environment

Take CentOS as an example

- Install nvm ( version control system for nodejs )

  ```shell
  wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
  bash /root/install.sh
  . /root/.nvm/nvm.sh
  ```

- Install nodejs

  ```shell
  NODE_VERSION=erbium
  nvm install --lts=$NODE_VERSION
  nvm alias default lts/$NODE_VERSION
  nvm use default
  ```

- Verify nodejs and npm versions

  ```shell
  node -v
  # v12.*.*
  npm -v
  # 6.*.*
  ```

- Install yarn

  ```shell
  npm install -g yarn
  ```

- Install the project dependency under the root directory, with `package.json`in the same place.

  ```shell
  yarn install
  ```

  After those steps, please just wait until the installation is complete.

## Usage

Under the root directory, with `package.json` in the same place.

- `yarn run mock`: Use the mock interface of [rap2](http://rap2.taobao.org/)
- `yarn run dev`: To use the actual interface，please change the "http://pre.xxx.com" in line 47 into the real address in file `webpack.dev.js`.
- `yarn run build`: Build packages and then you can hand over the contents of the generated _dist_ directory to the back end.
