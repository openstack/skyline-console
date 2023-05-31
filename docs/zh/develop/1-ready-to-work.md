简体中文 | [English](../../en/develop/1-ready-to-work.md)

# 开发前准备

- node 环境
  - package.json 中要求：`"node": ">=10.22.0"`
  - 验证 nodejs 版本

    ```shell
    node -v
    ```

- yarn
  - 安装 yarn

    ```shell
    npm install -g yarn
    ```

- 安装依赖包
  - 在项目根目录下执行，即`package.json`同级，需要耐心等待安装完成

    ```shell
    yarn install
    ```

- 准备好可用的后端
  - 准备好可访问的后端，举个例子：https://172.20.154.250
  - 新增 `config/local_config.yaml` 中的 `server` 配置：

    ```yaml
    server: https://172.20.154.250
    ```

- 配置访问的 host 与 port
  - 默认配置在 `config/config.yaml`
    - `host` 为 `0.0.0.0`
    - `port` 为 `8088`
    - 如果当前配置无需变更，则下面的步骤无需操作
  - 新增 `config/local_config.yaml`
  - 添加 `host` 与 `port` 配置

    ```yaml
    host: localhost
    port: 8080
    ```

- 搭建完成
  - 在项目根目录下执行，即`package.json`同级

    ```shell
    yarn run dev
    ```

  - 使用 `config/local_config.yaml` 或 `config/config.yaml` 中配置
  的 `host` 与 `port` 访问即可，如`http://localhost:8088`
  - 开发使用的前端实时更新环境搞定。

# 生产环境使用的前端包

- 具备符合要求的`nodejs`与`yarn`
- 在项目根目录下执行，即`package.json`同级

  ```shell
  yarn run build
  ```

- 打包后的文件在`dist`目录，交给部署相关人员即可。

# 测试使用的前端包

- 具备符合要求的`nodejs`与`yarn`
- 在项目根目录下执行，即`package.json`同级

  ```shell
  yarn run build:test
  ```

- 打包后的文件在`dist`目录
- 注意！！！这个测试包为了测出代码覆盖率的
- 建议使用 nginx，以完成带有代码覆盖率的 E2E 测试。
