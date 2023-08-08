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

module.exports = {
  bail: true,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
    '\\.svg': '<rootDir>/test/unit/svg-mock.js',
    '^src(.*)$': '<rootDir>/src$1',
    '^components(.*)$': '<rootDir>/src/components$1',
    '^layouts(.*)$': '<rootDir>/src/layouts$1',
    '^stores(.*)$': '<rootDir>/src/stores$1',
    '^utils(.*)$': '<rootDir>/src/utils$1',
    '^pages(.*)$': '<rootDir>/src/pages$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['node_modules', '.cache', 'test/e2e', 'config'],
  setupFiles: ['<rootDir>/test/unit/setup-tests.js'],
  globals: {
    GLOBAL_VARIABLES: {
      defaultLanguage: 'en',
      supportLanguages: ['en', 'zh-hans'],
    },
  },
};
