English | [简体中文](../../zh/test/2-catalog-introduction.md)

```
test
├── e2e （E2E code storage location）
│   ├── config
│   │   ├── config.yaml (Part of the configuration when E2E running, mainly configures the test case file list, login account and other information)
│   │   └── local_config.yaml   (Part of the configuration when E2E running, mainly configures the test case file list, login account and other information, which is gitignore and has a higher priority than config.yaml)
│   ├── fixtures    (Store upload files, read files, etc. required during operation)
│   │   ├── keypair (Test file read by key)
│   │   ├── metadata.json   (Test metadata read file)
│   │   ├── stack-content.yaml  (Files read by the test stack)
│   │   └── stack-params.yaml   (Files read by the test stack)
│   ├── integration (Store unit test)
│   │   └── pages   (Adjust the directory according to the webpage menu structure)
│   │       ├── compute (compute)
│   │       │   ├── aggregate.spec.js   (aggregate)
│   │       │   ├── baremetal.spec.js   (baremetal)
│   │       │   ├── flavor.spec.js  (instance flavor)
│   │       │   ├── hypervisor.spec.js  (hypervisor)
│   │       │   ├── image.spec.js   (image)
│   │       │   ├── instance.spec.js    (instance)
│   │       │   ├── ironic.spec.js  (ironic)
│   │       │   ├── keypair.spec.js (keypair)
│   │       │   └── server-group.spec.js    (server group)
│   │       ├── configuration   (Platform configuration)
│   │       │   ├── metadata.spec.js   (metadata)
│   │       │   └── system.spec.js  (system info)
│   │       ├── error.spec.js   (error page)
│   │       ├── heat    (heat)
│   │       │   └── stack.spec.js   (stack)
│   │       ├── identity    (identity)
│   │       │   ├── domain.spec.js  (Domain)
│   │       │   ├── project.spec.js (Project)
│   │       │   ├── role.spec.js    (Role)
│   │       │   ├── user-group.spec.js  (User group)
│   │       │   └── user.spec.js    (User)
│   │       ├── login.spec.js   (Login)
│   │       ├── management  (Operation management)
│   │       │   └── recycle-bin.spec.js (Recycle)
│   │       ├── network (Network)
│   │       │   ├── floatingip.spec.js  (Floating ip)
│   │       │   ├── lb.spec.js  (Loadbalance)
│   │       │   ├── network.spec.js (Network)
│   │       │   ├── qos-policy.spec.js  (Qos policy)
│   │       │   ├── router.spec.js  (Router)
│   │       │   ├── security-group.spec.js  (Security group)
│   │       │   ├── topology.spec.js    (Network topology)
│   │       │   ├── port.spec.js (Virtual Adapter)
│   │       │   └── vpn.spec.js (VPN)
│   │       └── storage (Storage)
│   │           ├── backup.spec.js  (Backup)
│   │           ├── qos.spec.js (QoS)
│   │           ├── snapshot.spec.js    (Volume snapshot)
│   │           ├── storage.spec.js (Storage)
│   │           ├── volume-type.spec.js (Volume type)
│   │           └── volume.spec.js  (Volume)
│   ├── plugins (Cypress plugins)
│   │   └── index.js    (Configured to read the configuration file, configured to use the code coverage function)
│   ├── report  (Store E2E test report)
│   │   ├── merge-report.html   (The final test report that records the execution of each use case)
│   │   └── merge-report.json   (Summary of test results in the results directory)
│   ├── results (Store test result files)
│   ├── screenshots (Store a snapshot of the test error)
│   ├── support (When writing a test case, double-wrapped function)
│   │   ├── commands.js (Store login, logout and other operation functions)
│   │   ├── common.js   (Store base functions)
│   │   ├── constants.js    (Store the route of each resource)
│   │   ├── detail-commands.js  (Store the functions related to the resource detail page, based on the framework, the operation of the detail page is consistent)
│   │   ├── form-commands.js  (Stores form-related functions, based on the framework, consistent with the operation of form items)
│   │   ├── index.js
│   │   ├── resource-commands.js    (Store functions related to resource operations, such as creating instance, creating router, deleting resources, etc.)
│   │   └── table-commands.js   (Store the functions related to the resource list based on the framework, and it has consistency in the operation of the lis)
│   └── utils   (Store the read function for the configuration file)
│       └── index.js
└── unit    (Unit test)
    ├── local-storage-mock.js   ( Storage mock function in local)
    ├── locales (Translation files used when testing internationalization)
    │   ├── en-US.js
    │   └── zh-hans.js
    ├── setup-tests.js  (setup uni test)
    └── svg-mock.js (Mock of image loading)
```

- E2E test code, stored in the `test/e2e` directory
  - Other global configurations of E2E are stored in `cypress.json`
- The basic code of the unit test is stored in the `test/unit` directory
  - Other global configuration of unit test, stored in `jest.config.js`
  - The test code of the unit test is usually placed in the same directory as the file to be tested, and has a suffix of `test.js` or `spec.js`
    - case：`src/utils/index.js` and `src/utils/index.test.js`
    - case：`src/utils/local-storage.js` and `src/utils/local-storage.spec.js`
