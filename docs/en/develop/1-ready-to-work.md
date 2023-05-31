English | [Chinese](../../zh/develop/1-ready-to-work.md)

# Preparation before development

- Node environment
  - Requirement in package.json：`"node": ">=10.22.0"`
  - Verify nodejs version

    ```shell
    node -v
    ```

- Yarn
  - Install yarn

    ```shell
    npm install -g yarn
    ```

- Install dependencies
  - Execute in the project root directory, which is the same level as `package.json`, and wait patiently for the installation to complete

    ```shell
    yarn install
    ```

- Prepare a usable backend
  - Prepare an accessible backend, for example: https://172.20.154.250
  - Add file ``config/local_config.yaml``:

    ```yaml
    server: https://172.20.154.250
    ```

- Configure access host and port
  - The default configuration is in ``config/config.yaml``
    - `host` is `0.0.0.0`
    - `port` is `8088`
    - If the current configuration does not need to be changed,
       the following steps do not need to be operated.
  - Added file `config/local_config.yaml`
  - Add `host` and `port` configurations

    ```yaml
    host: localhost
    port: 8080
    ```

- Completed
  - Execute in the project root directory, which is the same level as `package.json`

    ```shell
    yarn run dev
    ```

  - Use the `host` and `port` configured in `config/config.yaml` or
  `config/local_config.yaml` to access, such as `http://localhost:8088`
  - The front-end real-time update environment used for development is done.

# Front-end package used in production environment

- Have the required `nodejs` and `yarn`
- Execute in the project root directory, which is the same level as `package.json`

  ```shell
  yarn run build
  ```

- The packaged files are in the `dist` directory and handed over to the deployment personnel.

# Front-end package used for testing

- Have the required `nodejs` and `yarn`
- Execute in the project root directory, which is the same level as `package.json`

  ```shell
  yarn run build:test
  ```

- The packaged files are in the `dist` directory
- Attention! ! ! This test package is designed to measure code coverage
- It is recommended to use nginx to complete the E2E test with code coverage.
