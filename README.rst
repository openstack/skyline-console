Instructions
============

`简体中文 <./README.zh_CN.rst>`__\ \| English

**Table of contents**

-  `Instructions <#instructions>`__

   -  `Resources <#resources>`__
   -  `Prerequisites <#prerequisites>`__
   -  `Local Environment <#local-environment>`__
   -  `Usage <#usage>`__
   -  `Docs <#docs>`__

      -  `How to develop <#how-to-develop>`__
      -  `How to test <#how-to-test>`__

Resources
---------

-  `Wiki <https://wiki.openstack.org/wiki/Skyline>`__
-  `Bug Tracker <https://launchpad.net/skyline-console>`__

Prerequisites
-------------

-  ``node``: lts/erbium (v12.*)
-  ``yarn``: 1.22.4 +

Local Environment
-----------------

Take CentOS as an example

-  Install nvm ( version control system for nodejs )

   .. code:: shell

      wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
      bash /root/install.sh
      . /root/.nvm/nvm.sh

-  Install nodejs

   .. code:: shell

      NODE_VERSION=erbium
      nvm install --lts=$NODE_VERSION
      nvm alias default lts/$NODE_VERSION
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

Usage
-----

Under the root directory, with ``package.json`` in the same place.

-  ``yarn run mock``: Use the mock interface of
   `rap2 <http://rap2.taobao.org/>`__
-  ``yarn run dev``: To use the actual interface, you can copy
   ``config/config.yaml`` to ``config/local_config.yaml`` , and
   replace the ``server`` value with the correct address.
-  ``yarn run build``: Build packages and then you can hand over the
   contents of the generated *dist* directory to the back end.

Docs
----

How to develop
~~~~~~~~~~~~~~

-  `Preparation before
   development <docs/en/develop/1-ready-to-work.md>`__
-  `Directory structure <docs/en/develop/2-catalog-introduction.md>`__
-  `Develop a new resource
   page <docs/en/develop/3-0-how-to-develop.md>`__
-  `BaseList
   introduction <docs/en/develop/3-1-BaseList-introduction.md>`__
-  `BaseTabList
   introduction <docs/en/develop/3-2-BaseTabList-introduction.md>`__
-  `BaseDetail
   introduction <docs/en/develop/3-3-BaseDetail-introduction.md>`__
-  `BaseDetailInfo
   introduction <docs/en/develop/3-4-BaseDetailInfo-introduction.md>`__
-  `BaseStore
   introduction <docs/en/develop/3-5-BaseStore-introduction.md>`__
-  `FormAction
   introduction <docs/en/develop/3-6-FormAction-introduction.md>`__
-  `ModalAction
   introduction <docs/en/develop/3-7-ModalAction-introduction.md>`__
-  `ConfirmAction
   introduction <docs/en/develop/3-8-ConfirmAction-introduction.md>`__
-  `StepAction
   introduction <docs/en/develop/3-9-StepAction-introduction.md>`__
-  `FormItem
   introduction <docs/en/develop/3-10-FormItem-introduction.md>`__
-  `Action introduction <docs/en/develop/3-11-Action-introduction.md>`__
-  `Menu introduction <docs/en/develop/3-12-Menu-introduction.md>`__
-  `Route introduction <docs/en/develop/3-13-Route-introduction.md>`__
-  `I18n introduction <docs/en/develop/3-14-I18n-introduction.md>`__

How to test
~~~~~~~~~~~

-  `Two kinds of tests <docs/en/test/1-ready-to-work.md>`__
-  `Directory structure <docs/en/test/2-catalog-introduction.md>`__
-  `How to edit e2e case <docs/en/test/3-0-how-to-edit-e2e-case.md>`__
-  `E2E - Form operation <docs/en/test/3-1-E2E-form-operation.md>`__
-  `E2E - Table operation <docs/en/test/3-2-E2E-table-operation.md>`__
-  `E2E - Detail operation <docs/en/test/3-3-E2E-detail-operation.md>`__
-  `E2E - Resource
   operation <docs/en/test/3-4-E2E-resource-operation.md>`__

How to build
~~~~~~~~~~~~

- `Build Wheel <docs/en/develop/4-0-build-wheel.md>`__
