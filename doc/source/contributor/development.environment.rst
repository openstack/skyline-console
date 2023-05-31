Setting Up a Development Environment
====================================

This page describes how to setup a working development environment that
can be used in developing skyline-console on Linux. These instructions
assume you're already familiar with git. Refer to GettingTheCode_ for
additional information.

.. _GettingTheCode: https://wiki.openstack.org/wiki/Getting_The_Code

Following these instructions will allow you to run the skyline-console unit
tests.

Linux Systems
-------------

Install system dependencies

- `Ubuntu/Debian`

   .. code:: shell

      sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

- `CentOS`

   .. code:: shell

      yum install -y xorg-x11-server-Xvfb gtk2-devel gtk3-devel libnotify-devel GConf2 nss libXScrnSaver alsa-lib

Getting the code
----------------
Grab the code::

    git clone https://opendev.org/openstack/skyline-console.git
    cd skyline-console

Setup Your Local Development Env
--------------------------------

-  Install nvm ( version control system for nodejs )

   .. code:: shell

      wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
      bash /root/install.sh
      . /root/.nvm/nvm.sh

-  Install nodejs

   .. code:: shell

      nvm install --lts=Erbium
      nvm alias default lts/erbium
      nvm use default

-  Verify nodejs and npm versions

   .. code:: shell

      node -v
      # v12.*.*
      npm -v
      # 6.*.*

-  Install yarn

   .. code:: shell

      npm install -g yarn

-  Install the project dependency under the root directory, with
   ``package.json`` in the same place.

   .. code:: shell

      yarn install

   After those steps, please just wait until the installation is
   complete.

You can also use the following commands:

-  ``yarn run mock``: Use the mock interface of
   `rap2 <http://rap2.taobao.org/>`__
-  ``yarn run dev``: To use the actual interface, you can copy
   ``config/config.yaml`` to ``config/local_config.yaml`` , and
   replace the ``server`` value with the correct address.
-  ``yarn run build``: Build packages and then you can hand over the
   contents of the generated *dist* directory to the back end.

For more information about configuration, see :ref:`configuration-settings`.

Running tests
-------------

- e2e tests

   .. code:: shell

      yarn run test:e2e

- unit tests

   .. code:: shell

      yarn run test:unit

Contributing Your Work
----------------------

Once your work is complete you may wish to contribute it to the project.
skyline-console uses the Gerrit code review system. For information on
how to submit your branch to Gerrit, see GerritWorkflow_.

.. _GerritWorkflow: https://docs.openstack.org/infra/manual/developers.html#development-workflow
