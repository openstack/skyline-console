简体中文 | [English](../../en/test/3-3-E2E-detail-operation.md)

因为前端框架使用的一致性，我们在编写详情操作的相关用例，选取元素并进行操作时，往往会发现有很强的规律性，所以我们对大多数详情操作都编写了相应的 Cypress 函数，极大的减少了编写测试用例的难度，以下会对主要使用的表格操作函数做出详细的说明。

- `checkDetailName`
  - 验证详情页头部包含指定资源名称
  - 参数`name`，资源名称
  - 以查看密钥详情`test/e2e/integration/pages/compute/keypair.spec.js`为例

    ```javascript
    it('successfully detail', () => {
        cy.tableSearchText(name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
        cy.goBackToList(listUrl);
    });
    ```

    ![name](images/e2e/detail/name.png)

- `goBackToList`
  - 点击详情页的`返回`按钮，进入列表页，并等待列表加载完成
  - 参数`url`，列表url
    - 如果设置，会验证返回的列表路由是否符合预期
  - 以查看密钥详情`test/e2e/integration/pages/compute/keypair.spec.js`为例
    1. 搜索
    2. 验证表格第一行是否包含指定名称
    3. 进入详情页
    4. 验证详情页的名称
    5. 返回列表页

    ```javascript
    it('successfully detail', () => {
        cy.tableSearchText(name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
        cy.goBackToList(listUrl);
    });
    ```

    ![list](images/e2e/detail/list.png)

- `goBackToList`
  - 点击详情页的`返回`按钮，进入列表页，并等待列表加载完成
  - 参数`url`，列表url
    - 如果设置，会验证返回的列表路由是否符合预期
  - 以查看密钥详情`test/e2e/integration/pages/compute/keypair.spec.js`为例
    1. 搜索
    2. 验证表格第一行是否包含指定名称
    3. 进入详情页
    4. 验证详情页的名称
    5. 返回列表页

    ```javascript
    it('successfully detail', () => {
        cy.tableSearchText(name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
        cy.goBackToList(listUrl);
    });
    ```

    ![list](images/e2e/detail/list.png)

- `clickDetailTab`
  - 点击详情页下方的指定Tab标签，并等待相关资源列表加载完成
  - 参数`label`，指定的Tab标签
  - 参数`urlTab`，路由中的tab属性
    - 如果设置，会验证切换标签后路由中的tab属性是否符合预期
  - 参数`waitTime`，切换标签后的等待时间
  - 以查看网络详情`test/e2e/integration/pages/network/network.spec.js`为例
    1. 搜索
    2. 验证表格第一行是否包含指定名称
    3. 进入详情页
    4. 验证详情页的名称
    5. 点击子网Tab，并等待列表加载完成
    6. 点击端口Tab，并等待列表加载完成
    5. 返回列表页

    ```javascript
    it('successfully detail', () => {
      cy.tableSearchText(name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
      cy.clickDetailTab('Subnets', 'subnets').clickDetailTab('Ports', 'ports');
      cy.goBackToList(listUrl);
    });
    ```

    ![tab](images/e2e/detail/tab.png)

对详情页主要用到了上方介绍的函数，函数的具体编写，请查看`test/e2e/support/detail-commands.js`