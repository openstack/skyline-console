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

import getTitle from './common';

Cypress.Commands.add('checkDetailName', (name) => {
  cy.get('.ant-descriptions-item-content').contains(name).should('exist');
});

Cypress.Commands.add('goBackToList', (url) => {
  cy.get('.ant-descriptions-header').find('button').eq(0).click().wait(2000);
  if (url) {
    cy.url().should('include', url);
  }
  cy.waitTableLoading();
});

Cypress.Commands.add('clickDetailTab', (label, urlTab, waitTime = 2000) => {
  const realTitle = getTitle(label);
  cy.get('.ant-tabs-tab-btn').contains(realTitle).click().wait(waitTime);
  if (urlTab) {
    cy.url().should('include', urlTab);
  }
  cy.waitTableLoading();
});

Cypress.Commands.add('clickDetailActionInMore', (title, waitTime = 2000) => {
  cy.get('.detail-main')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true });
  const realTitle = getTitle(title);
  cy.get('ul.ant-dropdown-menu-light')
    .contains(realTitle)
    .click({ force: true })
    .wait(waitTime);
});
