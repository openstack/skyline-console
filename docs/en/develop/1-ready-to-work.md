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
  - Modify the corresponding configuration in `config/webpack.dev.js`:

    ```javascript
    if (API === 'mock' || API === 'dev') {
      devServer.proxy = {
        '/api': {
          target: 'https://172.20.154.250',
          changeOrigin: true,
          secure: false,
        },
      };
    }
    ```

- Configure access host and port
  - Modify `devServer.host` and `devServer.port`
  - Modify the corresponding configuration in `config/webpack.dev.js`

    ```javascript
    const devServer = {
      host: '0.0.0.0',
      // host: 'localhost',
      port: 8088,
      contentBase: root('dist'),
      historyApiFallback: true,
      compress: true,
      hot: true,
      inline: true,
      disableHostCheck: true,
      // progress: true
    };
    ```

- Completed
  - Execute in the project root directory, which is the same level as `package.json`

    ```shell
    yarn run dev
    ```

  - Use the `host` and `port` configured in `config/webpack.dev.js` to access, such as `http://localhost:8088`
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
