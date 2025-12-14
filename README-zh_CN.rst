使用说明
========

简体中文 \| `English <../README.rst>`__ \| `한국어 <./README-ko_KR.rst>`__

**目录**

-  `使用说明 <#使用说明>`__

   -  `资源 <#资源>`__
   -  `环境依赖 <#环境依赖>`__
   -  `本地环境搭建 <#本地环境搭建>`__
   -  `开发使用方法 <#开发使用方法>`__
   -  `文档 <#文档>`__

      -  `如何开发 <#如何开发>`__
      -  `如何测试 <#如何测试>`__

资源
----

-  `Wiki <https://wiki.openstack.org/wiki/Skyline>`__
-  `Bug 跟踪器 <https://launchpad.net/skyline-console>`__

环境依赖
--------

-  ``node``: lts/erbium (v12.*)
-  ``yarn``: 1.22.4 +

本地环境搭建
------------

以 CentOS 为例

-  安装 nvm (nodejs 版本管理工具)

   .. code:: shell

      wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
      bash /root/install.sh
      . /root/.nvm/nvm.sh

-  安装 nodejs

   .. code:: shell

      NODE_VERSION=erbium
      nvm install --lts=$NODE_VERSION
      nvm alias default lts/$NODE_VERSION
      nvm use default

-  验证 nodejs 和 npm 版本

   .. code:: shell

      node -v
      # v12.*.*
      npm -v
      # 6.*.*

-  安装 yarn

   .. code:: shell

      npm install -g yarn

-  安装项目依赖

   在项目根目录下，\ ``package.json``\ 同级。

   .. code:: shell

      yarn install

   等待安装完成即可。

开发使用方法
------------

在项目根目录下，\ ``package.json``\ 同级。

-  ``yarn run mock``: 使用\ `rap2 <http://rap2.taobao.org/>`__\ 工具
   mock 接口
-  ``yarn run dev``: 使用实际接口，可复制 \ ``config/config.yaml``\ 到
   \ ``config/local_config.yaml``\ ，将 \ ``server``\ 替换为正确的地址
-  ``yarn run build``: 构建打包，可将生成的 dist 目录的内容交给后端

文档
----

如何开发
~~~~~~~~

-  `开发前的准备 <../docs/zh/develop/1-ready-to-work.md>`__
-  `目录结构 <../docs/zh/develop/2-catalog-introduction.md>`__
-  `开发一个资源的页面 <../docs/zh/develop/3-0-how-to-develop.md>`__
-  `BaseList 介绍 <../docs/zh/develop/3-1-BaseList-introduction.md>`__
-  `BaseTabList
   介绍 <../docs/zh/develop/3-2-BaseTabList-introduction.md>`__
-  `BaseDetail 介绍 <../docs/zh/develop/3-3-BaseDetail-introduction.md>`__
-  `BaseDetailInfo
   介绍 <../docs/zh/develop/3-4-BaseDetailInfo-introduction.md>`__
-  `BaseStore 介绍 <../docs/zh/develop/3-5-BaseStore-introduction.md>`__
-  `FormAction 介绍 <../docs/zh/develop/3-6-FormAction-introduction.md>`__
-  `ModalAction
   介绍 <../docs/zh/develop/3-7-ModalAction-introduction.md>`__
-  `ConfirmAction
   介绍 <../docs/zh/develop/3-8-ConfirmAction-introduction.md>`__
-  `StepAction 介绍 <../docs/zh/develop/3-9-StepAction-introduction.md>`__
-  `FormItem 介绍 <../docs/zh/develop/3-10-FormItem-introduction.md>`__
-  `Action 介绍 <../docs/zh/develop/3-11-Action-introduction.md>`__
-  `Menu 介绍 <../docs/zh/develop/3-12-Menu-introduction.md>`__
-  `Route 介绍 <../docs/zh/develop/3-13-Route-introduction.md>`__
-  `I18n 介绍 <../docs/zh/develop/3-14-I18n-introduction.md>`__

如何测试
~~~~~~~~

-  `两种不同的测试方式 <../docs/zh/test/1-ready-to-work.md>`__
-  `目录结构 <../docs/zh/test/2-catalog-introduction.md>`__
-  `如何修改 e2e 测试用例 <../docs/zh/test/3-0-how-to-edit-e2e-case.md>`__
-  `E2E - 表单操作 <../docs/zh/test/3-1-E2E-form-operation.md>`__
-  `E2E - 列表页操作 <../docs/zh/test/3-2-E2E-table-operation.md>`__
-  `E2E - 详情页操作 <../docs/zh/test/3-3-E2E-detail-operation.md>`__
-  `E2E - 资源操作 <../docs/zh/test/3-4-E2E-resource-operation.md>`__
