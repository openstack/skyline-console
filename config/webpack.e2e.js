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

const { resolve } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common');

const { getThemeConfig, getCustomStyleVariables } = require('./utils');

const theme = getThemeConfig();

const root = (path) => resolve(__dirname, `../${path}`);

const { version, ...restConfig } = common;

module.exports = (env) => {
  const API = (env || {}).API || 'mock';

  // const devServer = {
  //   // host: '0.0.0.0',
  //   host: 'localhost',
  //   port: 8088,
  //   contentBase: root('dist'),
  //   historyApiFallback: true,
  //   compress: true,
  //   hot: false,
  //   inline: false,
  //   disableHostCheck: true,
  //   // progress: true
  // };

  return merge(restConfig, {
    entry: {
      main: root('src/core/index.jsx'),
    },
    output: {
      filename: '[name].js',
      path: root('dist'),
      publicPath: '/',
      chunkFilename: `[name].bundle.${version}.js`,
    },
    mode: 'production',
    // devtool: 'inline-source-map',
    // devServer: devServer,
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
          ],
        },
        {
          test: /\.(css|less)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'style-loader', // creates style nodes from JS strings
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
              options: {
                modules: {
                  mode: 'global',
                },
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer('last 2 version')],
                sourceMap: false,
              },
            },
            {
              loader: 'less-loader', // compiles Less to CSS
              options: {
                importLoaders: true,
                javascriptEnabled: true,
              },
            },
            {
              loader: resolve('config/less-replace-loader'),
              options: {
                variableFile: getCustomStyleVariables(),
              },
            },
          ],
        },
        {
          test: /\.(less)$/,
          include: /node_modules/,
          use: [
            {
              loader: 'style-loader', // creates style nodes from JS strings
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
            {
              loader: 'less-loader', // compiles Less to CSS
              options: {
                javascriptEnabled: true,
                modifyVars: theme,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        // Inject environment variables for the project
        'process.env.API': JSON.stringify(API),
      }),
      new HtmlWebPackPlugin({
        template: root('src/asset/template/index.html'),
        favicon: root('src/asset/image/favicon.ico'),
      }),
      new CleanWebpackPlugin(['dist'], {
        root: resolve(__dirname, `../`),
      }),
      // new BundleAnalyzerPlugin(),
    ],
    optimization: {
      splitChunks: {
        maxInitialRequests: 10,
        cacheGroups: {
          commons: {
            chunks: 'all',
            name: 'common',
            minChunks: 1,
            minSize: 0,
          },
          vendor: {
            test: /node_modules/,
            chunks: 'all',
            name: 'vendor',
            minChunks: 1,
            priority: 10,
            enforce: true,
          },
        },
      },
      runtimeChunk: {
        name: () => `runtime.${version}`,
      },
      minimize: true, // default true for production
      minimizer: [
        new TerserPlugin({
          sourceMap: false,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
  });
};
