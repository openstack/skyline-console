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

import { v4 as uuidv4 } from 'uuid';
import getTitle from './common';

Cypress.Commands.add('setLanguage', (value) => {
  const exp = Date.now() + 864000000;
  const language = Cypress.env('language') || 'en';
  const langValue = { value: value || language, expires: exp };
  window.localStorage.setItem('lang', JSON.stringify(langValue));
});

Cypress.Commands.add('visitPage', (url = '') => {
  cy.visit(url);
  const isListPage = url.indexOf('overview') < 0;
  cy.get('#app', { timeout: 120000 }).should('exist');
  if (url && isListPage) {
    cy.wait(2000);
    cy.get('.ant-table-wrapper', { timeout: 120000 }).should('exist');
    cy.waitTableLoading();
  }
});

Cypress.Commands.add(
  'login',
  (visitUrl = '', switchToAdmin = false, isAdmin = false) => {
    cy.setLanguage();
    const switchProject = switchToAdmin;
    cy.setCookie('time_expired', Cypress.config('timeExpired') || '');
    if (isAdmin) {
      if (Cypress.config('adminToken')) {
        cy.setCookie('session', Cypress.config('adminSession'));
        cy.setCookie('X-Auth-Token', Cypress.config('adminToken'));
        cy.visitPage(visitUrl || '/base/overview-admin');
        if (switchProject) {
          cy.switchToAdminProject();
        }
        return;
      }
    } else if (Cypress.config('token')) {
      cy.setCookie('session', Cypress.config('session'));
      cy.setCookie('X-Auth-Token', Cypress.config('token'));
      cy.visitPage(visitUrl || '/base/overview');
      if (switchProject) {
        cy.switchToAdminProject();
      }
      return;
    }

    cy.log('need login by request');
    const body = {
      password: isAdmin
        ? Cypress.env('passwordAdmin')
        : Cypress.env('password'),
      username: isAdmin
        ? Cypress.env('usernameAdmin')
        : Cypress.env('username'),
      region: Cypress.env('region'),
      domain: Cypress.env('domain'),
    };
    const uuid = uuidv4();
    cy.request({
      url: '/api/openstack/skyline/api/v1/login',
      body,
      method: 'POST',
      headers: {
        'X-Openstack-Request-Id': `req-${uuid}`,
      },
    }).then((res) => {
      const { body: resBody, headers } = res;
      const [sessionCookie, ...rest] = headers['set-cookie'];
      const timeCookie = rest[rest.length - 1];
      const getCookieValue = (sk) => sk.split(';')[0].split('=');
      // eslint-disable-next-line no-unused-vars
      const session = getCookieValue(sessionCookie)[1];
      const timeExpired = getCookieValue(timeCookie)[1] || '';
      const { keystone_token } = resBody || {};
      cy.setCookie('session', session);
      cy.setCookie('X-Auth-Token', keystone_token);
      cy.setCookie('time_expired', timeExpired);
      Cypress.config('timeExpired', timeExpired);
      if (isAdmin) {
        Cypress.config('adminToken', keystone_token);
        Cypress.config('adminSession', session);
        cy.visitPage(visitUrl || '/base/overview-admin');
        if (switchProject) {
          cy.switchToAdminProject();
        }
      } else {
        Cypress.config('token', keystone_token);
        Cypress.config('session', session);

        cy.visitPage(visitUrl || '/base/overview');
        if (switchProject) {
          cy.switchToAdminProject();
        }
      }
    });
  }
);

Cypress.Commands.add('clearToken', () => {
  cy.setCookie('session', '');
  cy.setCookie('X-Auth-Token', '');
  cy.setCookie('time_expired', '');
  Cypress.config('token', null);
  Cypress.config('adminToken', null);
  Cypress.config('timeExpired', null);
});

Cypress.Commands.add('loginAdmin', (visitUrl = '', switchToAdmin = false) => {
  const switchProject = switchToAdmin || Cypress.env('switchToAdminProject');
  cy.login(visitUrl || '/base/overview-admin', switchProject, true);
});

Cypress.Commands.add('loginByPage', (username, password) => {
  cy.visit('/');
  cy.waitLoginFormLoading().wait(5000);
  cy.loginFormSelect(0, 'RegionOne')
    .loginFormInput('domain', username || Cypress.env('username'))
    .loginFormInput('password', password || Cypress.env('password'))
    .loginFormSubmit();
});

Cypress.Commands.add('clickMenu', (fatherIndex, sonIndex) => {
  const ele = cy
    .get('.ant-menu-dark')
    .find('.ant-menu-submenu')
    .eq(fatherIndex);
  ele.click();
  cy.wait(1000);
  cy.get('li.ant-menu-submenu-open').first().find('ul>li').eq(sonIndex).click();
  cy.wait(1000);
});

Cypress.Commands.add('setLanguageByPage', () => {
  const language = Cypress.env('language');
  if (language === 'zh-hans') {
    return;
  }
  cy.log('change language to english');
  cy.get('#app > div > div > div > section > header > div > div')
    .find('div')
    .eq(1)
    .find('.ant-col')
    .last()
    .find('button')
    .trigger('mouseover', { force: true });
  cy.get('.ant-dropdown-menu-light')
    .find('li')
    .eq(2)
    .find('button')
    .eq(1)
    .click()
    .wait(5000);
});

Cypress.Commands.add('switchToAdminProject', () => {
  cy.get('#project-switch').click().wait(2000);
  cy.formTableSelectBySearch('project', 'admin')
    .clickModalActionSubmitButton()
    .wait(5000);
});

Cypress.Commands.add('clickTab', (label, urlTab, waitTime = 2000) => {
  const realTitle = getTitle(label);
  cy.get('.ant-tabs-tab-btn').contains(realTitle).click().wait(waitTime);
  if (urlTab) {
    cy.url().should('include', urlTab);
  }
});

Cypress.Commands.add('logout', () => {
  cy.clearToken();
  cy.get('.ant-layout-header').find('.anticon-user').click().wait(2000);
});

Cypress.Commands.add('clickBreadcrumbLink', (index = 0) => {
  cy.get('.ant-breadcrumb-link').eq(index).click();
});
