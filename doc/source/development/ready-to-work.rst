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

   -  Add file ``config/local_config.yaml``:

   .. code-block:: yaml

    server: https://172.20.154.250

-  Configure access host and port

   -  The default configuration is in ``config/config.yaml``
      -  ``host`` is ``0.0.0.0``
      -  ``port`` is ``8088``
      -  If the current configuration does not need to be changed,
      the following steps do not need to be operated.
   -  Added file ``config/local_config.yaml``
   -  Add ``host`` and ``port`` configurations

   .. code-block:: yaml

    host: localhost
    port: 8080

-  Completed

   -  Execute in the project root directory, which is the same level
      as ``package.json``

   .. code-block:: console

    yarn run dev

   - Use the :guilabel:`host` and :guilabel:`port` configured in
     ``config/config.yaml`` or ``config/local_config.yaml`` to access,
     such as ``http://localhost:8088``

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
