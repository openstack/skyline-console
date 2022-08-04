English | [简体中文]](../../zh/test/3-4-E2E-resource-operation.md)

In the E2E process, when creating a resource, it is often necessary to create the associated resource first, and after deleting the resource, the related resource also needs to be deleted. Therefore, the operation of the related resource is encapsulated based on the principle of complete creation/deletion.

- `createInstance`
  - Create instance and wait for the instance to become `running`
  - Parameter `name`, the name of the instance
  - Parameter `networkName`, the network name selected when the instance was created
  - Take the floating IP associated instance as an example: `test/e2e/integration/pages/network/floatingip.spec.js`
    - In order to successfully associate with the instance, the router connected to the subnet where the instance's interface is located must have a public network gateway turned on
      1. Create a network `networkName` with subnet
      2. Create a router `routerName` with the public network gateway turned on and connected to the network `networkName` subnet
      3. Create a instance `instanceName` with a interface on the network `networkName`

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `createNetwork`
  - Create a network with a subnet
  - Parameter `name`, the name of the network
  - Parameter `networkName`, the network name selected when the instance was created
  - Take the router connected to the subnet as an example: `test/e2e/integration/pages/network/router.spec.js`
    - Created a network named `networkName` in preparation for connecting to subnets

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
    });
    ```

- `createNetworkPolicy`
  - Create network QoS policy
  - Parameter `name`, the name of the strategy
  - Take virtual adapter modification QoS as an example: `test/e2e/integration/pages/network/port.spec.js`
    - Created a policy named `policyName` in preparation for modifying QoS

    ```javascript
    it('successfully prepare resource by admin', () => {
      cy.loginAdmin().wait(5000).createNetworkPolicy({ name: policyName });
    });
    ```

- `createRouter`
  - Create a router with a public network gateway turned on
  - Parameter `name`, the name of the router
  - Parameter `network`
    - If set, the router will connect to the subnet of the `network` network
  - Take the floating IP associated instance as an example: `test/e2e/integration/pages/network/floatingip.spec.js`
    - In order to successfully associate with the instance, the router connected to the subnet where the instance's interface is located must have a public network gateway turned on
      1. Create a network `networkName` with subnets
      2. Create a router `routerName` with the public network gateway turned on and connected to the network `networkName` subnet
      3. Create a instance `instanceName` with a interface on the network `networkName` 

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `deleteRouter`
  - Deleting the router will disconnect the router's subnet, turn off the router's public network gateway, and finally successfully delete the router
  - Parameter `network`
    - If set, you need to disconnect the router's subnet first
  - Parameter `name`, the name of the router

  - Take the floating IP to delete the associated resource as an example: `test/e2e/integration/pages/network/floatingip.spec.js`
    - In order to successfully associate with the instance, the router connected to the subnet where the instance's interface is located must have a public network gateway turned on

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
  - Force delete instance instead of soft delete
  - Parameter `name`, the name of the instance
  - Take deleting the instance group as an example: `test/e2e/integration/pages/compute/server-group.spec.js`
     1. Delete the instance under the instance group first
     2. Then successfully delete the instance group

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
  - Create volume
  - Parameter `name`, the name of the volume
  - Take volume backup as an example: `test/e2e/integration/pages/storage/backup.spec.js`
    - To create a volume backup, you need to prepare the volume first

    ```javascript
    it('successfully prepare resource', () => {
      cy.createVolume(volumeName);
      cy.createNetwork({ name: networkName });
      cy.createInstance({ name: instanceName, networkName });
    });
    ```

- `createSecurityGroup`
  - Create a security group
  - Parameter `name`, the name of the security group
  - Take the virtual adapter card as an example: `test/e2e/integration/pages/network/port.spec.js`
     -To test management security group, you need to prepare the security group first

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
  - Create floating ip
  - Take instance as an example: `test/e2e/integration/pages/compute/instance.spec.js`
    - Test associate floating IP, you need to prepare reachable floating IP

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createFip();
      cy.createVolume(volumeName);
    });
    ```

- `createUserGroup`
  - Create user group
  - Parameter `name`, the name of user group 
  - Take project as an example: `test/e2e/integration/pages/identity/project.spec.js`
    - To test management user group, you need to prepare the user group

    ```javascript
    it('successfully prepare resource', () => {
      cy.createUser({ name: username });
      cy.createUserGroup({ name: userGroupName });
    });
    ```

- `createUser`
  - Create user
  - Parameter `name`, user name
  - Take project as an example: `test/e2e/integration/pages/identity/project.spec.js`
    - To test management user,  you need to prepare user

    ```javascript
    it('successfully prepare resource', () => {
      cy.createUser({ name: username });
      cy.createUserGroup({ name: userGroupName });
    });
    ```

- `createProject`
  - Create project 
  - Parameter`name`, the name of project
  - Take user as an example: `test/e2e/integration/pages/identity/user.spec.js`
    - To test creater user, need to prepare project
    - To test management project permission， need to prepare project

    ```javascript
    it('successfully prepare resource', () => {
      cy.createProject({ name: projectName });
      cy.createProject({ name: projectName2 });
      cy.createUserGroup({ name: userGroupName });
    });
    ```

- `createIronicImage`
  - Create image for ironic
  - Parameter `name`, the name of the image
  - Take ironic as an example: `test/e2e/integration/pages/compute/ironic.spec.js`
     - Create a ironic, image need to be able to create a ironic

    ```javascript
    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createFip();
      cy.createIronicImage({ name: imageName });
    });
    ```

- `deleteInstance`
  - Delete instance
  - Parameter `name`, name of instance
  - Parameter `deleteRecycleBin`, Default `true`, Indicates that you need to enter the recycle bin to delete again
  - Take delete instance as an example: `test/e2e/integration/pages/compute/instance.spec.js`

    ```javascript
    it('successfully delete', () => {
      cy.deleteInstance(newname);
    });
    ```

- `deleteAllAvailableVolume`
  -Delete all availablevolume
   -Take instance as an example: `test/e2e/integration/pages/compute/instance.spec.js`

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
  - Delete qualified resources
  - Parameter `resourceName`, resource name

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

  - Parameter `name`
    - If set, delete the resource with the specified name
    - If not set, all resources under the resource list will be deleted
   - Parameter `tab`
    - If set, it means that the resource is located under the tab `tab`, you need to switch to the specified tab first
   - Take the volume type as an example: `test/e2e/integration/pages/storage/volume-type.spec.js`
    - Delete the QoS prepared when managing QoS

    ```javascript
    it('successfully delete related resources', () => {
      cy.deleteAll('volumeType', qosName, 'QoS');
    });
    ```