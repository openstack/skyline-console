简体中文 | [English](../../en/develop/3-13-Route-introduction.md)

# 用途

- 需要独立展示的页面均需要配置路由
  - 按产品的需求，菜单下的二级页面，均需要以整页方式展示，如`计算-云主机`
    - 资源列表页
      - 如，云主机列表页
      - 注意，详情页下的相关资源列表页不需要配置路由
    - 资源详情页
      - 如，云主机详情页
    - 整页展示的 Form 表单
      - 如，创建云主机
  - 某些菜单只有一级页面，如`首页`，也需要配置路由

# 如何使用

## 二级菜单对应的路由

- 按[目录介绍](2-catalog-introduction.md)中的要求，每个菜单一级页面，在`pages`下有一个独立的文件夹，其内的`containers文件夹`放置二级页面代码，`routes文件夹`配置路由
- 配置写在`pages/xxxx/routes/index.js`中
- 路由的配置需要遵守固定格式，可参考`src/pages/compute/routes/index.js`
  - 是个数组
  - 数组中的每个元素，要求
    - `path`, 一级菜单对应的名称，如`计算`用`compute`
    - `component`，布局组件
      - `auth`相关的页面，如登录，使用的是`src/layouts/User/index.jsx`组件
      - 登录后展示的页面，如云主机、页面等，使用的是`src/layouts/Base/index.jsx`组件
        - 该布局自动处理菜单项的展示、右侧内容头部的`header`展示、右侧内容的面包屑等
    - `routes`，配置的主体内容，是个数组，每个元素要求
      - 以计算的路由配置`src/pages/compute/routes/index.js`为例

        ```javascript
        { path: `${PATH}/instance`, component: Instance, exact: true },
        ```

      - `path`, 每个整页页面对应的路径，如`compute/instance`
      - `component`，页面对应的组件，即`containers`下的组件

- 对于资源型的页面，一般会配置
  - 控制台访问的列表页、详情页、复杂的创建页（简单的创建一般使用弹出窗即可）
  - 管理平台访问的列表页、详情页（`path`中要求包含`-admin`或`_admin`）
  - 对于详情页，我们推荐使用`id`参数项
  - 以云主机`src/pages/compute/routes/index.js`为例

    ```javascript
    { path: `${PATH}/instance`, component: Instance, exact: true },
    { path: `${PATH}/instance-admin`, component: Instance, exact: true },
    {
      path: `${PATH}/instance/detail/:id`,
      component: InstanceDetail,
      exact: true,
    },
    {
      path: `${PATH}/instance-admin/detail/:id`,
      component: InstanceDetail,
      exact: true,
    },
    { path: `${PATH}/instance/create`, component: StepCreate, exact: true },
    ```

## 一级菜单对应的路由

- 一级菜单需要添加在`src/core/routes.js`
- 以计算为例

  ```javascript
  {
      path: '/compute',
      component: Compute,
    },
  ```
