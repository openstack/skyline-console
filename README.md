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

## Docs

### How to develop

- [Preparation before development](docs/en/develop/1-ready-to-work.md)
- [Directory structure](docs/en/develop/2-catalog-introduction.md)
- [Develop a new resource page](docs/en/develop/3-0-how-to-develop.md)
- [BaseList introduction](docs/en/develop/3-1-BaseList-introduction.md)
- [BaseTabList introduction](docs/en/develop/3-2-BaseTabList-introduction.md)
- [BaseDetail introduction](docs/en/develop/3-3-BaseDetail-introduction.md)
- [BaseDetailInfo introduction](docs/en/develop/3-4-BaseDetailInfo-introduction.md)
- [BaseStore introduction](docs/en/develop/3-5-BaseStore-introduction.md)
- [FormAction introduction](docs/en/develop/3-6-FormAction-introduction.md)
- [ModalAction introduction](docs/en/develop/3-7-ModalAction-introduction.md)
- [ConfirmAction introduction](docs/en/develop/3-8-ConfirmAction-introduction.md)
- [StepAction introduction](docs/en/develop/3-9-StepAction-introduction.md)
- [FormItem introduction](docs/en/develop/3-10-FormItem-introduction.md)
- [Action introduction](docs/en/develop/3-11-Action-introduction.md)
- [Menu introduction](docs/en/develop/3-12-Menu-introduction.md)
- [Route introduction](docs/en/develop/3-13-Route-introduction.md)
- [I18n introduction](docs/en/develop/3-14-I18n-introduction.md)

### How to test

- [Two kinds of tests](docs/en/test/1-ready-to-work.md)
- [Directory structure](docs/en/test/2-catalog-introduction.md)
- [How to edit e2e case](docs/en/test/3-0-how-to-edit-e2e-case.md)
- [E2E - Form operation](docs/en/test/3-1-E2E-form-operation.md)
- [E2E - Table operation](docs/en/test/3-2-E2E-table-operation.md)
- [E2E - Detail operation](docs/en/test/3-3-E2E-detail-operation.md)
- [E2E - Resource operation](docs/en/test/3-4-E2E-resource-operation.md)
