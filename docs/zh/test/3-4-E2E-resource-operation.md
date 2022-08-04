简体中文 | [English](../../en/test/3-4-E2E-resource-operation.md)

在E2E的过程中，创建资源的时候，往往需要先创建关联资源，而删除资源后，也需要删除掉相关资源，所以以完整创建/删除为原则，封装了对相关资源的操作。

- `createInstance`
  - 创建云主机，并等待云主机变为`运行中`状态
  - 参数`name`，云主机的名称
  - 参数`networkName`，云主机创建时选择的网络名称
  - 以浮动IP关联云主机`test/e2e/integration/pages/network/floatingip.spec.js`为例
    - 为了能成功关联云主机，需要满足云主机网卡所在的子网所连接的路由器开启了公网网关
      1. 创建带有子网的网络`networkName`
      2. 创建开启了公网网关并连接网络`networkName`子网的路由器`routerName`
      3. 创建挂载了网络`networkName`上的网卡的云主机`instanceName`

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `createNetwork`
  - 创建网络，该网络带有一个子网
  - 参数`name`，网络的名称
  - 参数`networkName`，云主机创建时选择的网络名称
  - 以路由器连接子网为例`test/e2e/integration/pages/network/router.spec.js`为例
    - 创建了名称为`networkName`的网络，为连接子网做准备

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
    });
    ```

- `createNetworkPolicy`
  - 创建网络QoS策略
  - 参数`name`，策略的名称
  - 以端口修改QoS为例`test/e2e/integration/pages/network/port.spec.js`为例
    - 创建了名称为`policyName`的策略，为修改QoS做准备

    ```javascript
    it('successfully prepare resource by admin', () => {
      cy.loginAdmin().wait(5000).createNetworkPolicy({ name: policyName });
    });
    ```

- `createRouter`
  - 创建开启了公网网关的路由器
  - 参数`name`，路由器的名称
  - 参数`network`
    - 若设置，则路由器会连接`network`网络的子网
  - 以浮动IP关联云主机`test/e2e/integration/pages/network/floatingip.spec.js`为例
    - 为了能成功关联云主机，需要满足云主机网卡所在的子网所连接的路由器开启了公网网关
      1. 创建带有子网的网络`networkName`
      2. 创建开启了公网网关并连接网络`networkName`子网的路由器`routerName`
      3. 创建挂载了网络`networkName`上的网卡的云主机`instanceName`

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `deleteRouter`
  - 删除路由器，会断开路由器的子网，关闭路由器的公网网关，最终成功删除路由器
  - 参数`network`
    - 若设置，则需要先断开路由器的子网
  - 参数`name`，路由器的名称

  - 以浮动IP删除关联资源`test/e2e/integration/pages/network/floatingip.spec.js`为例
    - 为了能成功关联云主机，需要满足云主机网卡所在的子网所连接的路由器开启了公网网关

    ```javascript
    it('successfully delete related resources', () => {
      cy.forceDeleteInstance(instanceName);
      cy.deleteRouter(routerName, networkName);
      cy.deleteAll('network', networkName);
      cy.loginAdmin().wait(5000);
      cy.deleteAll('networkQosPolicy', policyName);
    });
    ```

- `forceDeleteInstance`
  - 强制删除云主机，而不是使用软删除
  - 参数`name`，云主机的名称
  - 以删除云主机组`test/e2e/integration/pages/compute/server-group.spec.js`为例
    1. 先删除云主机组下的云主机
    2. 再成功删除云主机组

    ```javascript
    it('successfully delete', () => {
      cy.clickFirstActionDisabled();
      cy.forceDeleteInstance(instanceName);
      cy.wait(5000);
      cy.visitPage(listUrl)
        .tableSearchText(name)
        .clickConfirmActionInFirst()
        .checkEmptyTable();
    });
    ```

- `createVolume`
  - 创建云硬盘
  - 参数`name`，云硬盘的名称
  - 以云硬盘备份`test/e2e/integration/pages/storage/backup.spec.js`为例
    - 创建云硬盘的备份，需要先准备好云硬盘

    ```javascript
    it('successfully prepare resource', () => {
      cy.createVolume(volumeName);
      cy.createNetwork({ name: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `createSecurityGroup`
  - 创建安全组
  - 参数`name`，安全组的名称
  - 以虚拟网卡`test/e2e/integration/pages/network/port.spec.js`为例
    - 测试管理安全组，需要先准备好安全组

    ```javascript
    it('successfully prepare resource', () => {
      cy.createFip();
      cy.createSecurityGroup({ name: securityGroupName });
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `createFip`
  - 创建浮动IP
  - 以云主机`test/e2e/integration/pages/compute/instance.spec.js`为例
    - 测试绑定浮动IP，需要准备好可达的浮动IP

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createFip();
      cy.createVolume(volumeName);
    });
    ```

- `createUserGroup`
  - 创建用户组
  - 参数`name`，用户组的名称
  - 以项目`test/e2e/integration/pages/identity/project.spec.js`为例
    - 测试管理用户组操作，需要准备好用户组

    ```javascript
    it('successfully prepare resource', () => {
      cy.createUser({ name: username });
      cy.createUserGroup({ name: userGroupName });
    });
    ```

- `createUser`
  - 创建用户
  - 参数`name`，用户的名称
  - 以项目`test/e2e/integration/pages/identity/project.spec.js`为例
    - 测试管理用户操作，需要准备好用户

    ```javascript
    it('successfully prepare resource', () => {
      cy.createUser({ name: username });
      cy.createUserGroup({ name: userGroupName });
    });
    ```

- `createProject`
  - 创建项目
  - 参数`name`，项目的名称
  - 以用户`test/e2e/integration/pages/identity/user.spec.js`为例
    - 测试创建用户，需要准备项目
    - 测试管理项目权限，需要准备项目

    ```javascript
    it('successfully prepare resource', () => {
      cy.createProject({ name: projectName });
      cy.createProject({ name: projectName2 });
      cy.createUserGroup({ name: userGroupName });
    });
    ```

- `createIronicImage`
  - 创建裸机使用的镜像
  - 参数`name`，镜像的名称
  - 以裸机`test/e2e/integration/pages/compute/ironic.spec.js`为例
    - 创建裸机，需要能创建裸机的镜像

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createFip();
      cy.createIronicImage({ name: imageName });
    });
    ```

- `deleteInstance`
  - 删除云主机
  - 参数`name`，云主机的名称
  - 参数`deleteRecycleBin`，默认为`true`，表示需要进入回收站二次删除
  - 以云主机删除`test/e2e/integration/pages/compute/instance.spec.js`为例

    ```javascript
    it('successfully delete', () => {
      cy.deleteInstance(newname);
    });
    ```

- `deleteAllAvailableVolume`
  - 删除所有可用的云硬盘
  - 以云主机`test/e2e/integration/pages/compute/instance.spec.js`为例

    ```javascript
    it('successfully delete related resources', () => {
      cy.deleteAll('fip');
      cy.deleteRouter(routerName, networkName);
      cy.deleteAll('network', networkName);
      cy.deleteAll('volume', volumeName);
      cy.deleteAllAvailableVolume();
    });
    ```

- `deleteAll`
  - 删除符合条件的资源
  - 参数`resourceName`，资源名称，支持

    ```javascript
    export default {
      // compute
      instance: instanceListUrl,
      image: imageListUrl,

      // storage
      volume: volumeListUrl,
      volumeSnapshot: volumeSnapshotListUrl,
      backup: backupListUrl,
      volumeType: volumeTypeListUrl,

      // network
      network: networkListUrl,
      router: routerListUrl,
      networkQosPolicy: policyListUrl,
      fip: fipListUrl,
      port: portListUrl,

      // security
      securityGroup: securityGroupListUrl,

      // identity
      project: projectListUrl,
      user: userListUrl,
      userGroup: userGroupListUrl,
    };
    ```

  - 参数`name`
    - 如设置，则删除指定名称的资源
    - 如不设置，则删除资源列表下的所有资源
  - 参数`tab`
    - 如设置，表示资源位于`tab`标签下，需要先切换到指定标签下
  - 以云硬盘类型`test/e2e/integration/pages/storage/volume-type.spec.js`为例
    - 删除管理QoS时准备的QoS

    ```javascript
    it('successfully delete related resources', () => {
      cy.deleteAll('volumeType', qosName, 'QoS');
    });
    ```