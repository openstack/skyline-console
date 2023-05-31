.. _configuration-settings:

==================================
Skyline Console Settings Reference
==================================

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

-  Execute in the project root directory, which is the same level as ``package.json``

   .. code:: shell

    yarn run dev

   - Use the ``host`` and ``port`` configured in ``config/config.yaml`` or ``config/local_config.yaml`` to access, such as ``http://localhost:8088``.

-  The front-end real-time update environment used for development is done.
