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

describe('The Login Page', () => {
  it('successfully loads', () => {
    cy.intercept('GET', '/regions').as('regions');

    cy.visit('/');
    cy.waitLoginFormLoading();
    cy.wait('@regions');
  });

  it('successfully error username and password', () => {
    cy.wait(5000);
    cy.loginFormSelect(0, 'RegionOne')
      .loginFormInput('domain', `${Cypress.env('username')}1`)
      .loginFormInput('password', `${Cypress.env('password')}1`)
      .loginFormSubmit()
      .get('#normal_login_error')
      .should('have.length', 1);
  });

  it('successfully login and check menu', () => {
    cy.wait(5000);
    cy.loginFormSelect(0, 'RegionOne')
      .loginFormInput('domain', Cypress.env('username'))
      .loginFormInput('password', Cypress.env('password'))
      .loginFormSubmit()
      .wait(2000)
      .url()
      .should('include', '/base/overview')
      .wait(2000)
      .clickMenu(1, 0, '/storage$Menu')
      .wait(2000)
      .url()
      .should('include', '/storage/volume');
  });
});
