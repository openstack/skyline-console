简体中文 | [English](../../en/develop/3-10-FormItem-introduction.md)

# 用途

- 表单中每个表单项的配置
- 一般只需要配置`type`等少量参数即可使用
- `Form`组件会基于每个`formItem`的配置对输入的数值进行相应的验证
- `Form`验证不通过将无法点击`确认`或`下一步`按钮

# 如何使用

- 每个表单项包含通用型配置
  - `name`，表单项的`key`值，必须项，且唯一，表单项的值在验证通过后保存在`form.values[name]`中
  - `label`，表单项左侧的标签
  - `required`, 可选项，默认值为`false`，值为`true`时为必填项
  - `hidden`, 当前表单项是否可隐藏，默认值为`false`
  - `onChange`，当前表单项变更时触发的函数
  - `extra`，表单想下方的说明文字
    - 以创建网络`src/pages/network/containers/Network/actions/CreateNetwork.jsx`为例

      ```javascript
      {
        name: 'mtu',
        label: t('MTU'),
        type: 'input-number',
        min: 68,
        max: 9000,
        extra: t('Minimum value is 68 for IPv4, and 1280 for IPv6.'),
      }
      ```

      ![extra](../../zh/develop/images/form/form-extra.png)

  - `tip`，表单项左侧标签旁边的问号悬停时显示的内容
    - 以创建云主机`src/pages/compute/containers/Instance/actions/StepCreate/BaseStep/index.jsx`为例

      ```javascript
      {
        name: 'availableZone',
        label: t('Available Zone'),
        type: 'select',
        placeholder: t('Please select'),
        isWrappedValue: true,
        required: true,
        options: this.availableZones,
        tip: t(
          'Availability zone refers to a physical area where power and network are independent of each other in the same area. In the same region, the availability zone and the availability zone can communicate with each other in the intranet, and the available zones can achieve fault isolation.'
        ),
      }
      ```

      ![tip](../../zh/develop/images/form/form-tip.png)

  - `validator`，验证表单的数值是否符合要求
    - 返回`Promise`
    - 以裸机节点创建端口`src/pages/compute/containers/BareMetalNode/Detail/Port/actions/Create.jsx`为例

      ```javascript
      export const macAddressValidate = (rule, value) => {
        if (isMacAddress(value.toUpperCase())) {
          return Promise.resolve(true);
        }
        return Promise.reject(new Error(`${t('Invalid: ')}${macAddressMessage}`));
      };
      {
        name: 'address',
        label: t('MAC Address'),
        required: true,
        type: 'input',
        validator: macAddressValidate,
      }
      ```

  - `component`，直接使用`component`中的组件，而不是使用`type`配置的组件
    - 以云主机修改配置`src/pages/compute/containers/Instance/actions/Resize.jsx`为例
      - 直接展示云主机类型选择组件

      ```javascript
      {
        name: 'newFlavor',
        label: t('Flavor'),
        component: (
          <FlavorSelectTable flavor={flavor} onChange={this.onFlavorChange} />
        ),
        required: true,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
      }
      ```

  - `labelCol`，调整表单项标题的布局，默认使用`Form`下定义的标签布局
    - 以项目管理配额`src/pages/identity/containers/Project/actions/QuotaManager.jsx`为例

      ```javascript
      {
        name: 'instances',
        label: t('instance'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      }
      ```

      ![labelCol](../../zh/develop/images/form/label-col.png)

  - `wrapperCol`，调整表单项右侧的布局，默认使用`Form`下定义的布局
    - 以云主机修改配置`src/pages/compute/containers/Instance/actions/Resize.jsx`为例
      - 直接展示云主机类型选择组件

      ```javascript
      {
        name: 'newFlavor',
        label: t('Flavor'),
        component: (
          <FlavorSelectTable flavor={flavor} onChange={this.onFlavorChange} />
        ),
        required: true,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
      }
      ```

      ![wrapperCol](../../zh/develop/images/form/wrapper-col.png)

  - `style`，定义表单项的样式
    - 以创建虚拟网卡`src/pages/network/containers/VirtualAdapter/actions/Create.jsx`为例

      ```javascript
      {
        name: 'ipv6',
        label: 'IPv6',
        type: 'label',
        style: { marginBottom: 24 },
        content: (
          <span>
            {t('The selected VPC/subnet does not have IPv6 enabled.')}{' '}
            <Button type="link">
              {t('To open')} <FormOutlined />
            </Button>{' '}
          </span>
        ),
        hidden: true,
      }
      ```

  - `dependencies`，依赖项，数组，依赖项的数值变动后，会触发当前表单项的验证
    - 以云主机更新密码`src/pages/compute/containers/Instance/actions/ChangePassword.jsx`为例
      - 确认密码的验证，要依赖于密码的输入

      ```javascript
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        dependencies: ['password'],
        required: true,
        otherRule: getPasswordOtherRule('confirmPassword', 'instance'),
      },
      ```

  - `otherRule`，额外的验证规则

- 每个表单根据自己的`type`有独属于自身的配置项，目前支持的`type`有
  - `label`
    - 展示内容使用
    - `iconType`属性，可以显示资源对应的 icon

      ```javascript
      const iconTypeMap = {
        instance: <DesktopOutlined />,
        router: <BorderOuterOutlined />,
        externalNetwork: <GlobalOutlined />,
        network: <GlobalOutlined />,
        firewall: <SecurityScanOutlined />,
        volume: <InboxOutlined />,
        gateway: <GatewayOutlined />,
        user: <UserOutlined />,
        snapshot: <CameraOutlined />,
        backup: <SaveOutlined />,
        keypair: <KeyOutlined />,
        image: ImageIcon,
        aggregate: <ClusterOutlined />,
        metadata: <TagOutlined />,
        flavor: <HddOutlined />,
        host: <CloudServerOutlined />,
      };
      ```

      - 以云主机挂载云硬盘`src/pages/compute/containers/Instance/actions/AttachVolume.jsx`为例

        ```javascript
        {
          name: 'instance',
          label: t('Instance'),
          type: 'label',
          iconType: 'instance',
        },
        ```

        ![label](../../zh/develop/images/form/form-label.png)

    - `content`属性，默认是基于`name`属性展示内容，如果具有`content`属性，则依照`content`展示内容
      - `content`可以是字符串，也可以是 ReactNode
      - 以虚拟网卡修改 QoS`src/pages/network/containers/VirtualAdapter/actions/ModifyQoS.jsx`为例

        ```javascript
        {
          name: 'name',
          label: t('Current QoS policy name'),
          type: 'label',
          content: <div>{qosPolicy.name || t('Not yet bound')}</div>,
          hidden: !enableQosPolicy,
        }
        ```

  - `input`
    - 输入框
    - 以编辑镜像`src/pages/compute/containers/Image/actions/Edit.jsx`为例
      - 输入系统版本

      ```javascript
      {
        name: 'os_version',
        label: t('OS Version'),
        type: 'input',
        required: true,
      },
      ```

      ![input](../../zh/develop/images/form/input.png)

  - `select`
    - 选择
    - `options`，必须项，`option`数组，每个`option`需要具有如下属性
      - `value`，值
      - `label`，展示的文本
    - 以创建云主机选择可用域`src/pages/compute/containers/Instance/actions/StepCreate/BaseStep/index.jsx`为例

      ```javascript
      get availableZones() {
        return (globalAvailabilityZoneStore.list.data || [])
          .filter((it) => it.zoneState.available)
          .map((it) => ({
            value: it.zoneName,
            label: it.zoneName,
          }));
      }

      {
        name: 'availableZone',
        label: t('Available Zone'),
        type: 'select',
        placeholder: t('Please select'),
        isWrappedValue: true,
        required: true,
        options: this.availableZones,
        tip: t(
          'Availability zone refers to a physical area where power and network are independent of each other in the same area. In the same region, the availability zone and the availability zone can communicate with each other in the intranet, and the available zones can achieve fault isolation.'
        ),
      },
      ```

      ![select](../../zh/develop/images/form/select.png)

    - `isWrappedValue`，表示表单项的值中是否要包含`option`信息
      - 默认值为`false`，值为选中的`option`中的`value`
      - 如果设为`true`，值为选中的`option`
  - `divider`
    - 横线分隔符
    - 以创建云主机`src/pages/compute/containers/Instance/actions/StepCreate/BaseStep/index.jsx`为例

      ```javascript
      {
        type: 'divider',
      }
      ```

      ![divider](../../zh/develop/images/form/form-divider.png)

  - `radio`
    - 单选
    - `options`，必须项，`option`数组，每个`option`需要具有如下属性
      - `value`，值
      - `label`，展示的文本
    - 以创建云主机选择登陆凭证类型`src/pages/compute/containers/Instance/actions/StepCreate/SystemStep/index.jsx`为例

      ```javascript
      get loginTypes() {
        return [
          {
            label: t('Keypair'),
            value: 'keypair',
            disabled: this.isWindowsImage,
          },
          {
            label: t('Password'),
            value: 'password',
          },
        ];
      }

      {
        name: 'loginType',
        label: t('Login Type'),
        type: 'radio',
        options: this.loginTypes,
        isWrappedValue: true,
      },
      ```

      ![radio](../../zh/develop/images/form/radio.png)

    - `isWrappedValue`，表示表单项的值中是否要包含`option`信息
      - 默认值为`false`，值为选中的`option`中的`value`
      - 如果设为`true`，值为选中的`option`
  - `select-table`
    - 带有选择操作的表格
    - `isMulti`，是否是多选，默认为`false`
    - `data`，数据源，使用前端分页时使用
    - `columns`，表格列的配置，配置方式同`BaseList`
    - `filterParams`，搜索项的配置
    - `pageSize`，每页条目数量，默认为 5
    - `disabledFunc`，判定哪些条目不可选
    - `selectedLabel`，表格底部的标签，默认为`已选`
    - `header`，表格上方的内容
    - `backendPageStore`，使用后端分页时，数据对应的`store`
    - `backendPageFunc`，使用后端分页时，获取数据的方法，默认为`fetchListByPage`
    - `backendPageDataKey`，使用后端分页时，数据在`store`中的位置，默认为`list`
    - `extraParams`，使用后端分页时，发起请求时的额外参数
    - `isSortByBack`，是否使用后端排序，默认为`false`
    - `defaultSortKey`，使用后端排序时，默认的排序键
    - `defaultSortOrder`，使用后端排序时，默认的排序方向
    - `initValue`，初始值
    - `rowKey`，数据的唯一标识，默认为`id`
    - `onRow`，点击条目时的操作，默认点击条目就会选中该条目
    - `tabs`，tab 型的表格
    - `defaultTabValue`，tab 型表格时，默认的 tab
    - `onTabChange`，tab 型表格时，tab 切换时，调用的函数
    - 以创建云主机选择安全组`src/pages/compute/containers/Instance/actions/StepCreate/NetworkStep/index.jsx`为例
      - 这个表格的右侧标题有 tip 提示
      - 使用后端分页的方式展示数据，并具有额外的参数
      - 是多选
      - 这个表格的上方有额外的展示内容
      - 需要复写`onRow`属性，以免点击表格中的`查看规则`按钮时产生操作冲突

      ```javascript
      {
        name: 'securityGroup',
        label: t('Security Group'),
        type: 'select-table',
        tip: t(
          'Each instance belongs to at least one security group, which needs to be specified when it is created. Instances in the same security group can communicate with each other on the network, and instances in different security groups are disconnected from the internal network by default.'
        ),
        backendPageStore: this.securityGroupStore,
        extraParams: { project_id: this.currentProjectId },
        required: true,
        isMulti: true,
        header: (
          <div style={{ marginBottom: 8 }}>
            {t(
              'The security group is similar to the firewall function and is used to set up network access control. '
            )}
            {t(' You can go to the console to ')}
            <Link to="/network/security-group">
              {t('create a new security group')}&gt;{' '}
            </Link>
            {t(
              'Note: The security group you use will act on all virtual adapters of the instance.'
            )}
          </div>
        ),
        filterParams: securityGroupFilter,
        columns: securityGroupColumns,
        onRow: () => {},
      },
      ```

      ![select-table](../../zh/develop/images/form/select-table.png)

    - 以创建云硬盘选择镜像`src/pages/storage/containers/Volume/actions/Create/index.jsx`为例
      - 这是带有 Tab 标签的表格，默认展示第一个 tab，tab 切换时会更新数据源
      - 数据使用前端分页的方式获取，直接配置`data`即可
      - 是单选
      - 配置了已选标签为`已选 镜像`

      ```javascript
      {
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        data: this.images,
        required: sourceTypesIsImage,
        isMulti: false,
        hidden: !sourceTypesIsImage,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getImageColumns(this),
        tabs: this.systemTabs,
        defaultTabValue: this.systemTabs[0].value,
        selectedLabel: t('Image'),
        onTabChange: this.onImageTabChange,
      }
      ```

      ![select-table-tabs](../../zh/develop/images/form/select-table-tabs.png)

  - `input-number`
    - 数字输入框
    - `min`，最小值
    - `max`，最大值
    - 以创建网络设置 MTU`src/pages/network/containers/Network/actions/CreateNetwork.jsx`为例
      - 设置了最小、最大值

      ```javascript
      {
        name: 'mtu',
        label: t('MTU'),
        type: 'input-number',
        min: 68,
        max: 9000,
        extra: t('Minimum value is 68 for IPv4, and 1280 for IPv6.'),
      },
      ```

      ![input-number](../../zh/develop/images/form/input-number.png)

  - `input-int`
    - 整数输入框
    - `min`，最小值
    - `max`，最大值
    - 以创建镜像设置最小系统盘`src/pages/compute/containers/Image/actions/Create.jsx`为例
      - 设置了最小、最大值

      ```javascript
      {
        name: 'min_disk',
        label: t('Min System Disk(GB)'),
        type: 'input-int',
        min: 0,
        max: 500,
      }
      ```

      ![input-int](../../zh/develop/images/form/input-int.png)

  - `instance-volume`
    - 云主机硬盘配置组件
    - `options`，云硬盘类型的选项
    - `minSize`，云硬盘大小输入框的最小值
    - 以创建云主机配置系统盘`src/pages/compute/containers/Instance/actions/StepCreate/BaseStep/index.jsx`为例

      ```javascript
      {
        name: 'systemDisk',
        label: t('System Disk'),
        type: 'instance-volume',
        options: this.volumeTypes,
        required: !this.sourceTypeIsVolume,
        hidden: this.sourceTypeIsVolume,
        validator: this.checkSystemDisk,
        minSize: this.getSystemDiskMinSize(),
        extra: t('Disk size is limited by the min disk of flavor, image, etc.'),
        onChange: this.onSystemDiskChange,
      }
      ```

      ![instance-volume](../../zh/develop/images/form/instance-volume.png)

  - `input-password`
    - 密码输入框
    - 以创建云主机输入密码`src/pages/compute/containers/Instance/actions/StepCreate/SystemStep/index.jsx`为例
      - 输入密码，确认密码，并要验证密码格式，以及两次输入数据的一致性

      ```javascript
      {
        name: 'password',
        label: t('Login Password'),
        type: 'input-password',
        required: isPassword,
        hidden: !isPassword,
        otherRule: getPasswordOtherRule('password', 'instance'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: isPassword,
        hidden: !isPassword,
        otherRule: getPasswordOtherRule('confirmPassword', 'instance'),
      },
      ```

      ![input-password](../../zh/develop/images/form/input-password.png)

  - `input-name`
    - 带有格式验证的名称输入框
    - `placeholder`，输入框的提示语
    - `isFile`，以文件格式验证名称
    - `isKeypair`，以密钥支持的格式验证名称
    - `isStack`，以堆栈支持的格式验证名称
    - `isImage`，以镜像支持的格式验证名称
    - `isInstance`，以云主机支持的格式验证名称
    - 以创建云主机输入名称`src/pages/compute/containers/Instance/actions/StepCreate/SystemStep/index.jsx`为例

      ```javascript
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
        isInstance: true,
      }
      ```

      ![input-name](../../zh/develop/images/form/input-name.png)

  - `port-range`
    - 带有验证的 port 输入框
    - 以安全组创建规则设置源端口/端口范围`src/pages/network/containers/SecurityGroup/Detail/Rule/actions/Create.jsx`为例

      ```javascript
      {
        name: 'sourcePort',
        label: t('Source Port/Port Range'),
        type: 'port-range',
        required: showSourcePort,
        hidden: !showSourcePort,
      }
      ```

      ![port-range](../../zh/develop/images/form/port-range.png)

  - `more`
    - 隐藏/展示更多配置项按钮
    - 以创建云主机系统配置`src/pages/compute/containers/Instance/actions/StepCreate/SystemStep/index.jsx`为例

      ```javascript
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      }
      ```

      ![more](../../zh/develop/images/form/more.png)

  - `textarea`
    - 多行文本输入框
    - 以编辑云硬盘设置描述`src/pages/storage/containers/Volume/actions/Edit.jsx`为例

      ```javascript
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      }
      ```

      ![textarea](../../zh/develop/images/form/textarea.png)

  - `upload`
    - 上传文件输入框
    - 以创建镜像上传镜像文件`src/pages/compute/containers/Image/actions/Create.jsx`为例

      ```javascript
      {
        name: 'file',
        label: t('File'),
        type: 'upload',
        required: true,
      }
      ```

      ![upload](../../zh/develop/images/form/upload.png)

  - `add-select`
    - 可以添加、删除条目的表单项
    - `minCount`，最小数量
    - `maxCount`，最多数量
    - `itemComponent`，增加的每个条目使用的组件
    - `defaultItemValue`，新增条目的默认值
    - `addText`，添加条目按钮右侧的文字
    - `addTextTips`，如果`maxCount`存在，随着条目数量的变更，显示的文字
    - 以创建云主机设置数据盘`src/pages/compute/containers/Instance/actions/StepCreate/BaseStep/index.jsx`为例
      - 可以设置任意个数的数据盘

      ```javascript
      {
        name: 'dataDisk',
        label: t('Data Disk'),
        type: 'add-select',
        options: this.volumeTypes,
        defaultItemValue: this.defaultVolumeType,
        itemComponent: InstanceVolume,
        minCount: 0,
        addTextTips: t('Data Disks'),
        addText: t('Add Data Disks'),
        extra: t(
          'Too many disks mounted on the instance will affect the read and write performance. It is recommended not to exceed 16 disks.'
        ),
        onChange: this.onDataDiskChange,
      },
      ```

      ![add-select](../../zh/develop/images/form/add-select.png)

  - `ip-input`
    - 带有验证功能的 IP 输入框
    - `version`，ip 类型，默认是`4`，还可设置为`6`
    - 以云主机挂载网卡手动指定 IP`src/pages/compute/containers/Instance/actions/AttachInterface.jsx`为例

      ```javascript
      {
        name: 'ip',
        label: t('Given IP'),
        type: 'ip-input',
        required: ipType === 1,
        hidden: ipType !== 1,
        version,
        // defaultIp,
        validator: this.checkIP,
        extra: t('Please make sure this IP address be available.'),
      }
      ```

      ![ip-input](../../zh/develop/images/form/ip-input.png)

  - `member-allocator`
    - 负载均衡器中使用的成员选择表单
    - 以负载均衡器配置成员`src/pages/network/containers/LoadBalancers/StepCreateComponents/MemberStep/index.jsx`为例

      ```javascript
      {
        name: 'extMembers',
        type: 'member-allocator',
        isLoading: this.store.list.isLoading,
        ports: this.state.ports,
      }
      ```

      ![member-allocator](../../zh/develop/images/form/member-allocator.png)

  - `descriptions`
    - 展示多种信息的表单项
    - `title`，右侧内容的标题
    - `onClick`，右侧内容标题旁的跳转按钮
    - `items`，每个信息展示项的配置，数组
      - `label`，信息展示项左侧的标题文字
      - `value`，信息展示项右侧的值
      - `span`，信息展示右侧占用的布局尺寸
    - 以创建云主机确认`src/pages/compute/containers/Instance/actions/StepCreate/ConfirmStep/index.jsx`为例

      ```javascript
      {
        name: 'confirm-config',
        label: t('Config Overview'),
        type: 'descriptions',
        title: t('Base Config'),
        onClick: () => {
          this.goStep(0);
        },
        items: [
          {
            label: t('Start Source'),
            value: context.source.label,
          },
          {
            label: t('System Disk'),
            value: this.getSystemDisk(),
          },
          {
            label: t('Available Zone'),
            value: context.availableZone.label,
          },
          {
            label: t('Start Source Name'),
            value: this.getSourceValue(),
          },
          {
            label: t('Data Disk'),
            value: this.getDataDisk(),
          },
          {
            label: t('Project'),
            value: context.project,
          },
          {
            label: t('Flavor'),
            value: this.getFlavor(),
          },
        ],
      }
      ```

      ![descriptions](../../zh/develop/images/form/descriptions.png)

  - `slider-input`
    - 滑动与输入联动的表单项
    - `min`，最小值
    - `max`，最大值
    - `description`，滑动条下的描述语
    - 以创建云硬盘设置容量`src/pages/storage/containers/Volume/actions/Create/index.jsx`为例

      ```javascript
      {
        name: 'size',
        label: t('Capacity (GB)'),
        type: 'slider-input',
        max: this.maxSize,
        min: minSize,
        description: `${minSize}GB-${this.maxSize}GB`,
        required: this.quotaIsLimit,
        hidden: !this.quotaIsLimit,
        onChange: this.onChangeSize,
      },
      ```

      ![slider-input](../../zh/develop/images/form/slider-input.png)

  - `title`
    - 展示标题
    - 以创建堆栈配置参数`src/pages/heat/containers/Stack/actions/Create/Parameter.jsx`为例

      ```javascript
      {
        label: t('Fill In The Parameters'),
        type: 'title',
      }
      ```

      ![title](../../zh/develop/images/form/title.png)

  - `switch`
    - 开关
    - 以创建虚拟网卡设置安全组`src/pages/network/containers/VirtualAdapter/actions/Create.jsx`为例

      ```javascript
      {
        name: 'port_security_enabled',
        label: t('Port Security'),
        type: 'switch',
        tip: t(
          'Disabling port security will turn off the security group policy protection and anti-spoofing protection on the port. General applicable scenarios: NFV or operation and maintenance Debug.'
        ),
        onChange: (e) => {
          this.setState({
            port_security_enabled: e,
          });
        },
      }
      ```

      ![switch](../../zh/develop/images/form/switch.png)

  - `check`
    - checkbox
    - `content`，输入框右侧的文字
    - 以云主机修改配置是否强制关机`src/pages/compute/containers/Instance/actions/Resize.jsx`为例

      ```javascript
      {
        name: 'option',
        label: t('Forced Shutdown'),
        type: 'check',
        content: t('Agree to force shutdown'),
        required: true,
      },
      ```

      ![check](../../zh/develop/images/form/check.png)

  - `transfer`
    - 穿梭框
    - `leftTableColumns`，左侧表格的列配置
    - `rightTableColumns`，右侧表格的列配置
    - `dataSource`，可供选择的数据源
    - `showSearch`，是否显示搜索输入框
    - `oriTargetKeys`，初始化的选中值
    - `disabled`，是否禁用左侧数据的选中，默认为`false`
    - 以用户编辑系统角色`src/pages/identity/containers/User/actions/SystemRole.jsx`为例
      - 左侧是项目名称列表
      - 右侧是项目名称、对项目配置的角色信息列表

      ```javascript
      {
        name: 'select_project',
        type: 'transfer',
        label: t('Project'),
        leftTableColumns: this.leftUserTable,
        rightTableColumns: this.rightUserTable,
        dataSource: this.projectList
          ? this.projectList.filter((it) => it.domain_id === domainDefault)
          : [],
        disabled: false,
        showSearch: true,
        oriTargetKeys: projectRoles ? Object.keys(projectRoles) : [],
      }
      ```

      ![transfer](../../zh/develop/images/form/transfer.png)

  - `check-group`
    - checkbox 组
    - `options`，配置每个`checkbox`的信息
      - `label`，每个`checkbox`对应的文字
      - `value`，`checkbox`对应的键
    - 以编辑元数据`src/pages/configuration/containers/Metadata/actions/Edit.jsx`为例
      - 配置 公有、受保护的 属性

      ```javascript
      {
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [
          { label: t('Public'), value: 'isPublic' },
          { label: t('Protected'), value: 'isProtected' },
        ],
      }
      ```

      ![check-group](../../zh/develop/images/form/check-group.png)

  - `textarea-from-file`
    - 带有读取文件功能的多行文本输入框
    - 选择文件后，会将文件的内容读取到文本输入框中
    - 以创建密钥输入公钥信息`src/pages/compute/containers/Keypair/actions/Create.jsx`为例

      ```javascript
      {
        name: 'public_key',
        label: t('Public Key'),
        type: 'textarea-from-file',
        hidden: isCreate,
        required: !isCreate,
      }
      ```

      ![textarea-from-file](../../zh/develop/images/form/textarea-from-file.png)

  - `ip-distributer`
    - IP 输入框
    - `subnets`，选择子网后配置 IP 信息
    - 可以自动分配 IP，也可手动指定 IP
    - 可以添加多个 IP
    - 以创建虚拟网卡设置 IP`src/pages/network/containers/VirtualAdapter/actions/Create.jsx`为例

      ```javascript
      {
        name: 'fixed_ips',
        label: t('Owned Subnet'),
        type: 'ip-distributer',
        subnets: subnetDetails,
        hidden: !network_id,
        required: true,
      }
      ```

      ![ip-distributer](../../zh/develop/images/form/ip-distributer.png)

  - `mac-address`
    - mac 地址输入框
    - 支持自动分配，也可手动指定
    - 以编辑虚拟网卡设置 MAC 地址`src/pages/network/containers/VirtualAdapter/actions/Edit.jsx`为例

      ```javascript
      {
        name: 'mac_address',
        label: t('Mac Address'),
        wrapperCol: { span: 16 },
        type: 'mac-address',
        required: true,
      }
      ```

      ![mac-address](../../zh/develop/images/form/mac-address.png)

  - `network-select-table`
    - 选择网络的表单项
    - 分 Tab 展示当前项目网络、共享网络，如果用户具有管理员角色，还可展示全部网络
    - 以创建虚拟网卡设置网络`src/pages/network/containers/VirtualAdapter/actions/Create.jsx`为例

      ```javascript
      {
        name: 'network_id',
        label: t('Owned Network'),
        type: 'network-select-table',
        onChange: this.handleOwnedNetworkChange,
        required: true,
      },
      ```

      ![network-select-table](../../zh/develop/images/form/network-select-table.png)

  - `volume-select-table`
    - 选择硬盘的表单项
    - 分 Tab 展示可用的、共享的云硬盘
    - `disabledFunc`，配置什么样的云硬盘不可选
    - 以云主机挂载硬盘选择硬盘`src/pages/compute/containers/Instance/actions/AttachVolume.jsx`为例

      ```javascript
      {
        name: 'volume',
        label: t('Volume'),
        type: 'volume-select-table',
        tip: multiTip,
        isMulti: false,
        required: true,
        serverId: this.item.id,
        disabledFunc: (record) => {
          const diskFormat = _get(
            record,
            'origin_data.volume_image_metadata.disk_format'
          );
          return diskFormat === 'iso';
        },
      }
      ```

      ![volume-select-table](../../zh/develop/images/form/volume-select-table.png)

  - `tab-select-table`
    - 带有 Tab 的表格型选择表单项
    - `isMulti`，配置是否为多选
    - 以申请浮动 IP 选择 Qos`src/pages/network/containers/FloatingIp/actions/Allocate.jsx`为例
      - 分当前项目、共享的 QoS，如果用户具有管理员权限，也具有所有 QoS 标签项

      ```javascript
      {
        name: 'qos_policy_id',
        label: t('QoS Policy'),
        type: 'tab-select-table',
        tabs: getQoSPolicyTabs.call(this),
        isMulti: false,
        tip: t('Choosing a QoS policy can limit bandwidth and DSCP'),
        onChange: this.onQosChange,
      }
      ```

      ![tab-select-table](../../zh/develop/images/form/tab-select-table.png)

  - `metadata-transfer`
    - 编辑元数据的表单项
    - 以镜像编辑元数据`src/pages/compute/containers/Image/actions/ManageMetadata.jsx`为例

      ```javascript
      {
        name: 'systems',
        label: t('Metadata'),
        type: 'metadata-transfer',
        metadata: this.metadata,
        validator: (rule, value) => {
          if (this.hasNoValue(value)) {
            return Promise.reject(t('Please input value'));
          }
          return Promise.resolve();
        },
      }
      ```

      ![metadata-transfer](../../zh/develop/images/form/metadata-transfer.png)

  - `aceEditor`
    - aceEditor
    - 以创建虚拟网卡编辑 Profile`src/pages/network/containers/VirtualAdapter/actions/Create.jsx`为例

      ```javascript
      {
        name: 'bindingProfile',
        label: t('Binding Profile'),
        type: 'aceEditor',
        hidden: !more,
        mode: 'json',
        wrapEnabled: true,
        tabSize: 2,
        width: '100%',
        height: '200px',
        setOptions: {
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        },
        validator: (item, value) => {
          if (value !== undefined && value !== '') {
            try {
              JSON.parse(value);
              return Promise.resolve(true);
            } catch (e) {
              return Promise.reject(new Error(t('Illegal JSON scheme')));
            }
          }
          return Promise.resolve(true);
        },
      }
      ```

      ![aceEditor](../../zh/develop/images/form/ace-editor.png)

  - `input-json`
    - 带有 json 格式验证的输入框
    - 以创建堆栈编辑参数为例`src/resources/stack.js`为例

      ```javascript
      export const getFormItemType = (type) => {
        switch (type) {
          case 'number':
            return {
              type: 'input-number',
            };
          case 'json':
            return {
              type: 'input-json',
            };
          case 'boolean':
            return {
              type: 'radio',
              options: yesNoOptions,
            };
          default:
            return {
              type: 'input',
            };
        }
      };
      ```

      ![input-json](../../zh/develop/images/form/input-json.png)
