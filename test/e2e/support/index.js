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

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import '@cypress/code-coverage/support';
import './form-commands';
import './table-commands';
import './detail-commands';
import './commands';
import './resource-commands';
import 'cypress-file-upload';

require('cypress-downloadfile/lib/downloadFileCommand');

Cypress.Cookies.defaults({
  preserve: ['session', 'X-Auth-Token', 'shouldSkip', 'time_expired'],
});

Cypress.on(
  'uncaught:exception',
  // eslint-disable-next-line no-unused-vars
  (err, runnable) =>
    // returning false here prevents Cypress from
    // failing the test
    false
);

// Alternatively you can use CommonJS syntax:
// require('./commands')
