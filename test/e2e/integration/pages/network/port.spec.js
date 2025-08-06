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

import { onlyOn } from '@cypress/skip-test';
import { portListUrl } from '../../../support/constants';

describe('The Port Page', () => {
  const listUrl = portListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-port-${uuid}`;
  const newname = `${name}-1`;
  const securityGroupName = `e2e-sg-for-port-${uuid}`;
  const policyName = `e2e-policy-for-port-${uuid}`;
  const networkName = `e2e-network-for-port-${uuid}`;
  const instanceName = `e2e-instance-for-port-${uuid}`;
  const routerName = `e2e-router-for-port-${uuid}`;
  const qosServiceEnabled = (Cypress.env('extensions') || []).includes(
    'neutron::qos'
  );

  beforeEach(() => {
    cy.login(listUrl);
  });

  onlyOn(qosServiceEnabled, () => {
    it('successfully prepare resource by admin', () => {
      cy.loginAdmin().wait(5000).createNetworkPolicy({ name: policyName });
    });
  });

  it('successfully prepare resource', () => {
    cy.createFip();
    cy.createSecurityGroup({ name: securityGroupName });
    cy.createNetwork({ name: networkName });
    cy.createRouter({ name: routerName, network: networkName });
    cy.createInstance({ name: instanceName, networkName });
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .formText('description', name)
      .formTableSelectBySearch('network_id', networkName, 5000)
      .wait(5000)
      .formButtonClick('fixed_ips')
      .wait(2000)
      .formSelect('fixed_ips')
      .formTableSelectBySearch('security_groups', 'default')
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .checkDetailName(name)
      .clickDetailTab('Fixed IPs', 'ips')
      .clickDetailTab('Security Groups', 'groups')
      .clickDetailTab('Allowed Address Pairs', 'allowed_address_pair')
      .clickDetailTab('Detail', 'detail');
    cy.goBackToList(listUrl);
  });

  it('successfully create and delete allowed address pair', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Allowed Address Pairs')
      .clickHeaderActionButton(0)
      .formSelect('ip_version')
      .formInput('ip_address', '10.10.10.1/24')
      .formSelect('mac_address')
      .clickModalActionSubmitButton()
      .wait(10000);
    cy.clickConfirmActionInFirst();
  });

  it('successfully associate floating IP', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailActionInMore('Associate Floating IP')
      .wait(5000)
      .formTableSelect('fixed_ip')
      .wait(5000)
      .formTableSelect('fip')
      .clickModalActionSubmitButton()
      .wait(10000);
  });

  it('successfully disassociate floating IP', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailActionInMore('Disassociate Floating IP')
      .wait(5000)
      .formTableSelect('floating_ip')
      .clickModalActionSubmitButton();
  });

  it('successfully associate instance', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Attach Instance')
      .wait(5000)
      .formTableSelectBySearch('instance', instanceName)
      .clickModalActionSubmitButton();
  });

  it('successfully detach instance', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Detach');
  });

  onlyOn(qosServiceEnabled, () => {
    it('successfully modify qos', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Modify QoS')
        .wait(5000)
        .formSwitch('enableQosPolicy')
        .formTabClick('qos_policy_id', 1)
        .wait(2000)
        .formTableSelectBySearch('qos_policy_id', policyName)
        .clickModalActionSubmitButton();
    });
  });

  it('successfully manage security group', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage Security Group')
      .wait(5000)
      .formTableSelectBySearch('securityGroup', securityGroupName)
      .clickModalActionSubmitButton();
  });

  it('successfully detach security group', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Security Groups')
      .wait(5000)
      .collapseItemClick(securityGroupName)
      .collapseItemClickButton('Detach')
      .clickConfirmActionSubmitButton();
  });

  it('successfully allocate ip', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Fixed IPs')
      .clickHeaderActionButton(0)
      .formButtonClick('fixed_ips')
      .formSelect('fixed_ips')
      .clickModalActionSubmitButton();
  });

  it('successfully release ip', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Fixed IPs')
      .clickConfirmActionInFirst();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .formText('description', 'description')
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
  });

  it('successfully delete related resources', () => {
    cy.forceDeleteInstance(instanceName);
    cy.deleteRouter(routerName, networkName);
    cy.deleteAll('securityGroup', securityGroupName);
    cy.deleteAll('network', networkName);
    cy.deleteAll('fip');
    cy.loginAdmin().wait(5000);
    onlyOn(qosServiceEnabled, () => {
      cy.deleteAll('networkQosPolicy', policyName);
    });
  });
});
