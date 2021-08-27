简体中文 | [English](../../en/develop/3-0-how-to-develop.md)

# 开发一个新的资源列表页

- 步骤 1：确认代码位置及目录结构
  - 按照预想的在菜单项中的位置，放置在 Containers 下
  - 以云主机为例，对应的菜单项为`计算-云主机`，那么创建文件夹`src/pages/compute/containers/Instance`，创建文件`src/pages/compute/containers/Instance/index.jsx`
- 步骤 2：编写 Store 代码
  - 参考[3-5-BaseStore-introduction](3-5-BaseStore-introduction.md)，复写相应的函数
- 步骤 3：编写列表页代码
  - 参考[3-1-BaseList-introduction](3-1-BaseList-introduction.md)，复写相应的函数
- 步骤 4：配置路由
  - 参考[3-13-Route-introduction](3-13-Route-introduction.md)
  - 在步骤 1 中的父级目录的`routes/index.js`文件中，配置路由
  - 如果是全新的模块，还需要在`src/pages/storage/routes/index.js`中导入
- 步骤 5：配置菜单
  - 参考[3-12-Menu-introduction](3-12-Menu-introduction.md)
  - 配置控制台的菜单项，在`src/layouts/menu.jsx`中配置
  - 配置管理平台的菜单项，在`src/layouts/admin-menu.jsx`中配置
- 步骤 6：国际化
  - 参考[3-14-I18n-introduction](3-14-I18n-introduction.md)，完成相应翻译
- 如果，产品需求的列表页面是含有`Tab`的页面，则可参考[3-2-BaseTabList-introduction](3-2-BaseTabList-introduction.md)，通常`index.jsx`内配置`Tab`，可参考镜像页面代码`src/pages/compute/containers/Image/index.jsx`

# 开发一个新的资源详情页

- 步骤 1：确认代码位置及目录结构
  - 按照预想的在菜单项中的位置，放置在 Containers 下
  - 以云主机为例，对应的菜单项为`计算-云主机`，创建文件`src/pages/compute/containers/Instance/Detail/index.jsx`，`src/pages/compute/containers/Instance/Detail/BaseDetail.jsx`
- 步骤 2：编写 Store 代码
  - 参考[3-5-BaseStore-introduction](3-5-BaseStore-introduction.md)，复写相应的函数
- 步骤 3：编写详情页代码
  - 参考[3-3-BaseDetail-introduction](3-3-BaseDetail-introduction.md)，复写相应的函数
- 步骤 4：编写详情页-详情 Tab 代码
  - 参考[3-4-BaseDetailInfo-introduction](3-4-BaseDetailInfo-introduction.md)，复写相应的函数
- 步骤 5：配置路由
  - 参考[3-13-Route-introduction](3-13-Route-introduction.md)
  - 在步骤 1 中的父级目录的`routes/index.js`文件中，配置路由
  - 如果是全新的模块，还需要在`src/pages/storage/routes/index.js`中导入
- 步骤 6：配置菜单
  - 参考[3-12-Menu-introduction](3-12-Menu-introduction.md)
  - 配置控制台的菜单项，在`src/layouts/menu.jsx`中配置
  - 配置管理平台的菜单项，在`src/layouts/admin-menu.jsx`中配置
- 步骤 7：国际化
  - 参考[3-14-I18n-introduction](3-14-I18n-introduction.md)，完成相应翻译

# 开发一个新的操作

## 开发一个页面级的操作

- 步骤 1：确认代码位置及目录结构
  - 按照预想的在菜单项中的位置，放置在 Containers 下
  - 以云硬盘为例，对应的菜单项为`存储-云硬盘-云硬盘创建`，创建文件`src/pages/storage/containers/Volume/actions/Create/index.jsx`
- 步骤 2：编写 Store 代码
  - 参考[3-5-BaseStore-introduction](3-5-BaseStore-introduction.md)，复写或新增相应的函数
- 步骤 3：编写 FormAction 代码
  - 参考[3-6-FormAction-introduction](3-6-FormAction-introduction.md)，复写相应的函数
- 步骤 4：配置 Action
  - 参考[3-11-Action-introduction](3-11-Action-introduction.md)，配置到相应为位置
- 步骤 5：配置路由
  - 参考[3-13-Route-introduction](3-13-Route-introduction.md)，配置对应的路由
- 步骤 6：配置菜单
  - 参考[3-12-Menu-introduction](3-12-Menu-introduction.md)
  - 配置控制台的菜单项，在`src/layouts/menu.jsx`中配置
  - 配置管理平台的菜单项，在`src/layouts/admin-menu.jsx`中配置
- 步骤 7：国际化
  - 参考[3-14-I18n-introduction](3-14-I18n-introduction.md)，完成相应翻译

## 开发一个确认型的操作

- 步骤 1：确认代码位置及目录结构
  - 按照预想的在菜单项中的位置，放置在 Containers 下
  - 以云硬盘为例，对应的菜单项为`存储-云硬盘-删除云硬盘`，创建文件`src/pages/storage/containers/Volume/actions/Delete.jsx`
- 步骤 2：编写 Store 代码
  - 参考[3-5-BaseStore-introduction](3-5-BaseStore-introduction.md)，复写或新增相应的函数
- 步骤 3：编写 ConfirmAction 代码
  - 参考[3-8-ConfirmAction-introduction](3-8-ConfirmAction-introduction.md)，复写相应的函数
- 步骤 4：配置 Action
  - 参考[3-11-Action-introduction](3-11-Action-introduction.md)，配置到相应为位置
- 步骤 5：国际化
  - 参考[3-14-I18n-introduction](3-14-I18n-introduction.md)，完成相应翻译

## 开发一个弹窗型的操作

- 步骤 1：确认代码位置及目录结构
  - 按照预想的在菜单项中的位置，放置在 Containers 下
  - 以云硬盘为例，对应的菜单项为`存储-云硬盘-编辑`，创建文件`src/pages/storage/containers/Volume/actions/Edit.jsx`
- 步骤 2：编写 Store 代码
  - 参考[3-5-BaseStore-introduction](3-5-BaseStore-introduction.md)，复写或新增相应的函数
- 步骤 3：编写 ModalAction 代码
  - 参考[3-7-ModalAction-introduction](3-7-ModalAction-introduction.md)，复写相应的函数
- 步骤 4：配置 Action
  - 参考[3-11-Action-introduction](3-11-Action-introduction.md)，配置到相应为位置
- 步骤 5：国际化
  - 参考[3-14-I18n-introduction](3-14-I18n-introduction.md)，完成相应翻译

## 开发一个分步骤的页面级的操作

- 步骤 1：确认代码位置及目录结构
  - 按照预想的在菜单项中的位置，放置在 Containers 下
  - 以云硬盘为例，对应的菜单项为`计算-云主机-创建`，创建文件`src/pages/compute/containers/Instance/actions/StepCreate/index.jsx`
- 步骤 2：编写 Store 代码
  - 参考[3-5-BaseStore-introduction](3-5-BaseStore-introduction.md)，复写或新增相应的函数
- 步骤 3：编写 StepAction 代码
  - 参考[3-9-StepAction-introduction](3-9-StepAction-introduction.md)，复写相应的函数
- 步骤 4：配置 Action
  - 参考[3-11-Action-introduction](3-11-Action-introduction.md)，配置到相应为位置
- 步骤 5：配置路由
  - 参考[3-13-Route-introduction](3-13-Route-introduction.md)，配置对应的路由
- 步骤 6：配置菜单
  - 参考[3-12-Menu-introduction](3-12-Menu-introduction.md)
  - 配置控制台的菜单项，在`src/layouts/menu.jsx`中配置
  - 配置管理平台的菜单项，在`src/layouts/admin-menu.jsx`中配置
- 步骤 7：国际化
  - 参考[3-14-I18n-introduction](3-14-I18n-introduction.md)，完成相应翻译
