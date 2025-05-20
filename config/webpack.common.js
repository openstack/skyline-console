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

const webpack = require('webpack');
const { normalize, resolve } = require('path');
// const path = require("path");
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const moment = require('moment');
const { getGlobalVariables, getCustomStyleVariables } = require('./utils');

const root = (path) => resolve(__dirname, `../${path}`);
const version = moment().unix();

// (jamesdenton) Remove once libs no longer hardcode the hashing algorithm
const crypto = require("crypto");
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = algorithm => crypto_orig_createHash(algorithm == "md4" ? "md5" : algorithm);

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: resolve('config/js-string-replace-loader'),
        include: [root('src/core')],
        options: {
          search: 'styles/variables',
          change: getCustomStyleVariables(),
        },
      },
      {
        test: /\.jsx?$/,
        include: [root('src'), root('node_modules')],
        use: ['thread-loader', 'cache-loader'],
      },
      {
        test: /\.(png|gif|jpg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240,
              name: normalize(`asset/image/[name].${version}.[ext]`),
            },
          },
        ],
        exclude: [
          root('src/asset/image/logo.png'),
          root('src/asset/image/loginRightLogo.png'),
        ],
      },
      {
        test: /\.(png|gif|jpg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              name: normalize('asset/image/[name].[ext]'),
            },
          },
        ],
        include: [
          root('src/asset/image/logo.png'),
          root('src/asset/image/loginRightLogo.png'),
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              name: normalize('asset/image/[name].[ext]'),
            },
          },
        ],
        include: [
          root('src/asset/image/cloud-logo.svg'),
          root('src/asset/image/cloud-logo-white.svg'),
        ],
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240,
              name: normalize(`asset/image/[name].${version}.[ext]`),
            },
          },
        ],
        exclude: [
          root('src/asset/image/cloud-logo.svg'),
          root('src/asset/image/cloud-logo-white.svg'),
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [root('src'), root('src/pages'), 'node_modules'],
    alias: {
      src: root('src'),
      asset: root('src/asset'),
      image: root('src/asset/image'),
      core: root('src/core'),
      containers: root('src/containers'),
      layouts: root('src/layouts'),
      components: root('src/components'),
      pages: root('src/pages'),
      utils: root('src/utils'),
      stores: root('src/stores'),
      locales: root('src/locales'),
      styles: root('src/styles'),
      resources: root('src/resources'),
      client: root('src/client'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      GLOBAL_VARIABLES: getGlobalVariables(),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
};

module.exports.version = version;
