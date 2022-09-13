.. _configuration-settings:

==================================
Skyline Console Settings Reference
==================================

-  Prepare a usable backend

   -  Prepare an accessible backend, for example: ``https://172.20.154.250``

   -  Modify the corresponding configuration in ``config/webpack.dev.js``:

   .. code:: javascript

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

   -  Modify ``devServer.host`` and ``devServer.port``

   -  Modify the corresponding configuration in ``config/webpack.dev.js``

   .. code:: javascript

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

-  Execute in the project root directory, which is the same level as ``package.json``

   .. code:: shell

    yarn run dev

-  Use the ``host`` and ``port`` configured in ``config/webpack.dev.js`` to access, such as ``http://localhost:8088``

-  The front-end real-time update environment used for development is done.
