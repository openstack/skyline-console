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

import 'cypress-file-upload';
import getTitle from './common';

function uuid() {
  return Cypress._.random(0, 1e6);
}

function getId(formItemName) {
  return `#form-item-col-${formItemName}`;
}

function getIdLogin(formItemName) {
  return `#normal_login_${formItemName}`;
}

function getIdReset(formItemName) {
  return `#reset_password_${formItemName}`;
}

Cypress.Commands.add('closeNotice', () => {
  cy.get('.ant-notification-topRight', { timeout: 30000 })
    .first()
    .find('.anticon-check-circle')
    .should('exist');
  cy.get('.ant-notification-topRight')
    .first()
    .find('.ant-notification-close-x')
    .first()
    .click();
});

Cypress.Commands.add('waitFormLoading', () => {
  cy.get('.ant-btn-loading', { timeout: 120000 }).should('not.exist');
});

Cypress.Commands.add('clickFormActionSubmitButton', (waitTime) => {
  cy.get('.footer-btns')
    .find('button')
    .eq(1)
    .click()
    .waitFormLoading()
    .closeNotice();
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add(
  'clickModalActionSubmitButton',
  (inTable = true, waitTime) => {
    cy.get('.ant-modal-footer')
      .find('button')
      .eq(1)
      .click()
      .waitFormLoading()
      .closeNotice();
    if (inTable) {
      cy.wait(2000).waitTableLoading();
    }
    if (waitTime) {
      cy.wait(waitTime);
    }
  }
);

Cypress.Commands.add('clickModalActionSubmitButtonFailed', () => {
  cy.get('.ant-modal-footer').find('button').eq(1).click();
  cy.get('.ant-btn-loading').should('not.exist');
});

Cypress.Commands.add('clickModalActionCancelButton', () => {
  cy.get('.ant-modal-footer').find('button').eq(0).click();
});

Cypress.Commands.add('clickConfirmActionSubmitButton', (waitTime) => {
  cy.get('.ant-modal-confirm-btns')
    .find('button')
    .eq(1)
    .click()
    .waitFormLoading()
    .closeNotice();
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add('checkDisableAction', (waitTime) => {
  cy.get('.ant-modal-confirm-confirm')
    .first()
    .find('.anticon-close-circle')
    .should('exist');
  cy.get('.ant-modal-confirm-btns').find('button').last().click();
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add('clickStepActionNextButton', (waitTime = 2000) => {
  cy.get('.step-form-footer-btns')
    .find('button')
    .last()
    .click({ force: true })
    .wait(waitTime);
});

Cypress.Commands.add('clickStepActionCancelButton', (waitTime = 2000) => {
  cy.get('.step-form-footer-btns')
    .find('button')
    .first()
    .click()
    .wait(waitTime);
});

Cypress.Commands.add('formInput', (formItemName, value, selector = 'input') => {
  cy.get(getId(formItemName)).find(selector).clear().type(value);
});

Cypress.Commands.add('formText', (formItemName, value) => {
  cy.get(getId(formItemName))
    .find('textarea')
    .clear({ force: true })
    .type(value, { force: true });
});

Cypress.Commands.add('formJsonInput', (formItemName, content) => {
  const value = JSON.stringify(content);
  cy.get(getId(formItemName))
    .find('textarea')
    .clear({ force: true })
    .wait(2000)
    .type(value, { force: true, parseSpecialCharSequences: false });
});

Cypress.Commands.add('formInputName', (formItemName, typeName) => {
  const name = `test-${typeName}-${uuid()}`;
  cy.get(getId(formItemName)).find('input').clear().type(name);
});

Cypress.Commands.add('formCheckboxClick', (formItemName, index = 0) => {
  cy.get(getId(formItemName)).find('input').eq(index).click();
});

Cypress.Commands.add('formTableSelectAll', (formItemName) => {
  cy.get(getId(formItemName))
    .find('.ant-table-thead')
    .find('.ant-checkbox-input')
    .check();
});

Cypress.Commands.add('formTableNotSelectAll', (formItemName) => {
  cy.get(getId(formItemName))
    .find('.ant-table-thead')
    .find('.ant-checkbox-input')
    .uncheck();
});

Cypress.Commands.add('formTableSelect', (formItemName, value) => {
  if (!value) {
    cy.get(getId(formItemName))
      .find('.ant-table-row')
      .first()
      .find('.ant-table-selection-column')
      .click({ force: true });
    return;
  }
  cy.get(getId(formItemName))
    .find('.ant-table-row')
    .contains(value)
    .find('.ant-table-selection-column')
    .first()
    .click({ force: true });
});

Cypress.Commands.add('formTableClearSelect', (formItemName) => {
  cy.get(getId(formItemName)).find('.ant-tag-close-icon').first().click();
});

Cypress.Commands.add(
  'formTableSelectBySearch',
  (formItemName, value, waitTime) => {
    const formItemId = getId(formItemName);
    cy.get(formItemId)
      .find('.magic-input-wrapper')
      .find('input')
      .clear()
      .type(`${value}{enter}`)
      .wait(waitTime || 2000);
    cy.get(formItemId)
      .find('.ant-table-row')
      .first()
      .find('.ant-table-selection-column')
      .find('input')
      .click({ force: true });
  }
);

Cypress.Commands.add(
  'formTableSelectBySearchOption',
  (formItemName, name, value, waitTime = 2000) => {
    const formItemId = getId(formItemName);
    const realName = getTitle(name);
    const realValue = getTitle(value);
    cy.get(formItemId).find('.magic-input-wrapper').find('input').click();
    cy.get(formItemId)
      .find('.magic-input-wrapper')
      .find('.ant-menu-item')
      .contains(realName)
      .click();
    cy.get(formItemId)
      .find('.magic-input-wrapper')
      .find('.ant-menu-item')
      .contains(realValue)
      .click();
    cy.wait(waitTime);
    cy.get(formItemId)
      .find('.ant-table-row')
      .first()
      .find('.ant-table-selection-column')
      .click({ force: true });
  }
);

Cypress.Commands.add('formSelect', (formItemName, label) => {
  cy.get(getId(formItemName)).find('.ant-select').click().wait(2000);
  if (label !== undefined) {
    const realLabel = getTitle(label);
    cy.get('.ant-select-item-option')
      .contains(realLabel)
      .click({ force: true });
  } else {
    cy.get('.ant-select-dropdown')
      .last()
      .find('.ant-select-item-option')
      .first()
      .click({ force: true });
  }
});

Cypress.Commands.add('formRadioChoose', (formItemName, itemIndex = 0) => {
  cy.get(getId(formItemName))
    .find('.ant-radio-button-wrapper')
    .eq(itemIndex)
    .click();
});

Cypress.Commands.add('formRadioChooseByLabel', (formItemName, label) => {
  const realName = getTitle(label);
  cy.get(getId(formItemName))
    .find('.ant-radio-button-wrapper')
    .contains(realName)
    .first()
    .click();
});

Cypress.Commands.add('formAttachFile', (formItemName, filename) => {
  cy.get(getId(formItemName)).find('input').attachFile(filename).wait(2000);
});

Cypress.Commands.add('formAddSelectAdd', (formItemName) => {
  cy.get(getId(formItemName)).find('.add-btn').click().wait(2000);
});

Cypress.Commands.add('formSwitch', (formItemName) => {
  cy.get(getId(formItemName)).find('.ant-switch').click().wait(2000);
});

Cypress.Commands.add('formButtonClick', (formItemName) => {
  cy.get(getId(formItemName)).find('button').first().click().wait(2000);
});

Cypress.Commands.add('formTransfer', (formItemName, value) => {
  const formId = getId(formItemName);
  cy.get(formId).find('.ant-transfer-list').first().as('leftTrans');
  cy.get('@leftTrans').find('.ant-transfer-list-search').clear().type(value);
  cy.get('@leftTrans')
    .find('.ant-table-row')
    .first()
    .find('.ant-checkbox-input')
    .click();
  cy.get(formId).find('.ant-transfer-operation').find('button').first().click();
});

Cypress.Commands.add('formTransferRight', (formItemName, value) => {
  cy.get(getId(formItemName)).find('.ant-transfer-list').eq(1).as('rightTrans');
  cy.get('@rightTrans').find('.ant-transfer-list-search').clear().type(value);
});

Cypress.Commands.add('formTabClick', (formItemName, index) => {
  cy.get(getId(formItemName)).find('.ant-tabs-tab').eq(index).click();
});

Cypress.Commands.add('waitLoginFormLoading', () => {
  cy.get('#normal_login_username', { timeout: 120000 }).should('exist');
});

Cypress.Commands.add('loginFormInput', (formItemName, value) => {
  cy.get(getIdLogin(formItemName)).clear().type(value);
});

Cypress.Commands.add('loginFormSubmit', () => {
  cy.get('#normal_login_submit > div > button').click().waitFormLoading();
});

Cypress.Commands.add('loginFormSelect', (index, label) => {
  cy.get('.ant-select-selector').eq(index).click().wait(2000);
  if (label !== undefined) {
    cy.get('.ant-select-item-option').contains(label).click({ force: true });
  } else {
    cy.get('.ant-select-dropdown')
      .last()
      .find('.ant-select-item-option')
      .first()
      .click({ force: true });
  }
});

Cypress.Commands.add('resetFormInput', (formItemName, value) => {
  cy.get(getIdReset(formItemName)).clear().type(value);
});

Cypress.Commands.add('resetFormSubmit', () => {
  cy.get('#reset_password').find('button').first().click().waitFormLoading();
});

Cypress.Commands.add('clickConfirmButtonInModal', () => {
  cy.get('.ant-modal-footer').find('button').last().click();
});

Cypress.Commands.add('formInputKeyValue', (formItemName, key, value) => {
  cy.get(getId(formItemName))
    .find('.item-detail')
    .last()
    .find('input')
    .eq(0)
    .clear()
    .type(key);
  cy.get(getId(formItemName))
    .find('.item-detail')
    .last()
    .find('input')
    .eq(1)
    .clear()
    .type(value);
});

Cypress.Commands.add('formTransferLeftCheck', (formItemName, index) => {
  const formId = getId(formItemName);
  cy.get(formId)
    .find('.ant-transfer-list')
    .first()
    .find('.ant-tree-checkbox')
    .eq(index)
    .click();
  cy.get(formId).find('.ant-transfer-operation').find('button').first().click();
});

Cypress.Commands.add('formTransferRightCheck', (formItemName, index) => {
  const formId = getId(formItemName);
  cy.get(formId)
    .find('.ant-transfer-list')
    .last()
    .find('.ant-checkbox-input')
    .eq(index)
    .click();
  cy.get(formId).find('.ant-transfer-operation').find('button').last().click();
});
