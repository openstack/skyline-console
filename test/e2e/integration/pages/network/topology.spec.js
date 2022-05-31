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

import { topologyUrl } from '../../../support/constants';

describe('The Network Topology Page', () => {
  const uuid = Cypress._.random(0, 1e6);
  const networkName = `e2e-network-for-topo-${uuid}`;
  const instanceName = `e2e-instance-for-topo-${uuid}`;
  const routerName = `e2e-router-for-topo-${uuid}`;

  beforeEach(() => {
    cy.login().wait(2000).visit(topologyUrl).wait(2000);
  });

  it('successfully prepare resource', () => {
    cy.createNetwork({ name: networkName });
    cy.createRouter({ name: routerName, network: networkName });
    cy.createInstance({ name: instanceName, networkName });
  });

  it('successfully page', () => {
    cy.wait(10000);
    cy.get('canvas').should('exist');
  });

  it('successfully delete related resources', () => {
    cy.forceDeleteInstance(instanceName);
    cy.deleteRouter(routerName, networkName);
    cy.deleteAll('network', networkName);
  });
});
