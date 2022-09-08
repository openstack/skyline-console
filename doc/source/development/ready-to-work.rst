Ready To Work
~~~~~~~~~~~~~~

For more information about installation, refer to the :ref:`source-install-ubuntu`

Preparation before development
------------------------------

-  Node environment

   -  Requirement in package.json: ``"node": ">=10.22.0"``
   -  Verify nodejs version

   .. code-block:: console

    node -v

-  Yarn

   -  Install yarn

   .. code-block:: console

    npm install -g yarn

-  Install dependencies

   -  Execute in the project root directory, which is the same level as
      ``package.json``, and wait patiently for the installation to complete

   .. code-block:: console

    yarn install

-  Prepare a usable backend

   -  Prepare an accessible backend, for example: ``https://172.20.154.250``

   -  Modify the corresponding configuration in ``config/webpack.dev.js``:

   .. code-block:: javascript

    if (API === 'mock' || API === 'dev') {
      devServer.proxy = {
        '/api': {
          target: 'https://172.20.154.250',
          changeOrigin: true,
          secure: false,
        },
      };
    }

-  Configure access host and port

   -  Modify :guilabel:`devServer.host` and :guilabel:`devServer.port`

   -  Modify the corresponding configuration in ``config/webpack.dev.js``

   .. code-block:: javascript

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

-  Completed

   -  Execute in the project root directory, which is the same level
      as ``package.json``

   .. code-block:: console

    yarn run dev

   - Use the :guilabel:`host` and :guilabel:`port` configured in
     ``config/webpack.dev.js`` to access, such as ``http://localhost:8088``

   - The front-end real-time update environment used for development is done.

Front-end package used in production environment
------------------------------------------------

Have the required ``nodejs`` and ``yarn``

Execute in the project root directory, which is the same level
as ``package.json``

.. code-block:: console

 yarn run build

The packaged files are in the ``dist`` directory and handed over
to the deployment personnel.

Front-end package used for testing
-----------------------------------

Have the required ``nodejs`` and ``yarn``

Execute in the project root directory, which is the same level
as ``package.json``

.. code-block:: console

 yarn run build:test

The packaged files are in the ``dist`` directory

.. note::

 This test package is designed to measure code coverage

 It is recommended to use nginx to complete the E2E test with code coverage
