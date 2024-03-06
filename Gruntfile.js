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

module.exports = function (grunt) {
  grunt.initConfig({
    i18next: {
      dev: {
        src: ['src/**/*.{jsx,js}'],
        dest: 'src',
        options: {
          lngs: ['en', 'zh-hans', 'ko-kr', 'tr-tr', 'ru'],
          removeUnusedKeys: true,
          sort: true,
          keySeparator: false,
          nsSeparator: false,
          interpolation: {
            prefix: '{{',
            suffix: '}}',
          },
          resource: {
            // loadPath: 'src/locales/{{lng}}/{{ns}}.json',
            loadPath: 'src/locales/{{lng}}.json',
            // savePath: 'locales/{{lng}}/{{ns}}.json'
            savePath: 'locales/{{lng}}.json',
          },
          func: {
            list: ['t', 't.html'],
            extensions: ['.js', '.jsx'],
          },
          defaultValue: (lng, ns, key) => {
            if (lng === 'en') {
              return key;
            }
            return '';
          },
        },
      },
    },
  });

  // Load the plugin that provides the "i18next" task.
  grunt.loadNpmTasks('i18next-scanner');

  // Default task(s).
  grunt.registerTask('default', ['i18next']);
};
