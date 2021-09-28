简体中文 | [English](../../en/test/3-0-how-to-edit-e2e-case.md)

关于 Cypress 的具体介绍及使用方法，请参考[官方文档](https://docs.cypress.io/guides/overview/why-cypress)

这里主要给出编写 Skyline-console 前端页面中，资源对应的 E2E 用例，并使用`test/e2e/support`中定义的函数的说明

以下介绍，以云主机用例`test/e2e/integration/pages/compute/instance.spec.js`为例

一般，测试资源的相应功能时，是按照以下顺序

1. 准备测试使用的相关变量
   - 创建资源时的必须参数，如：名称、密码
   - 编辑资源时的必须参数，如：新的名称
   - 创建关联资源时，关联资源的名称，如：网络名称、路由器名称、云硬盘名称

   ```javascript
   const uuid = Cypress._.random(0, 1e6);
   const name = `e2e-instance-${uuid}`;
   const newname = `${name}-1`;
   const password = 'passW0rd_1';
   const volumeName = `e2e-instance-attach-volume-${uuid}`;
   const networkName = `e2e-network-for-instance-${uuid}`;
   const routerName = `e2e-router-for-instance-${uuid}`;
   ```

2. 操作前登录
   - 如果是操作控制台资源，使用`cy.login`
   - 如果是操作管理平台资源，使用`cy.loginAdmin`
   - 一般会在`login`与`loginAdmin`函数中使用变量`listUrl`，即登录后直接访问资源所在页面

   ```javascript
   beforeEach(() => {
     cy.login(listUrl);
   });
   ```

3. 创建关联资源，使用`resource-commands.js`中提供的创建资源的函数，以测试云主机为例
   - 创建网络，用于测试创建云主机、挂载网卡

     ```javascript
     cy.createNetwork({ name: networkName });
     ```

   - 创建路由器`cy.createRouter`，用于测试关联浮动 IP 时确保浮动 IP 可达
     - 以如下方式创建的路由器将开启外网网关，并绑定了`networkName`网络的子网

     ```javascript
     cy.createRouter({ name: routerName, network: networkName });
     ```

   - 创建浮动 IP`cy.createFip`，用于测试关联浮动 IP

     ```javascript
     cy.createFip();
     ```

   - 创建云硬盘`cy.createVolume`(用于测试挂载云硬盘)

     ```javascript
     cy.createVolume(volumeName);
     ```

4. 编写创建资源的用例
5. 编写访问资源详情的用例
6. 分别编写资源的所有操作对应的用例
    - 一般`编辑`操作的用例写在后面，其后编写`删除`操作的用例，这样能测试到编辑是否生效
7. 删除关联资源，使用`resource-commands.js`中提供的删除资源的函数，这是为了测试用例执行后，测试账号内的资源尽可能的干净
   - 删除浮动 IP

     ```javascript
     cy.deleteAll('fip');
     ```

   - 删除路由器`routerName`

     ```javascript
     cy.deleteRouter(routerName, networkName);
     ```

   - 删除网络`networkName`

     ```javascript
     cy.deleteAll('network', networkName);
     ```

   - 删除云硬盘`volumeName`

     ```javascript
     cy.deleteAll('volume', volumeName);
     ```

   - 删除所有可用状态的云硬盘

     ```javascript
     cy.deleteAllAvailableVolume();
     ```

上述步骤中的`4`、`5`、`6`主要使用了

- `test/e2e/support/form-commands.js`中的函数操作表单，详细介绍见[3-1-E2E-form-operation](3-1-E2E-form-operation.md)
- `test/e2e/support/table-commands.js`中的函数，操作表格中的按钮点击、搜索、进入详情，详细介绍见[3-2-E2E-table-operation](3-2-E2E-table-operation.md)
- `test/e2e/support/detail-commands.js`中的函数，操作返回列表页、检测详情内容、切换详情 Tab，详细介绍见[3-3-E2E-detail-operation](3-3-E2E-detail-operation.md)

创建、删除关联资源主要使用了`test/e2e/support/resource-commands.js`中的函数，，详细介绍见[3-4-E2E-resource-operation](3-4-E2E-resource-operation.md)