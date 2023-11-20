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

Cypress.Commands.add('waitTableLoading', () => {
  cy.get('.ant-spin-dot-spin', { timeout: 120000 }).should('not.exist');
});

Cypress.Commands.add(
  'clickHeaderTableButton',
  (buttonIndex, waitTime = 2000) => {
    cy.get('.table-header-btns')
      .find('button')
      .eq(buttonIndex)
      .click({ force: true });
    cy.wait(waitTime);
  }
);

Cypress.Commands.add(
  'clickHeaderActionButton',
  (buttonIndex, waitTime = 2000) => {
    cy.get('.table-header-action-btns')
      .find('button')
      .eq(buttonIndex)
      .click({ force: true });
    cy.wait(waitTime);
  }
);

Cypress.Commands.add(
  'clickHeaderActionButtonByTitle',
  (title, waitTime = 2000) => {
    const realTitle = getTitle(title);
    cy.get('.table-header-action-btns')
      .find('button')
      .contains(realTitle)
      .click({ force: true });
    cy.wait(waitTime);
  }
);

Cypress.Commands.add(
  'clickHeaderConfirmButtonByTitle',
  (title, waitTime = 2000) => {
    const realTitle = getTitle(title);
    cy.get('.table-header-action-btns')
      .find('button')
      .contains(realTitle)
      .click({ force: true });
    cy.wait(waitTime);
    cy.clickConfirmActionSubmitButton(waitTime);
  }
);

Cypress.Commands.add(
  'clickHeaderActionButtonInMoreByTitle',
  (title, waitTime = 2000) => {
    const realTitle = getTitle(title);
    const moreTitle = getTitle('More Actions');
    cy.get('.table-header-action-btns')
      .find('.ant-dropdown-trigger')
      .contains(moreTitle)
      .trigger('mouseover', { force: true });
    cy.get('ul.ant-dropdown-menu-light')
      .last()
      .find('button')
      .contains(realTitle)
      .click({ force: true });
    cy.wait(waitTime);
  }
);

Cypress.Commands.add('checkTableFirstRow', (name) => {
  cy.get('.sl-table')
    .find('.ant-table-row')
    .first()
    .contains(name)
    .should('exist');
});

Cypress.Commands.add('clickFirstActionButton', () => {
  cy.get('.ant-table-row')
    .first()
    .find('button')
    .first()
    .click({ force: true });
});

Cypress.Commands.add('clickActionButtonByTitle', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row')
    .first()
    .find('.ant-btn')
    .contains(realTitle)
    .click({ force: true });
});

Cypress.Commands.add('clickMoreActionButton', (buttonIndex) => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true });
  cy.get('ul.ant-dropdown-menu-light')
    .find('li')
    .eq(buttonIndex)
    .click({ force: true });
});

Cypress.Commands.add('clickActionInMore', (title, waitTime = 2000) => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true });
  const realTitle = getTitle(title);
  cy.get('ul.ant-dropdown-menu-light')
    .contains(realTitle)
    .click({ force: true })
    .wait(waitTime);
});

Cypress.Commands.add('clickActionInMoreSub', (title, subMenu) => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true });
  const realTitle = getTitle(title);
  const realMenu = getTitle(subMenu);
  cy.get('.ant-dropdown-menu-submenu-title')
    .contains(realMenu)
    .trigger('mouseover', { force: true });
  cy.get('.ant-dropdown-menu-submenu-popup')
    .last()
    .find('button')
    .contains(realTitle)
    .click({ force: true });
});

Cypress.Commands.add('tableSearchText', (str) => {
  cy.get('.magic-input-wrapper')
    .find('input')
    .type(`${str}{enter}`, { force: true });
  cy.waitTableLoading();
});

Cypress.Commands.add('tableSimpleSearchText', (str) => {
  cy.get('input').first().type(`${str}{enter}`, { force: true });
  cy.waitTableLoading();
});

Cypress.Commands.add('tableSearchSelect', (name, value) => {
  cy.get('.magic-input-wrapper').find('input').click({ force: true });
  const realName = getTitle(name);
  const realValue = getTitle(value);
  cy.get('.magic-input-wrapper')
    .find('.ant-menu-item')
    .contains(realName)
    .click({ force: true });
  cy.get('.magic-input-wrapper')
    .find('.ant-menu-item')
    .contains(realValue)
    .click({ force: true });
  // if (!onlyOneFilter) {
  //   cy.get('.magic-input-wrapper').find('ul > button').click({ force: true });
  // }
  cy.waitTableLoading();
});

Cypress.Commands.add('tableSearchSelectText', (name, str) => {
  cy.get('.magic-input-wrapper').find('input').click({ force: true });
  const realName = getTitle(name);
  cy.get('.magic-input-wrapper')
    .find('.ant-menu-item')
    .contains(realName)
    .click({ force: true });
  cy.get('.magic-input-wrapper')
    .find('input')
    .type(`${str}{enter}`, { force: true });
  cy.waitTableLoading();
});

Cypress.Commands.add('clearTableSearch', () => {
  cy.get('.magic-input-wrapper').find('button').last().click({ force: true });
  cy.wait(2000);
});

Cypress.Commands.add('checkEmptyTable', () => {
  cy.get('.ant-empty-normal').should('have.length', 1);
  cy.wait(2000);
});

Cypress.Commands.add('checkActionDisabled', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row').first().contains(realTitle).should('not.exist');
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true });
  cy.get('ul.ant-dropdown-menu-light').contains(realTitle).should('not.exist');
});

Cypress.Commands.add('checkActionDisabledInFirstRow', (title, name) => {
  const realTitle = getTitle(title);
  cy.tableSearchText(name)
    .get('.ant-table-row')
    .first()
    .contains(realTitle)
    .should('not.exist')
    .get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true })
    .get('ul.ant-dropdown-menu-light')
    .contains(realTitle)
    .should('not.exist');
});

Cypress.Commands.add('clickFirstActionDisabled', () => {
  cy.get('.ant-table-row').first().find('button').first().should('be.disabled');
});

Cypress.Commands.add('clickConfirmActionInFirst', (waitTime) => {
  cy.get('.ant-table-row')
    .first()
    .find('button')
    .first()
    .click({ force: true })
    .wait(2000)
    .clickConfirmActionSubmitButton(waitTime);
});

Cypress.Commands.add('clickConfirmActionInMore', (title, waitTime) => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover', { force: true });
  const realTitle = getTitle(title);
  cy.get('ul.ant-dropdown-menu-light')
    .contains(realTitle)
    .click({ force: true })
    .wait(1000)
    .clickConfirmActionSubmitButton(waitTime);
});

Cypress.Commands.add('clickConfirmActionButton', (title, waitTime) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row')
    .first()
    .find('.ant-btn')
    .contains(realTitle)
    .click({ force: true })
    .wait(1000)
    .clickConfirmActionSubmitButton(waitTime);
});

Cypress.Commands.add(
  'clickConfirmActionInMoreSub',
  (title, subMenu, waitTime) => {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-dropdown-trigger')
      .trigger('mouseover', { force: true });
    const realTitle = getTitle(title);
    const realMenu = getTitle(subMenu);
    cy.get('.ant-dropdown-menu-submenu-title')
      .contains(realMenu)
      .trigger('mouseover', { force: true });
    cy.get('.ant-dropdown-menu-submenu-popup')
      .last()
      .find('button')
      .contains(realTitle)
      .click()
      .wait(1000)
      .clickConfirmActionSubmitButton(waitTime);
  }
);

Cypress.Commands.add('clickLinkInColumn', (columnIndex, waitTime = 5000) => {
  cy.get('.ant-table-row')
    .first()
    .find('td')
    .eq(columnIndex)
    .find('a')
    .click('left', waitTime);
});

Cypress.Commands.add('goToDetail', (index = 1, waitTime) => {
  cy.clickLinkInColumn(index, 2000);
  cy.get('.ant-skeleton-content', { timeout: 120000 }).should('not.exist');
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add('checkColumnValue', (columnIndex, value) => {
  cy.get('.ant-table-row')
    .first()
    .find('td')
    .eq(columnIndex)
    .contains(value)
    .should('exist');
});

Cypress.Commands.add(
  'getStatusValueLength',
  (value, hasLengthCallback, noLengthCallback) => {
    const eles = Cypress.$('.ant-badge-status-text').filter(
      `:contains(${value})`
    );
    if (eles.length > 0) {
      hasLengthCallback();
    } else {
      noLengthCallback();
      cy.getStatusValueLength(value, hasLengthCallback, noLengthCallback);
    }
  }
);

Cypress.Commands.add('waitStatusTextByFresh', (text) => {
  let index = 0;
  const hasLengthCallback = () => {
    // eslint-disable-next-line no-console
    console.log('contain', index);
  };
  const noLengthCallback = () => {
    // eslint-disable-next-line no-console
    console.log('not contain', index);
    cy.refreshTable();
    index += 1;
    cy.wait(5000);
  };
  cy.getStatusValueLength(text, hasLengthCallback, noLengthCallback);
});

Cypress.Commands.add('selectFirst', () => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-checkbox-input')
    .click({ force: true })
    .wait(2000);
});

Cypress.Commands.add('selectAll', () => {
  cy.get('.ant-table-thead')
    .find('.ant-checkbox-input')
    .click({ force: true })
    .wait(2000);
});

Cypress.Commands.add(
  'getStatusLength',
  (hasLengthCallback, noLengthCallback, timeoutCallback, index) => {
    cy.log(`Current index is: ${index}`);
    if (
      Cypress.$('.ant-badge-status-success').length > 0 ||
      Cypress.$('.ant-badge-status-error').length > 0
    ) {
      hasLengthCallback();
    } else if (index >= 100) {
      timeoutCallback();
    } else {
      noLengthCallback();
    }
  }
);

Cypress.Commands.add('waitStatusActiveByRefresh', () => {
  let index = 0;
  const hasLengthCallback = () => {
    // eslint-disable-next-line no-console
    console.log('active', index);
  };
  const noLengthCallback = () => {
    // eslint-disable-next-line no-console
    console.log('not active', index);
    cy.refreshTable();
    index += 1;
    cy.wait(5000);
    cy.getStatusLength(
      hasLengthCallback,
      noLengthCallback,
      timeoutCallback,
      index
    );
  };
  const timeoutCallback = () => {
    // eslint-disable-next-line no-console
    console.log('not active and timeout', index);
  };
  cy.getStatusLength(
    hasLengthCallback,
    noLengthCallback,
    timeoutCallback,
    index
  );
});

Cypress.Commands.add('waitStatusActive', (index) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-success', { timeout: 100000000 })
      .should('exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-success', { timeout: 100000000 })
      .should('exist');
  }
});

Cypress.Commands.add('waitStatusGreen', (index) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-green', { timeout: 100000000 })
      .should('exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-green', { timeout: 100000000 })
      .should('exist');
  }
});

Cypress.Commands.add('refreshTable', () => {
  // eslint-disable-next-line no-console
  console.log('fresh table');
  cy.clickHeaderTableButton(0).waitTableLoading();
});

Cypress.Commands.add('collapseItemClick', (name) => {
  // eslint-disable-next-line no-console
  if (name) {
    cy.get('.ant-collapse-item').contains(name).first().click({ force: true });
  } else {
    cy.get('.ant-collapse-item').first().click({ force: true });
  }
});

Cypress.Commands.add('collapseItemClickButton', (actionTitle) => {
  // eslint-disable-next-line no-console
  const realTitle = getTitle(actionTitle);
  cy.get('.ant-collapse-item')
    .first()
    .find('.ant-btn')
    .contains(realTitle)
    .click({ force: true });
});

Cypress.Commands.add('clickTimeFilter', (index) => {
  cy.get('.ant-radio-group')
    .find('.ant-radio-button-wrapper')
    .eq(index)
    .click({ force: true })
    .waitTableLoading();
});

Cypress.Commands.add('tableSearchQuick', () => {
  cy.get('.magic-input-checks')
    .find('.ant-checkbox-input')
    .first()
    .click({ force: true })
    .waitTableLoading();
});

Cypress.Commands.add('clickButtonInColumn', (index) => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-table-cell')
    .eq(index)
    .find('button')
    .click({ force: true });
});

Cypress.Commands.add('goToContainerDetail', () => {
  cy.clickLinkInColumn(1, 2000);
  cy.waitTableLoading();
});
