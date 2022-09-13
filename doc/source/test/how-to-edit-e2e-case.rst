How To Edit E2E Case
~~~~~~~~~~~~~~~~~~~~

For specific introduction and usage of Cypress, please refer to
`Official document <https://docs.cypress.io/guides/overview/why-cypress>`__.

Here we mainly give the E2E use cases corresponding to the resources in the
front-end page of Skyline-console, and use function defined in ``test/e2e/support``

The following is an introduction, taking the instance use case
``test/e2e/integration/pages/compute/instance.spec.js`` as an example

Generally, when testing the corresponding functions of a resource,
follow the following order

1. Prepare relevant variables in text
-------------------------------------

-  Required parameters when creating a resource, such as: name, password

-  Required parameters when editing resources, such as: new name

-  When creating an associated resource, the name of the associated resource,
   such as: network name, router name, volume name

.. code-block:: javascript

   const uuid = Cypress._.random(0, 1e6);
   const name = `e2e-instance-${uuid}`;
   const newname = `${name}-1`;
   const password = 'passW0rd_1';
   const volumeName = `e2e-instance-attach-volume-${uuid}`;
   const networkName = `e2e-network-for-instance-${uuid}`;
   const routerName = `e2e-router-for-instance-${uuid}`;

2. Login before operation
-------------------------

-  If you are operating console resources, please use :guilabel:`cy.login`

-  If you are operating administrator resource, please use :guilabel:`cy.loginAdmin`

-  Generally, the variable :guilabel:`listUrl` is used in the
   :guilabel:`login` and :guilabel:`loginAdmin` functions, that is,
   directly access the page where the resource is located after logging in

.. code-block:: javascript

   beforeEach(() => {
      cy.login(listUrl);
   });

3. Create associated resources
------------------------------

Create associated resources, use the resource creation function provided in
``resource-commands.js``, take the test instance as an example

-  Create a network for testing to create a instance, attach interface

.. code-block:: javascript

 cy.createNetwork({ name: networkName });

-  Create router :guilabel:`cy.createRouter` to ensure that the
   floating IP is reachable when testing the associated floating IP

   -  The router created in the following way will open the external network
      gateway and bind the subnet of the :guilabel:`networkName` network

.. code-block:: javascript

 cy.createRouter({ name: routerName, network: networkName });

-  Create floating ip :guilabel:`cy.createFip`,
   Used to test associate floating ip

.. code-block:: javascript

 cy.createFip();

-  Create volume :guilabel:`cy.createVolume` (Used to test attach volume)

.. code-block:: javascript

 cy.createVolume(volumeName);

4. Write cases
--------------

-  Write cases for creating resources
-  Write use cases for accessing resource details
-  Write use cases corresponding to all operations of resources separately

   Generally, the use case of the :guilabel:`edit` operation is written later,
   and then the use case of the :guilabel:`delete` operation is written,
   so that you can test whether the editing is effective

5. delete associated resources
-------------------------------

To delete associated resources, use the resource-deleting function provided
in ``resource-commands.js``, this is to make the resources in the test
account as clean as possible after the test case is executed

-  Delete Floating IP

.. code-block:: javascript

 cy.deleteAll('fip');

-  Delete Router :guilabel:`routerName`

.. code-block:: javascript

 cy.deleteRouter(routerName, networkName);

-  Delete Network :guilabel:`networkName`

.. code-block:: javascript

 cy.deleteAll('network', networkName);

-  Delete Volume :guilabel:`volumeName`

.. code-block:: javascript

 cy.deleteAll('volume', volumeName);

-  Delete all available volume

.. code-block:: javascript

 cy.deleteAllAvailableVolume();
