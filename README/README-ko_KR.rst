사용방법
========

`简体中文 <./README-zh_CN.rst>`__ \| `English <../README.rst>`__ \| 한국어

**목차**

-  `사용방법 <#사용방법>`__

   -  `자원 <#자원>`__
   -  `전제조건 <#전제조건>`__
   -  `로컬 환경 <#로컬-환경>`__
   -  `사용법 <#사용법>`__
   -  `문서 <#문서>`__

      -  `개발 방법 <#개발-방법>`__
      -  `테스트 방법 <#테스트-방법>`__

자원
-----

-  `위키 <https://wiki.openstack.org/wiki/Skyline>`__
-  `버그 트래커 <https://launchpad.net/skyline-console>`__

전제조건
---------

-  ``node``: lts/erbium (v12.*)
-  ``yarn``: 1.22.4 +

로컬 환경
---------

CentOS로 예시를 진행합니다.

-  nvm 설치 ( nodejs용 버전관리 시스템 )

   .. code:: shell

      wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
      bash /root/install.sh
      . /root/.nvm/nvm.sh

-  nodejs 설치

   .. code:: shell

      NODE_VERSION=erbium
      nvm install --lts=$NODE_VERSION
      nvm alias default lts/$NODE_VERSION
      nvm use default

-  nodejs 와 npm 버전 확인

   .. code:: shell

      node -v
      # v12.*.*
      npm -v
      # 6.*.*

-  yarn 설치

   .. code:: shell

      npm install -g yarn

-  루트 디렉토리에, ``package.json`` 이 위치해 있습니다.

   .. code:: shell

      yarn install

   이후, 잠시 기다리면 설치가 완료됩니다.

사용법
------

루트 디렉토리에, ``package.json`` 이 위치해 있습니다.

-  ``yarn run mock``: `rap2 <http://rap2.taobao.org/>`__ 의 모의 인터페이스를 사용합니다.
-  ``yarn run dev``: 실제 인터페이스를 사용하려면 ``config/config.yaml`` 를
   ``config/local_config.yaml`` 로 복사하고, ``server`` 의 값을 실제 주소로 대체합니다.
-  ``yarn run build``: 패키지를 빌드하고 *dist* 디렉토리의 내용을 백엔드로 전달할 수 있습니다.

문서
----

개발 방법
~~~~~~~~~

-  `Preparation before
   development <../docs/en/develop/1-ready-to-work.md>`__
-  `Directory structure <../docs/en/develop/2-catalog-introduction.md>`__
-  `Develop a new resource
   page <../docs/en/develop/3-0-how-to-develop.md>`__
-  `BaseList
   introduction <../docs/en/develop/3-1-BaseList-introduction.md>`__
-  `BaseTabList
   introduction <../docs/en/develop/3-2-BaseTabList-introduction.md>`__
-  `BaseDetail
   introduction <../docs/en/develop/3-3-BaseDetail-introduction.md>`__
-  `BaseDetailInfo
   introduction <../docs/en/develop/3-4-BaseDetailInfo-introduction.md>`__
-  `BaseStore
   introduction <../docs/en/develop/3-5-BaseStore-introduction.md>`__
-  `FormAction
   introduction <../docs/en/develop/3-6-FormAction-introduction.md>`__
-  `ModalAction
   introduction <../docs/en/develop/3-7-ModalAction-introduction.md>`__
-  `ConfirmAction
   introduction <../docs/en/develop/3-8-ConfirmAction-introduction.md>`__
-  `StepAction
   introduction <../docs/en/develop/3-9-StepAction-introduction.md>`__
-  `FormItem
   introduction <../docs/en/develop/3-10-FormItem-introduction.md>`__
-  `Action introduction <../docs/en/develop/3-11-Action-introduction.md>`__
-  `Menu introduction <../docs/en/develop/3-12-Menu-introduction.md>`__
-  `Route introduction <../docs/en/develop/3-13-Route-introduction.md>`__
-  `I18n introduction <../docs/en/develop/3-14-I18n-introduction.md>`__

테스트 방법
~~~~~~~~~~~

-  `Two kinds of tests <../docs/en/test/1-ready-to-work.md>`__
-  `Directory structure <../docs/en/test/2-catalog-introduction.md>`__
-  `How to edit e2e case <../docs/en/test/3-0-how-to-edit-e2e-case.md>`__
-  `E2E - Form operation <../docs/en/test/3-1-E2E-form-operation.md>`__
-  `E2E - Table operation <../docs/en/test/3-2-E2E-table-operation.md>`__
-  `E2E - Detail operation <../docs/en/test/3-3-E2E-detail-operation.md>`__
-  `E2E - Resource
   operation <../docs/en/test/3-4-E2E-resource-operation.md>`__
