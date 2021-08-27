简体中文 | [English](../../en/develop/3-11-Action-introduction.md)

# 用途

- 配置资源对应的所有操作

  ![操作](../../zh/develop/images/form/action.png)

- 按照相应的配置编写后，会在资源列表页相应的位置展示相应的操作按钮

# 代码位置

- `pages/xxxx/containers/XXXX/actions/index.jsx`

# 如何使用

- 返回一个对象，其内配置主操作按钮、批量操作按钮、行操作按钮
- 以网络`src/pages/network/containers/Network/actions/index.jsx`为例
  - 配置了主按钮为创建
  - 配置了批量操作为删除
  - 配置了行操作为编辑、创建子网、删除

  ```javascript
  import CreateNetwork from './CreateNetwork';
  import CreateSubnet from './CreateSubnet';
  import DeleteAction from './Delete';
  import Edit from './Edit';

  const actionConfigs = {
    rowActions: {
      firstAction: Edit,
      moreActions: [
        {
          action: CreateSubnet,
        },
        {
          action: DeleteAction,
        },
      ],
    },
    batchActions: [DeleteAction],
    primaryActions: [CreateNetwork],
  };

  export default actionConfigs;
  ```

- 在资源对应的列表代码中配置`actionConfigs`即可
  - 以网络`src/pages/network/containers/Network/ProjectNetwork.jsx`为例

    ```javascript
    import actionConfigs from './actions';
    get actionConfigs() {
      return actionConfigs;
    }
    ```

## 主操作按钮配置`primaryActions`

- 返回组件的列表
- 如果没有主按钮，可以设置为`null`或`[]`
- 如果不可操作（比如权限不够），将自动隐藏

## 批量操作按钮配置`batchActions`

- 返回组件的列表
- 如果没有批量按钮，可以设置为`null`或`[]`
- 如果不可操作（比如权限不够），将自动隐藏

## 行操作按钮配置`rowActions`

- 返回一个对象，内含`firstAction`, `moreActions`对应的组件
- 可以返回一个空对象`{}`
- `firstAction`，行操作对应的第一个按钮
  - 如果不可操作，按钮灰掉
  - 可以是一个组件
  - 可以是`null`
    - 以系统信息-网络`src/pages/configuration/containers/SystemInfo/NeutronAgent/actions/index.jsx`为例

      ```javascript
      import Enable from './Enable';
      import Disable from './Disable';

      const actionConfigs = {
        rowActions: {
          firstAction: null,
          moreActions: [
            {
              action: Enable,
            },
            {
              action: Disable,
            },
          ],
        },
        batchActions: [],
        primaryActions: [],
      };

      export default actionConfigs;
      ```

- `moreActions`
  - `更多`按钮下对应的操作组件
  - 操作的数组
  - 其内的操作如果不可用，将直接隐藏该操作按钮
  - 支持两种格式的配置，对应了不同的展示方案
    - 每个元素是个含有`action`属性的对象

      ![云硬盘操作](../../zh/develop/images/form/volume-action.png)

    - 每个元素是个含有`title`、`actions`属性的对象

      ![云主机操作](../../zh/develop/images/form/instance-action.png)

      - 以云主机`src/pages/compute/containers/Instance/actions/index.jsx`为例

        ```javascript
        const statusActions = [
          StartAction,
          StopAction,
          LockAction,
          UnlockAction,
          RebootAction,
          SoftRebootAction,
          SuspendAction,
          ResumeAction,
          PauseAction,
          UnpauseAction,
          Shelve,
          Unshelve,
        ];
        const actionConfigs = {
          rowActions: {
            firstAction: Console,
            moreActions: [
              {
                title: t('Instance Status'),
                actions: statusActions,
              },...}}
        ```
