Catalog Introduction
~~~~~~~~~~~~~~~~~~~~

Introduction to the first-level directory
-----------------------------------------

-  :guilabel:`Gruntfile.js`: Used to collect i18n

-  :guilabel:`LICENSE`: This project uses Apache License

-  :guilabel:`Makefile`

-  :guilabel:`README.rst`: A brief description of the front-end startup,
   please refer to the docs for details

-  :guilabel:`config`: webpack configuration, which contains webpack
   configuration in public, development environment, test environment,
   and build environment

-  :guilabel:`cypress.json`: E2E test configuration file

-  :guilabel:`docker`: Contains the docker configuration used in the
   development environment, generation environment, and test environment

-  :guilabel:`docs`: Documentation introduction, including Chinese, English,
   development documentation, testing documentation

-  :guilabel:`jest.config.js`: Unit test configuration file

-  :guilabel:`jsconfig.json`: javascript code configuration file

-  :guilabel:`package.json`: Configuration files such as installation
   packages and commands

-  :guilabel:`yarn.lock`: The version lock file of the package

-  :guilabel:`.babelrc`: Babel configuration file

-  :guilabel:`.dockerignore`: File configuration ignored by docker

-  :guilabel:`.eslintignore`: File configuration ignored by eslint

-  :guilabel:`.eslint`: Eslint configuration

-  :guilabel:`.gitignore`: File configuration ignored by git

-  :guilabel:`.gitreview`: Gitreview configuration

-  :guilabel:`.prettierignore`: File configuration ignored by prettier

-  :guilabel:`.prettierrc`: Prettier configuration

-  :guilabel:`src`: **The folder where the development code is located**

-  :guilabel:`test`: **The folder where the test code is located,
   contains e2e test code and basic code for unit testing**

-  :guilabel:`tools`: Other tools folder, containing git tools

Catalog Introduction-Image Version
-----------------------------------

.. code-block:: text

    .
    ├── Gruntfile.js (Used to collect i18n)
    ├── LICENSE
    ├── Makefile
    ├── README.rst
    ├── config
    │   ├── config.yaml (The default configuration of host, port, and server during development)
    │   ├── local_config.yaml (gitignore file, you can configure the host/port/server used in the actual development, if the actual value is different from the default value in config.yaml, you can modify it in this file)
    │   ├── server.dev.js (Read the custom configuration information used during development)
    │   ├── utils.js
    │   ├── theme.js
    │   ├── webpack.common.js
    │   ├── webpack.dev.js  (Webpack configuration used during development)
    │   ├── webpack.e2e.js  (The webpack configuration used during e2e testing can generate a package for testing coverage)
    │   └── webpack.prod.js (Webpack packaging configuration used by the generation environment)
    ├── cypress.json    (E2E configuration)
    ├── docker
    │   ├── dev.dockerfile
    │   ├── nginx.conf
    │   ├── prod.dockerfile
    │   └── test.dockerfile
    ├── docs    (Documents)
    ├── jest.config.js  (Unit testing configuration)
    ├── jsconfig.json
    ├── package.json
    ├── src
    │   ├── api (Api summary, not used yet)
    │   ├── asset
    │   │   ├── image   (Images placement)
    │   │   └── template
    │   │       └── index.html
    │   ├── components  (Public components)
    │   ├── containers
    │   │   ├── Action
    │   │   │   ├── ConfirmAction   (Confirmed action base class)
    │   │   │   ├── FormAction   (Single page action base class)
    │   │   │   ├── ModalAction   (Pop-up action base class)
    │   │   │   ├── StepAction   (Multi-step single-page action, for example: create a cloud host)
    │   │   │   └── index.jsx
    │   │   ├── BaseDetail  (Detail page base class with detailed information)
    │   │   ├── List    (The base class of the list page, for example: cloud host)
    │   │   ├── TabDetail   (The base class of the detail page with tab switching, for example: instance details)
    │   │   └── TabList (List page with tab switch)
    │   ├── core
    │   │   ├── App.jsx
    │   │   ├── i18n.js
    │   │   ├── index.jsx   (Entry)
    │   │   └── routes.js   (Routing configuration by module)
    │   ├── layouts
    │   │   ├── Base    (Layout used after login)
    │   │   ├── Blank    (Blank layout)
    │   │   ├── User    (Layout used for login)
    │   │   ├── admin-menu.jsx  (Menu configuration used by the management platform)
    │   │   └── menu.jsx    (Menu configuration used by the console)
    │   ├── locales (Translation)
    │   │   ├── en.json
    │   │   ├── index.js
    │   │   └── zh.json
    │   ├── pages (The page-directory structure is assigned according to: menu item-secondary menu, where the pages of the secondary menu are placed in the containers folder)
    │   │   ├── base
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   ├── 404 (404 page)
    │   │   │   │   │   └── index.jsx
    │   │   │   │   ├── AdminOverview   (Management platform home page)
    │   │   │   │   │   ├── components
    │   │   │   │   │   │   ├── ComputeService.jsx
    │   │   │   │   │   │   ├── NetworkService.jsx
    │   │   │   │   │   │   ├── PlatformInfo.jsx
    │   │   │   │   │   │   ├── ResourceOverview.jsx
    │   │   │   │   │   │   └── VirtualResource.jsx
    │   │   │   │   │   ├── index.jsx
    │   │   │   │   │   └── style.less
    │   │   │   │   └── Overview   (Console home page)
    │   │   │   │       ├── components
    │   │   │   │       │   ├── ProjectInfo.jsx
    │   │   │   │       │   ├── QuotaOverview.jsx
    │   │   │   │       │   └── ResourceStatistic.jsx
    │   │   │   │       ├── index.jsx
    │   │   │   │       └── style.less
    │   │   │   └── routes  (Routing configuration)
    │   │   │       └── index.js
    │   │   ├── compute
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   ├── BareMetalNode   (Bare metal configuration)
    │   │   │   │   ├── Flavor  (Instance type)
    │   │   │   │   ├── HostAggregate   (Host Aggregate)
    │   │   │   │   │   ├── Aggregate   (Host Aggregate)
    │   │   │   │   │   ├── AvailabilityZone    (Availability zone)
    │   │   │   │   │   └── index.jsx
    │   │   │   │   ├── Hypervisors (Hypervisors management)
    │   │   │   │   │   ├── ComputeHost (Compute host)
    │   │   │   │   │   ├── Hypervisor  (Hypervisor manager)
    │   │   │   │   │   └── index.jsx
    │   │   │   │   ├── Image   (Image)
    │   │   │   │   ├── Instance    (Instance)
    │   │   │   │   │   ├── Detail  (Detail page)
    │   │   │   │   │   │   ├── BaseDetail  (Base info)
    │   │   │   │   │   │   ├── SecurityGroup   (Security group)
    │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   ├── actions (Actions)
    │   │   │   │   │   │   ├── AssociateFip.jsx    (Associate fip ip)
    │   │   │   │   │   │   ├── AttachInterface.jsx (Attach interface)
    │   │   │   │   │   │   ├── AttachIsoVolume.jsx (Attach iso volume)
    │   │   │   │   │   │   ├── AttachVolume.jsx (Attach volume)
    │   │   │   │   │   │   ├── ChangePassword.jsx  (Change password)
    │   │   │   │   │   │   ├── Console.jsx (Console)
    │   │   │   │   │   │   ├── CreateImage.jsx (Create Image)
    │   │   │   │   │   │   ├── CreateIronic    (Create ironic-Step-by-step Form)
    │   │   │   │   │   │   │   ├── BaseStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── ConfirmStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── NetworkStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── SystemStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── index.jsx
    │   │   │   │   │   │   │   └── index.less
    │   │   │   │   │   │   ├── CreateSnapshot.jsx  (Create snapshot)
    │   │   │   │   │   │   ├── Delete.jsx  (Delete instance)
    │   │   │   │   │   │   ├── DeleteIronic.jsx    (Delete ironic)
    │   │   │   │   │   │   ├── DetachInterface.jsx (Detach interface)
    │   │   │   │   │   │   ├── DetachIsoVolume.jsx (Detach iso volume)
    │   │   │   │   │   │   ├── DetachVolume.jsx    (Detach volume)
    │   │   │   │   │   │   ├── DisassociateFip.jsx (Disassociate fip iP)
    │   │   │   │   │   │   ├── Edit.jsx    (Edit instance)
    │   │   │   │   │   │   ├── ExtendRootVolume.jsx    (Expand the root disk)
    │   │   │   │   │   │   ├── LiveMigrate.jsx (Live migrate)
    │   │   │   │   │   │   ├── Lock.jsx    (Lock instance)
    │   │   │   │   │   │   ├── ManageSecurityGroup.jsx (Manage security group)
    │   │   │   │   │   │   ├── Migrate.jsx (Migrate)
    │   │   │   │   │   │   ├── Pause.jsx   (Pause instance)
    │   │   │   │   │   │   ├── Reboot.jsx  (Reboot instance)
    │   │   │   │   │   │   ├── Rebuild.jsx (Rebuild instance)
    │   │   │   │   │   │   ├── RebuildSelect.jsx   (Select the image to rebuild the instance)
    │   │   │   │   │   │   ├── Resize.jsx  (Change configuration)
    │   │   │   │   │   │   ├── ResizeOnline.jsx    (Modify configuration online)
    │   │   │   │   │   │   ├── Resume.jsx  (Resume instance)
    │   │   │   │   │   │   ├── Shelve.jsx  (Shelve instance)
    │   │   │   │   │   │   ├── SoftDelete.jsx  (Soft delete instance)
    │   │   │   │   │   │   ├── SoftReboot.jsx  (Soft reboot instance)
    │   │   │   │   │   │   ├── Start.jsx   (Start instance)
    │   │   │   │   │   │   ├── StepCreate  (Create a instance-step by step creation)
    │   │   │   │   │   │   │   ├── BaseStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── ConfirmStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── NetworkStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── SystemStep
    │   │   │   │   │   │   │   │   └── index.jsx
    │   │   │   │   │   │   │   ├── index.jsx
    │   │   │   │   │   │   │   └── index.less
    │   │   │   │   │   │   ├── Stop.jsx    (Stop instance)
    │   │   │   │   │   │   ├── Suspend.jsx (Suspend instance)
    │   │   │   │   │   │   ├── Unlock.jsx  (Unlock instance)
    │   │   │   │   │   │   ├── Unpause.jsx (Unpause instance)
    │   │   │   │   │   │   ├── Unshelve.jsx    (Unshelve instance)
    │   │   │   │   │   │   ├── index.jsx
    │   │   │   │   │   │   └── index.less
    │   │   │   │   │   ├── components  (Component)
    │   │   │   │   │   │   ├── FlavorSelectTable.jsx
    │   │   │   │   │   │   └── index.less
    │   │   │   │   │   ├── index.jsx
    │   │   │   │   │   └── index.less
    │   │   │   │   ├── Keypair (Key pair)
    │   │   │   │   └── ServerGroup (Instance group)
    │   │   │   └── routes  (Routing configuration under the compute menu)
    │   │   │       └── index.js
    │   │   ├── configuration   (Platform configuration)
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   ├── Metadata    (Metadata definition)
    │   │   │   │   ├── Setting (System configuration)
    │   │   │   │   └── SystemInfo  (System info)
    │   │   │   └── routes  (Routing configuration under the platform configuration menu)
    │   │   │       └── index.js
    │   │   ├── heat    (Resource orchestration)
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   └── Stack   (Stack)
    │   │   │   └── routes  (Routing configuration under the resource arrangement menu)
    │   │   │       └── index.js
    │   │   ├── identity    (Identity management)
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   ├── Domain  (Domain)
    │   │   │   │   ├── Project (Project)
    │   │   │   │   ├── Role    (Role)
    │   │   │   │   ├── User    (User)
    │   │   │   │   └── UserGroup   (User group)
    │   │   │   └── routes  (Routing configuration)
    │   │   │       └── index.js
    │   │   ├── management  (Operation and maintenance management)
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   └── RecycleBin  (Recycle bin)
    │   │   │   └── routes  (Routing configuration)
    │   │   │       └── index.js
    │   │   ├── network (Network)
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   ├── FloatingIp  (Floating ip)
    │   │   │   │   ├── LoadBalancers   (Load balancing)
    │   │   │   │   ├── Network (Network)
    │   │   │   │   ├── QoSPolicy   (Qos policy)
    │   │   │   │   ├── Router  (Routing)
    │   │   │   │   ├── SecurityGroup   (Security group)
    │   │   │   │   ├── Topology    (Network topology)
    │   │   │   │   ├── VPN (VPN)
    │   │   │   │   └── VirtualAdapter  (Virtual Adapter)
    │   │   │   └── routes  (Routing configuration)
    │   │   │       └── index.js
    │   │   ├── storage (Storage)
    │   │   │   ├── App.jsx
    │   │   │   ├── containers
    │   │   │   │   ├── Backup  (Backup)
    │   │   │   │   ├── Snapshot    (Volume snapshot)
    │   │   │   │   ├── Storage (Storage backend)
    │   │   │   │   ├── Volume  (Volume)
    │   │   │   │   └── VolumeType  (Volume type)
    │   │   │   │       ├── QosSpec (QoS)
    │   │   │   │       ├── VolumeType  (Volume type)
    │   │   │   │       └── index.jsx
    │   │   │   └── routes  ()
    │   │   │       └── index.js
    │   │   └── user    (Login page)
    │   │       ├── App.jsx
    │   │       ├── containers
    │   │       │   ├── ChangePassword  (Change password-according to system configuration)
    │   │       │   │   ├── index.jsx
    │   │       │   │   └── index.less
    │   │       │   └── Login   (Login)
    │   │       │       ├── index.jsx
    │   │       │       └── index.less
    │   │       └── routes  (Routing configuration)
    │   │           └── index.js
    │   ├── resources   (Store the public functions and status of each resource used by itself)
    │   ├── stores  (Data processing, divide folders by resource type)
    │   │   ├── base-list.js    (Base class for list data)
    │   │   ├── base.js (Base class for data manipulation)
    │   │   ├── cinder
    │   │   ├── glance
    │   │   ├── heat
    │   │   ├── ironic
    │   │   ├── keystone
    │   │   ├── neutron
    │   │   ├── nova
    │   │   ├── octavia
    │   │   ├── overview-admin.js
    │   │   ├── project.js
    │   │   ├── root.js
    │   │   └── skyline
    │   ├── styles  (Public styles)
    │   │   ├── base.less
    │   │   ├── main.less
    │   │   ├── reset.less
    │   │   └── variables.less
    │   └── utils   (Public functions)
    │       ├── RouterConfig.jsx
    │       ├── constants.js
    │       ├── cookie.js
    │       ├── file.js
    │       ├── file.spec.js
    │       ├── index.js
    │       ├── index.test.js   (Unit testing)
    │       ├── local-storage.js
    │       ├── local-storage.spec.js   (Unit testing)
    │       ├── request.js
    │       ├── table.jsx
    │       ├── time.js
    │       ├── time.spec.js
    │       ├── translate.js
    │       ├── translate.spec.js
    │       ├── validate.js
    │       ├── yaml.js
    │       └── yaml.spec.js
    ├── test
    │   ├── e2e (E2E testing)
    │   └── unit (Unit testing)
    ├── tools
    │   └── git_config
    │       └── commit_message.txt
    └── yarn.lock
