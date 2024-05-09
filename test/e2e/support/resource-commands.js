// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import urlMap, {
  instanceListUrl,
  networkListUrl,
  volumeListUrl,
  recycleBinListUrl,
  policyListUrl,
  routerListUrl,
  userListUrl,
  userGroupListUrl,
  securityGroupListUrl,
  fipListUrl,
  imageListUrl,
  projectListUrl,
  settingUrl,
  flavorListUrl,
  firewallListUrl,
} from './constants';

Cypress.Commands.add('createInstance', ({ name, networkName }) => {
  const password = 'passW0rd_1';
  const imageName = Cypress.env('imageName');
  const imageType = Cypress.env('imageType');
  cy.visitPage(instanceListUrl)
    .clickHeaderActionButton(0)
    .wait(8000)
    .formTableSelect('flavor')
    .formRadioChooseByLabel('image', imageType)
    .formTableSelectBySearch('image', imageName)
    .formSelect('systemDisk')
    .clickStepActionNextButton()
    .wait(5000)
    .formTableSelectBySearch('networkSelect', networkName)
    .formTableSelectBySearch('securityGroup', 'default')
    .wait(2000)
    .clickStepActionNextButton()
    .formInput('name', name)
    .formRadioChoose('loginType', 1)
    .formInput('username', 'root')
    .formInput('password', password)
    .formInput('confirmPassword', password)
    .wait(2000)
    .clickStepActionNextButton()
    .wait(2000)
    .clickStepActionNextButton()
    .waitFormLoading()
    .closeNotice()
    .waitTableLoading()
    .tableSearchText(name)
    .waitStatusActiveByRefresh();
});

Cypress.Commands.add('createNetwork', ({ name }) => {
  const cidr = `10.10.${Cypress._.random(50, 100)}.0/24`;
  cy.visitPage(networkListUrl)
    .clickHeaderActionButton(0)
    .wait(2000)
    .formInput('name', name)
    .formSelect('availableZone')
    .formCheckboxClick('create_subnet')
    .formInput('subnet_name', `${name}-sub`)
    .formSelect('ip_version')
    .formInput('cidr', cidr)
    .clickModalActionSubmitButton();
});

Cypress.Commands.add('createNetworkPolicy', ({ name }) => {
  cy.visitPage(policyListUrl)
    .clickHeaderActionButton(0)
    .formInput('name', name)
    .formText('description', name)
    // .formSelect('project_id', 'admin')
    .formSwitch('shared')
    .clickModalActionSubmitButton();
});

Cypress.Commands.add('createRouter', ({ name, network }) => {
  cy.visitPage(routerListUrl)
    .clickHeaderActionButton(0, 5000)
    .formInput('name', name)
    .formCheckboxClick('openExternalNetwork')
    .wait(2000)
    .formTableSelect('externalNetwork')
    .clickModalActionSubmitButton();
  if (network) {
    cy.tableSearchText(name)
      .clickActionInMore('Connect Subnet', 5000)
      .formTableSelectBySearch('network', network)
      .wait(5000)
      .formTableSelect('subnet')
      .clickModalActionSubmitButton();
  }
});

Cypress.Commands.add('deleteRouter', (name, networkName) => {
  cy.visitPage(routerListUrl).tableSearchText(name);
  if (networkName) {
    cy.clickActionInMore('Disconnect Subnet', 5000)
      .formTableSelect('subnet')
      .clickModalActionSubmitButton();
  }
  cy.tableSearchText(name)
    .clickConfirmActionInMore('Close External Gateway')
    .clickConfirmActionInMore('Delete');
});

Cypress.Commands.add('deleteInstance', (name, deleteRecycleBin = true) => {
  cy.visitPage(instanceListUrl)
    .tableSearchText(name)
    .clickConfirmActionInMore('Delete');

  if (deleteRecycleBin) {
    cy.visitPage(recycleBinListUrl)
      .tableSearchText(name, true)
      .selectFirst()
      .clickHeaderConfirmButtonByTitle('Delete');
  }
});

Cypress.Commands.add('forceDeleteInstance', (name) => {
  cy.visitPage(instanceListUrl)
    .tableSearchText(name)
    .clickActionInMore('Delete');
  cy.get('.ant-modal-confirm-content')
    .find('.ant-checkbox-input')
    .click()
    .clickConfirmActionSubmitButton();
});

Cypress.Commands.add('deleteAllAvailableVolume', () => {
  cy.visitPage(volumeListUrl)
    .tableSearchSelect('Status', 'Available')
    .selectAll()
    .clickHeaderConfirmButtonByTitle('Delete');
});

Cypress.Commands.add(
  'createInstanceByResource',
  ({ name, networkName, resource }) => {
    const password = 'passW0rd_1';
    cy.formTableSelect('flavor')
      .formTableSelect(resource)
      .formSelect('systemDisk')
      .clickStepActionNextButton()
      .wait(5000)
      .formTableSelectBySearch('networkSelect', networkName)
      .formTableSelectBySearch('securityGroup', 'default')
      .clickStepActionNextButton()
      .formInput('name', name)
      .formRadioChoose('loginType', 1)
      .formInput('username', 'root')
      .formInput('password', password)
      .formInput('confirmPassword', password)
      .clickStepActionNextButton()
      .wait(2000)
      .clickStepActionNextButton()
      .waitFormLoading()
      .closeNotice()
      .wait(10000);
  }
);

Cypress.Commands.add('createVolume', (name) => {
  cy.visit('/storage/volume/create')
    .wait(10000)
    .formInput('name', name)
    .formInput('size', 1)
    .clickFormActionSubmitButton()
    .waitTableLoading()
    .tableSearchText(name)
    .waitStatusActiveByRefresh();
});

Cypress.Commands.add('createSecurityGroup', ({ name }) => {
  cy.visitPage(securityGroupListUrl)
    .clickHeaderActionButton(0)
    .formInput('name', name)
    .clickModalActionSubmitButton();
});

Cypress.Commands.add('createFip', () => {
  cy.intercept('GET', '/networks').as('networks');
  cy.visitPage(fipListUrl)
    .wait(2000)
    .clickHeaderActionButton(0)
    .wait('@networks')
    .formSelect('floating_network_id')
    .clickModalActionSubmitButton();
});

Cypress.Commands.add('createUserGroup', ({ name }) => {
  cy.visitPage(userGroupListUrl)
    .clickHeaderActionButton(0)
    .formInput('name', name)
    .clickModalActionSubmitButton();
});

Cypress.Commands.add('createUser', ({ name }) => {
  const email = `${name}@example.com`;
  const prefix = '+86';
  const phone = '18500000000';
  const password = 'passW0rd_';
  cy.visitPage(userListUrl)
    .clickHeaderActionButton(0)
    .wait(2000)
    .formInput('name', name)
    .formInput('email', email)
    .formInput('password', password)
    .formInput('confirmPassword', password)
    .formSelect('phone', prefix)
    .formInput('phone', phone, '.ant-input')
    .formInput('real_name', name)
    .clickFormActionSubmitButton()
    .tableSearchText(name)
    .waitStatusGreen(8);
});

Cypress.Commands.add('createProject', ({ name }) => {
  cy.visitPage(projectListUrl)
    .clickHeaderActionButton(0)
    .formInput('name', name)
    .clickModalActionSubmitButton();
});

Cypress.Commands.add('setAllFlavorType', () => {
  const filename = 'flavor-family.json';
  const settingName = 'flavor_families';
  cy.fixture(filename).then((data) => {
    cy.visitPage(settingUrl)
      .tableSimpleSearchText(settingName)
      .clickActionInMore('Edit')
      .formJsonInput('value', data)
      .wait(2000)
      .clickModalActionSubmitButton();
  });
});

Cypress.Commands.add('createIronicFlavor', (name) => {
  cy.setAllFlavorType();
  cy.visitPage(flavorListUrl)
    .clickTab('Bare Metal', 'bare_metal')
    .clickHeaderActionButton(0)
    .formRadioChoose('category', 0)
    .formInput('name', name)
    .clickStepActionNextButton()
    .wait(2000)
    .clickStepActionNextButton();
});

Cypress.Commands.add('createIronicImage', ({ name }) => {
  const filename = 'cirros-0.4.0-x86_64-disk.qcow2';
  cy.visitPage(imageListUrl)
    .clickHeaderActionButton(0)
    .formInput('name', name)
    .formAttachFile('file', filename)
    .formSelect('disk_format', 'QCOW2 - QEMU Emulator')
    .formSelect('os_distro', 'CentOS')
    .formInput('os_version', 'cirros-0.4.0-x86_64')
    .formInput('os_admin_user', 'root')
    .formSelect('usage_type', 'Bare Metal')
    .clickFormActionSubmitButton()
    .wait(2000)
    .tableSearchText(name)
    .waitStatusActiveByRefresh();
});

Cypress.Commands.add('deleteAll', (resourceName, name, tab) => {
  const url = urlMap[resourceName];
  if (!url) {
    return;
  }
  cy.visitPage(url).waitTableLoading();
  if (tab) {
    cy.clickTab(tab).waitTableLoading();
  }
  if (name) {
    cy.tableSearchText(name);
  }
  cy.selectAll();
  if (resourceName === 'fip') {
    cy.clickHeaderConfirmButtonByTitle('Release');
  } else {
    cy.clickHeaderConfirmButtonByTitle('Delete');
  }
});

Cypress.Commands.add(
  'createFirewallRule',
  ({
    name,
    protocol = 'TCP', // TCP UDP ICMP ANY
    ruleAction = 'ALLOW', // ALLOW  DENY  REJECT
    ipVersion = 'IPv4', // IPv4 IPv6
    enabled = true,
  }) => {
    cy.visit(firewallListUrl)
      .wait(5000)
      .clickTab('Firewall Rules')
      .clickHeaderActionButton(0)
      .wait(2000)
      .formInput('name', name)
      .formRadioChooseByLabel('protocol', protocol)
      .formSelect('action', ruleAction)
      .formRadioChooseByLabel('ip_version', ipVersion);
    if (!enabled) cy.formCheckboxClick('options', 0); // Enabled: default is checked
    cy.clickFormActionSubmitButton();
  }
);

Cypress.Commands.add(
  'createFirewallPolicy',
  ({ name, enableShared = false, enableAudited = false }) => {
    cy.visit(firewallListUrl)
      .wait(5000)
      .clickTab('Firewall Policies')
      .clickHeaderActionButton(0)
      .wait(2000)
      .formInput('name', name);
    if (enableShared) cy.formCheckboxClick('options', 0); // Shared
    if (enableAudited) cy.formCheckboxClick('options', 1); // Audited
    cy.clickModalActionSubmitButton();
  }
);
