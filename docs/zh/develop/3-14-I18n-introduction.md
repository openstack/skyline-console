简体中文 | [English](../../en/develop/3-14-I18n-introduction.md)

# 用途

- 框架支持国际化，默认支持英文、中文

  ![i18n](../../zh/develop/images/i18n/i18n.png)

  ![english](../../zh/develop/images/i18n/english.png)

# 代码位置

- `src/locales/index.js`
- 英文：`src/locales/en.json`
- 中文：`src/locales/zh.json`

# 如何使用

- 代码中的需要国际化展示的字符串均使用英文，使用命令行完成字符采集后，无需更新 en.json 文件，只需要修改 zh.json 中对应的中文即可完成国际化的操作
- 对于需要国际化的字符串，使用`t`函数即可
  - 以`云主机`为例，对应的国际化写法为`t('instance')`
  - 注意，英文是大小写相关的
  - `t`函数支持带有参数的字符串
    - 参数使用`{}`标识，如

      ```javascript
      confirmContext = () =>
        t('Are you sure to { action }?', {
          action: this.actionName || this.title,
        });
      ```

- 采集

  ```shell
  yarn run i18n
  ```

  - 采集后，`en.json`与`zh.json`文件会自动更新
- 更新中文
  - 采集后，直接在`zh.json`中更新相应的中文翻译即可
