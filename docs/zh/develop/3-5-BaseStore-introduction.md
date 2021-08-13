简体中文 | [English](../../en/develop/3-5-BaseStore-introduction.md)

# 用途

- 数据请求的处理
- 支持获取全部数据
- 支持分页获取数据
- 支持对数据的各种请求处理(PUT、POST、GET、PATCH、DELETE、HEAD 等)

# BaseStore 代码文件

- `src/stores/base.js`

# BaseStore 属性与函数定义介绍

- 资源数据的 Store 继承于 BaseStore 类
- 代码位置：`src/stores/xxx/xxx.js`，如云主机对应的 store 在`src/stores/nova/instance.js`
- 只需要复写部分函数即可完成数据的请求操作
- 属性与函数分为以下四种，
  - 通常需要复写的属性与函数，主要包含：
    - 与生成 url 相关的属性与函数
  - 按需复写的函数与属性，主要包含：
    - 列表数据的再加工
    - 详情数据的再加工
    - 请求参数的处理
    - url 的处理
  - 无需复写的函数与属性，主要包含：
    - 清空数据
    - 封装数据时对项目信息的处理
  - 基类中的基础函数，主要包含：
    - 处理分页数据的`marker`
  - 更详细与全面的介绍见下

## 名词说明

- 前端分页
  - 一次性从后端获取所有列表数据
  - 前端基于获取到的数据总量、页面内配置的当前页数、每页数量来展示数据(`BaseList`组件处理)
- 后端分页
  - 以当前页号、每页数量向后端请求数据
- 前端排序
  - 使用前端分页时，按设定的排序信息对所有数据排序
  - 使用后端分页时，按设定的排序信息对当前页内的数据排序
- 后端排序
  - 以当前页号、每页数量、当前排序信息向后端请求数据
  - 不存在前端分页+后端排序这种组合方式

## 通常需要复写的属性与函数

- `module`:
  - 必须复写该函数
  - 资源对应的模块
  - 该函数用于生成请求的 url
  - 以云主机`src/stores/nova/instance.js`为例

    ```javascript
    get module() {
        return 'servers';
    }
    ```

- `apiVersion`
  - 必须复写该函数
  - 资源对应的 api 前缀
  - 因所有的请求需要由服务端转发，所以，api 的前缀需要基于`profile`内的信息生成
  - 以云主机`src/stores/nova/instance.js`为例

    ```javascript
    get apiVersion() {
      return novaBase();
    }
    ```

- `responseKey`
  - 必须复写该函数
  - 用于生成数据返回的 key，创建的 key 等
  - 以云主机`src/stores/nova/instance.js`为例

    ```javascript
    get responseKey() {
      return 'server';
    }
    ```

    ![请求](../../zh/develop/images/store/response-key.png)

## 按需复写的属性与函数

- `listDidFetch`
  - 列表数据二次加工使用的函数
  - 可请求其他 API 后，整合数据
  - 可过滤数据
  - 请求某个指定云硬盘的快照列表时，可以基于`filters`中的参数再次过滤数据
    - 以云硬盘快照`src/stores/cinder/snapshot.js`为例

      ```javascript
      async listDidFetch(items, allProjects, filters) {
        if (items.length === 0) {
          return items;
        }
        const { id } = filters;
        const data = id ? items.filter((it) => it.volume_id === id) : items;
        return data;
      }
      ```

  - 如果需要显示加密信息，需要发起额外请求后，整合数据
    - 以云硬盘类型`src/stores/cinder/volume-type.js`为例

      ```javascript
      async listDidFetch(items, allProjects, filters) {
        const { showEncryption } = filters;
        if (items.length === 0) {
          return items;
        }
        if (!showEncryption) {
          return items;
        }
        const promiseList = items.map((i) =>
          request.get(`${this.getDetailUrl({ id: i.id })}/encryption`)
        );
        const encryptionList = await Promise.all(promiseList);
        const result = items.map((i) => {
          const { id } = i;
          const encryption = encryptionList.find((e) => e.volume_type_id === id);
          return {
            ...i,
            encryption,
          };
        });
        return result;
      }
      ```

- `detailDidFetch`
  - 详情数据二次加工使用的函数
  - 可请求其他 API 后，整合数据
  - 以云硬盘快照`src/stores/cinder/snapshot.js`为例

    ```javascript
    async detailDidFetch(item) {
      const { volume_id } = item;
      const volumeUrl = `${cinderBase()}/${
        globals.user.project.id
      }/volumes/${volume_id}`;
      const { volume } = await request.get(volumeUrl);
      item.volume = volume;
      return item;
    }
    ```

- `listResponseKey`
  - 列表数据的返回 Key
  - 默认是`${this.responseKey}s`
  - 以云硬盘快照`src/stores/cinder/snapshot.js`为例

    ```javascript
    get responseKey() {
      return 'snapshot';
    }

    get listResponseKey() {
      return 'volume_snapshots';
    }
    ```

- `getListUrl`
  - 请求数据使用的 url
  - 前端分页请求列表数据(即一次性获取所有数据)时，优先使用`this.getListDetailUrl()`
  - 后端分页请求列表数据时，按优先级`this.getListPageUrl()` > `this.getListDetailUrl()` > `this.getListUrl()`
  - 默认值为

    ```javascript
    getListUrl = () => `${this.apiVersion}/${this.module}`;
    ```

  - 以 Heat 的堆栈的日志`src/stores/heat/event.js`为例

    ```javascript
    getListUrl = ({ id, name }) =>
      `${this.apiVersion}/${this.module}/${name}/${id}/events`;
    ```

- `getListDetailUrl`
  - 请求数据使用的 url
  - 前端分页请求列表数据(即一次性获取所有数据)时，优先使用`this.getListDetailUrl()`
  - 后端分页请求列表数据时，按优先级`this.getListPageUrl()` > `this.getListDetailUrl()` > `this.getListUrl()`
  - 默认值为

    ```javascript
    getListDetailUrl = () => '';
    ```

  - 以云硬盘`src/stores/cinder/volume.js`为例

    ```javascript
    getListDetailUrl = () => `${skylineBase()}/extension/volumes`;
    ```

- `getListPageUrl`
  - 后端分页数据使用的 url
  - 后端分页请求列表数据时，按优先级`this.getListPageUrl()` > `this.getListDetailUrl()` > `this.getListUrl()`
  - 默认值为

    ```javascript
    getListPageUrl = () => '';
    ```

  - 以云硬盘`src/stores/cinder/volume.js`为例

    ```javascript
    getListPageUrl = () => `${skylineBase()}/extension/volumes`;
    ```

- `getDetailUrl`
  - 详情数据对应的 url
  - 使用 rest 风格的 API，所以，该 url 也是 put, delete, patch 对应的 url
  - 默认值为

    ```javascript
    getDetailUrl = ({ id }) => `${this.getListUrl()}/${id}`;
    ```

  - 以堆栈`src/stores/heat/stack.js`为例

    ```javascript
    getDetailUrl = ({ id, name }) => `${this.getListUrl()}/${name}/${id}`;
    ```

- `needGetProject`
  - 对服务端返回的数据是否需要二次加工其中的项目信息
  - 一般 Openstack API 返回的数据只有`project_id`信息，按页面展示的需求，在管理平台需要展示项目名称
  - 默认值是`true`
  - 以元数据`src/stores/glance/metadata.js`为例

    ```javascript
    get needGetProject() {
      return false;
    }
    ```

- `mapper`
  - 对服务端返回的列表、详情数据做二次加工
  - 一般是为了更便捷的在资源列表、资源详情中展示数据使用
  - 默认值为

    ```javascript
    get mapper() {
      return (data) => data;
    }
    ```

  - 以云硬盘`src/stores/cinder/volume.js`为例

    ```javascript
    get mapper() {
      return (volume) => ({
        ...volume,
        disk_tag: isOsDisk(volume) ? 'os_disk' : 'data_disk',
        description: volume.description || (volume.origin_data || {}).description,
      });
    }
    ```

- `mapperBeforeFetchProject`
  - 在处理项目信息前，对服务端返回的列表、详情数据做二次加工
  - 一般是为了处理返回数据中的项目信息使用
  - 默认值为

    ```javascript
    get mapperBeforeFetchProject() {
      return (data) => data;
    }
    ```

  - 以镜像`src/stores/glance/image.js`为例

    ```javascript
    get mapperBeforeFetchProject() {
      return (data, filters, isDetail) => {
        if (isDetail) {
          return {
            ...data,
            project_id: data.owner,
          };
        }
        return {
          ...data,
          project_id: data.owner,
          project_name: data.owner_project_name || data.project_name,
        };
      };
    }
    ```

- `paramsFunc`
  - 前端分页请求(即`fetchList`)时，对请求参数的更新
  - 默认是对从资源列表代码(`pages/xxxx/xxx/index.jsx`)使用`fetchList`时，参数的过滤
  - 默认值

    ```javascript
    get paramsFunc() {
      if (this.filterByApi) {
        return (params) => params;
      }
      return (params) => {
        const reservedKeys = [
          'all_data',
          'all_projects',
          'device_id',
          'network_id',
          'floating_network_id',
          'start_at_gt',
          'start_at_lt',
          'binary',
          'fixed_ip_address',
          'device_owner',
          'project_id',
          'type',
          'sort',
          'security_group_id',
          'id',
          'security_group_id',
          'owner_id',
          'status',
          'fingerprint',
          'resource_types',
          'floating_ip_address',
          'uuid',
          'loadbalancer_id',
          'ikepolicy_id',
          'ipsecpolicy_id',
          'endpoint_id',
          'peer_ep_group_id',
          'local_ep_group_id',
          'vpnservice_id',
        ];
        const newParams = {};
        Object.keys(params).forEach((key) => {
          if (reservedKeys.indexOf(key) >= 0) {
            newParams[key] = params[key];
          }
        });
        return newParams;
      };
    }
    ```

  - 以云硬盘`src/stores/cinder/volume.js`为例

    ```javascript
    get paramsFunc() {
      return (params) => {
        const { serverId, ...rest } = params;
        return rest;
      };
    }
    ```

- `paramsFuncPage`
  - 后端分页请求(即`fetchListByPage`)时，对请求参数的更新
  - 默认是对从资源列表代码(`pages/xxxx/xxx/index.jsx`)使用`fetchListByPage`时，参数的过滤
  - 默认值

    ```javascript
    get paramsFuncPage() {
      return (params) => {
        const { current, ...rest } = params;
        return rest;
      };
    }
    ```

  - 以云硬盘类型`src/stores/cinder/volume-type.js`为例

    ```javascript
    get paramsFuncPage() {
      return (params) => {
        const { current, showEncryption, ...rest } = params;
        return rest;
      };
    }
    ```

- `fetchListByLimit`
  - 前端分页请求所有数据时，是否要基于`limit`发起多个请求，最终实现所有数据的获取
  - Openstack API 默认返回的是 1000 个数据，对于某些资源数据很多的情况，需要使用该配置以便获取到所有数据
  - 默认值是`false`
  - 以镜像`src/stores/glance/image.js`为例

    ```javascript
    get fetchListByLimit() {
      return true;
    }
    ```

- `markerKey`
  - 后端分页请求数据时，marker 的来源
  - 因为对 Openstack 的请求是由后端转发的，所以并没有直接使用列表数据返回的 Openstack 拼接好的下一页数据应该使用的 Url，而是根据返回的数据，解析出`marker`
  - 默认值是`id`
  - 通常不需要复写
  - 以密钥`src/stores/nova/keypair.js`为例

    ```javascript
    get markerKey() {
      return 'keypair.name';
    }
    ```

- `requestListByMarker`
  - 后端分页时，使用`marker`请求分页下的数据
  - 通常不需要复写
  - 默认值是

    ```javascript
    async requestListByMarker(url, params, limit, marker) {
      const newParams = {
        ...params,
        limit,
      };
      if (marker) {
        newParams.marker = marker;
      }
      return request.get(url, newParams);
    }
    ```

  - 以云主机组`src/stores/nova/server-group.js`为例

    ```javascript
    async requestListByMarker(url, params, limit, marker) {
      const newParams = {
        ...params,
        limit,
      };
      if (marker) {
        newParams.offset = marker;
      }
      return request.get(url, newParams);
    }
    ```

- `requestListAllByLimit`
  - 当`this.fetchListByLimit=true`时，前端分页使用该方法获取所有数据
  - 通常不需要复写
- `updateUrl`
  - 更新列表数据请求的 url
  - 不常用
- `updateParamsSortPage`
  - 使用后端排序时，对排序参数的处理
  - 使用后端排序时，会在资源列表代码`pages/xxx/XXX/index.jsx`中自动生成相应的请求参数，store 对这些参数往往需要再次整理，否则会不符合 API 的参数要求
  - 以云硬盘`src/stores/cinder/volume.js`为例

    ```javascript
    updateParamsSortPage = (params, sortKey, sortOrder) => {
      if (sortKey && sortOrder) {
        params.sort_keys = sortKey;
        params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
      }
    };
    ```

- `listFilterByProject`
  - 列表数据是否需要基于项目信息过滤
  - `admin`权限下的部分 Openstack 资源(如`neutron`)，会默认返回所有项目的数据，所以在控制台展示资源时，会根据该配置过滤数据
  - 默认值是`false`
  - 以 VPN`src/stores/neutron/vpn-service.js`为例

    ```javascript
    get listFilterByProject() {
      return true;
    }
    ```

- `fetchList`
  - `pages`下的列表页通常使用`this.store.fetchList`来获取前端分页数据
  - 不建议复写该函数，如果需要再加工数据，建议使用`listDidFetch`
  - 该函数会更新`this.list`属性中的相关数据，`pages`下的资源列表组件也是基于`this.list`进行数据展示
- `fetchListByPage`
  - `pages`下的列表页通常使用`this.store.fetchList`来获取后端分页数据
  - 不建议复写该函数，如果需要再加工数据，建议使用`listDidFetch`
  - 该函数会更新`this.list`属性中的相关数据，`pages`下的资源列表组件也是基于`this.list`进行数据展示
- `getCountForPage`
  - 获取列表数据的总量
  - 通常在后端分页时可复写
- `getDetailParams`
  - 更新详情数据请求时的参数
  - 默认值为

    ```javascript
    getDetailParams = () => undefined;
    ```

- `fetchDetail`
  - `pages`下的详情页通常使用`this.store.fetchDetail`来获取详情数据
  - 通常不需要复写
  - 数据再加工通常是重写`mapper`或`detailDidFetch`
- `create`
  - 创建资源
  - 使用`POST`api
  - 通常不需要复写
  - 使用`this.submitting`保证在发送请求时页面处于`loading`状态
- `edit`
  - 更新资源
  - 使用`PUT`api
  - 通常不需要复写
  - 使用`this.submitting`保证在发送请求时页面处于`loading`状态
- `patch`
  - 更新资源
  - 使用`PATCH`api
  - 通常不需要复写
  - 使用`this.submitting`保证在发送请求时页面处于`loading`状态
- `delete`
  - 删除资源
  - 使用`DELETE`api
  - 通常不需要复写
  - 使用`this.submitting`保证在发送请求时页面处于`loading`状态

## 不需要复写的属性与函数

- `submitting`
  - 用于数据创建、数据更新时
  - 依据请求的响应变更`this.isSubmitting`，对应的 Form，列表页等会展示 Loading 状态
- `currentProject`
  - 当前用户登录的项目 ID
- `itemInCurrentProject`
  - 数据是否属于当前用户登录的项目
- `listDidFetchProject`
  - 对列表数据添加项目信息
- `requestListAll`
  - 前端分页获取所有数据
- `requestListByPage`
  - 后端分页所有当前页的数据
- `pureFetchList`
  - 列表数据的请求函数
  - 返回原始数据，不会对 API 的返回数据做加工
- `parseMarker`
  - 使用后端分页时，从返回数据中解析出`marker`，用于请求上一页、下一页数据时使用
- `updateMarker`
  - 更新`list`的`markers`
  - `list.markers`是个数组，每个元素对应于`下标+1`页的`marker`
- `getMarker`
  - 获取指定页对应的`marker`
- `getListDataFromResult`
  - 从 API 的返回值中取出列表数据
  - 利用`this.listResponseKey`获取
- `setSelectRowKeys`
  - 对`pages`下的资源列表组件列表中数据项的选中记录
- `clearData`
  - 清空`list`数据

## 基类中的基础函数

- 建议查看代码理解，`src/stores/base.js`
