English | [简体中文](../../zh/test/3-0-how-to-edit-e2e-case.md)

For specific introduction and usage of Cypress, please refer to[Official document](https://docs.cypress.io/guides/overview/why-cypress)

Here we mainly give the E2E use cases corresponding to the resources in the front-end page of Skyline-console, and use function defined in `test/e2e/support`

The following is an introduction, taking the instance use case `test/e2e/integration/pages/compute/instance.spec.js` as an example

Generally, when testing the corresponding functions of a resource, follow the following order

1. Prepare relevant variables in text
   - Required parameters when creating a resource, such as: name, password
   - Required parameters when editing resources, such as: new name
   - When creating an associated resource, the name of the associated resource, such as: network name, router name, volume name

   ```javascript
   const uuid = Cypress._.random(0, 1e6);
   const name = `e2e-instance-${uuid}`;
   const newname = `${name}-1`;
   const password = 'passW0rd_1';
   const volumeName = `e2e-instance-attach-volume-${uuid}`;
   const networkName = `e2e-network-for-instance-${uuid}`;
   const routerName = `e2e-router-for-instance-${uuid}`;
   ```

2. Login before operation
   - If you are operating console resources, please use `cy.login`
   - If you are operating administrator resource, please use`cy.loginAdmin`
   - Generally, the variable `listUrl` is used in the `login` and `loginAdmin` functions, that is, directly access the page where the resource is located after logging in

   ```javascript
   beforeEach(() => {
     cy.login(listUrl);
   });
   ```

3. Create associated resources, use the resource creation function provided in `resource-commands.js`, take the test instance as an example
   - Create a network for testing to create a instance, attach interface

     ```javascript
     cy.createNetwork({ name: networkName });
     ```

   - Create router`cy.createRouter`to ensure that the floating IP is reachable when testing the associated floating IP
     - The router created in the following way will open the external network gateway and bind the subnet of the `networkName` network

     ```javascript
     cy.createRouter({ name: routerName, network: networkName });
     ```

   - Create floating ip`cy.createFip`，Used to test associate floating ip

     ```javascript
     cy.createFip();
     ```

   - Create volume `cy.createVolume`(Used to test attach volume)

     ```javascript
     cy.createVolume(volumeName);
     ```

4. Write cases for creating resources
5. Write use cases for accessing resource details
6. Write use cases corresponding to all operations of resources separately
    - Generally, the use case of the `edit` operation is written later, and then the use case of the `delete` operation is written, so that you can test whether the editing is effective
7. To delete associated resources, use the resource-deleting function provided in `resource-commands.js`, this is to make the resources in the test account as clean as possible after the test case is executed
   - Delete Floating IP

     ```javascript
     cy.deleteAll('fip');
     ```

   - Delete Router`routerName`

     ```javascript
     cy.deleteRouter(routerName, networkName);
     ```

   - Delete Network`networkName`

     ```javascript
     cy.deleteAll('network', networkName);
     ```

   - Delete Volume`volumeName`

     ```javascript
     cy.deleteAll('volume', volumeName);
     ```

   - Delete all available volume

     ```javascript
     cy.deleteAllAvailableVolume();
     ```

The `4`, `5`, and `6` in the above steps are mainly used

- The function operation form in `test/e2e/support/form-commands.js`, please refer to the detailed introduction[3-1-E2E-form-operation](3-1-E2E-form-operation.md)
- The functions in `test/e2e/support/table-commands.js`, click on the buttons in the operation table, search, and enter for details. please refer to the detailed introduction[3-2-E2E-table-operation](3-2-E2E-table-operation.md)
- The functions in `test/e2e/support/detail-commands.js`, the operation returns the list page, the detection details, and the switching details Tab. please refer to the detailed introduction[3-3-E2E-detail-operation](3-3-E2E-detail-operation.md)

Create and delete associated resources mainly use the functions in `test/e2e/support/resource-commands.js`,. please refer to the detailed introduction[33-4-E2E-resource-operation](3-4-E2E-resource-operation.md)