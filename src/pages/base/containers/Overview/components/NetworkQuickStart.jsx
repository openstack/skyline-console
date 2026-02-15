import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import Notify from 'components/Notify';
import globalRouterStore from 'stores/neutron/router';
import globalNeutronStore from 'stores/neutron/neutron';
import globalNetworkStore, { NetworkStore } from 'stores/neutron/network';
import { nameTypeValidate, ipValidate } from 'utils/validate';
import { has } from 'lodash';
import { networkStatus } from 'resources/neutron/network';

const { isIpCidr, isIPv6Cidr, getFirstIpFromCidr } = ipValidate;
const { nameValidateWithoutChinese } = nameTypeValidate;

const DEFAULT_CIDR = {
  ipv4: '192.168.0.0/24',
  ipv6: '1001:1001::/64',
};

const DEFAULT_DNS = {
  ipv4: '1.1.1.1',
  ipv6: '1001:1001::2',
};

const IP_VERSION_OPTIONS = [
  { label: t('IPv4'), value: 'ipv4' },
  { label: t('IPv6'), value: 'ipv6' },
];

export class NetworkQuickStart extends ModalAction {
  static id = 'network-quick-start';

  static title = t('Quick Create');

  static policy = ['create_network', 'create_subnet', 'create_router'];

  static allowed = () => Promise.resolve(true);

  constructor(props) {
    super(props);
    this.state = {
      ipVersion: 'ipv4',
      createRouter: false,
      openExternalNetwork: false,
      isSubmitting: false,
    };
  }

  init() {
    this.routerStore = globalRouterStore;
    this.networkStore = new NetworkStore();
  }

  componentDidMount() {
    this.setSubmitFormCallback();
  }

  componentWillUnmount() {
    this.setSubmitFormCallback(null);
  }

  setSubmitFormCallback = (callback = this.submitForm) => {
    if (this.props.setSubmitFormCallback) {
      this.props.setSubmitFormCallback(callback);
    }
  };

  get name() {
    return t('Quick Start Network');
  }

  getModalSize() {
    return 'large';
  }

  get labelCol() {
    return { span: 8 };
  }

  get wrapperCol() {
    return { span: 14 };
  }

  get modalProps() {
    return {
      width: '80%',
      style: { top: 20 },
      bodyStyle: {
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'auto',
        padding: '24px',
      },
      className: 'quick-start-network-form',
    };
  }

  get isIpv4() {
    const { ipVersion = 'ipv4' } = this.state;
    return ipVersion === 'ipv4';
  }

  get defaultValue() {
    const ipVersion = this.state.ipVersion || 'ipv4';
    const defaultCidr = DEFAULT_CIDR[ipVersion];
    const defaultGatewayIp = getFirstIpFromCidr(defaultCidr);
    const defaultDns = DEFAULT_DNS[ipVersion];

    const gatewayIp =
      ipVersion === 'ipv6' && !defaultGatewayIp
        ? getFirstIpFromCidr(defaultCidr)
        : defaultGatewayIp;

    const defaultValue = {
      networkName: 'network-1',
      subnetName: 'subnet-1',
      subnetCidr: defaultCidr,
      ipVersion,
      gatewayIp,
      dns: defaultDns,
      createRouter: false,
      routerName: 'router-1',
      openExternalNetwork: false,
    };

    if (ipVersion === 'ipv6') {
      defaultValue.ipv6AddressMode = 'slaac';
      defaultValue.ipv6RaMode = 'slaac';
    }

    return defaultValue;
  }

  get isSubmitting() {
    return this.state.isSubmitting;
  }

  validateCidr = (rule, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const { ipVersion = 'ipv4' } = this.state;
    const isValid = ipVersion === 'ipv4' ? isIpCidr(value) : isIPv6Cidr(value);
    if (isValid) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(t('Invalid: ') + t('CIDR')));
  };

  validateIpv6 = (rule, value) => {
    if (!value || value.trim() === '') {
      return Promise.resolve();
    }
    if (ipValidate.isIpv6(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(t('Invalid: Please input a valid IPv6.')));
  };

  handleIpVersionChange = (value) => {
    this.setState({ ipVersion: value });

    if (this.formRef?.current) {
      const defaultCidr = DEFAULT_CIDR[value];
      const defaultGatewayIp = getFirstIpFromCidr(defaultCidr);
      const defaultDns = DEFAULT_DNS[value];

      this.formRef.current.setFieldsValue({
        subnetCidr: defaultCidr,
        gatewayIp: defaultGatewayIp,
        dns: defaultDns,
      });
    }
  };

  handleGatewayIpChange = (e) => {
    this.setState({
      gatewayIp: e?.target?.value,
    });
  };

  handleCidrChange = (e) => {
    const cidr = e?.target?.value;
    this.updateGatewayFromCidr(cidr);
  };

  handleBooleanStateChange = (field) => (e) => {
    this.setState({
      [field]: e?.target?.checked ?? e,
    });
  };

  updateGatewayFromCidr = (cidr) => {
    if (cidr && this.formRef?.current) {
      const firstIp = getFirstIpFromCidr(cidr);

      if (firstIp) {
        this.formRef.current.setFieldsValue({
          gatewayIp: firstIp,
        });
      }

      const ipVersion = this.state.ipVersion || 'ipv4';
      const defaultDns = DEFAULT_DNS[ipVersion];
      if (defaultDns) {
        this.formRef.current.setFieldsValue({
          dns: defaultDns,
        });
      }
    }
  };

  onValuesChange = (changedFields) => {
    if (has(changedFields, 'createRouter')) {
      this.setState({
        createRouter: changedFields.createRouter,
      });
    }
    if (has(changedFields, 'openExternalNetwork')) {
      this.setState({
        openExternalNetwork: changedFields.openExternalNetwork,
      });
    }
    if (has(changedFields, 'subnetCidr')) {
      this.updateGatewayFromCidr(changedFields.subnetCidr);
    }
  };

  get formItems() {
    const {
      ipVersion = 'ipv4',
      createRouter,
      openExternalNetwork,
    } = this.state;
    const isIpv4 = ipVersion === 'ipv4';

    const baseItems = [
      {
        name: 'networkName',
        label: t('Network Name'),
        type: 'input',
        required: true,
        validator: nameValidateWithoutChinese,
      },
      {
        name: 'subnetName',
        label: t('Subnet Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'ipVersion',
        label: t('IP Version'),
        type: 'select',
        options: IP_VERSION_OPTIONS,
        onChange: this.handleIpVersionChange,
        required: true,
      },
      {
        name: 'subnetCidr',
        label: t('Subnet CIDR'),
        type: 'input',
        required: true,
        placeholder: DEFAULT_CIDR[ipVersion],
        validator: this.validateCidr,
        onChange: this.handleCidrChange,
        tip: isIpv4
          ? t(
              'It is recommended that you use the private network address 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'
            )
          : t('e.g. 2001:Db8::/48'),
      },
      {
        name: 'gatewayIp',
        label: t('Gateway IP'),
        type: isIpv4 ? 'ip-input' : 'input',
        onChange: this.handleGatewayIpChange,
        tip: t(
          'Auto-populated with first IP from CIDR. You can modify if needed.'
        ),
        validator: isIpv4 ? null : this.validateIpv6,
      },
      {
        name: 'dns',
        label: t('DNS'),
        type: 'textarea',
        extra: t('One entry per line (e.g. {ip})', {
          ip: DEFAULT_DNS[ipVersion],
        }),
        placeholder: DEFAULT_DNS[ipVersion],
      },
      {
        name: 'createRouter',
        label: t('Create and attach Router'),
        type: 'check',
        onChange: this.handleBooleanStateChange('createRouter'),
      },
    ];

    if (createRouter) {
      baseItems.push(
        {
          name: 'routerName',
          label: t('Router Name'),
          type: 'input',
          required: true,
          validator: nameValidateWithoutChinese,
        },
        {
          name: 'openExternalNetwork',
          label: t('Options'),
          type: 'check',
          content: t('External Gateway'),
          tip: t(
            'Enable external gateway to allow the router to connect to external networks for internet access.'
          ),
          onChange: this.handleBooleanStateChange('openExternalNetwork'),
        }
      );

      if (openExternalNetwork) {
        baseItems.push({
          name: 'externalNetwork',
          label: t('External Gateway'),
          type: 'select-table',
          backendPageStore: this.networkStore,
          extraParams: { 'router:external': true },
          required: true,
          labelCol: { span: 8 },
          wrapperCol: { span: 14 },
          filterParams: [
            {
              label: t('Name'),
              name: 'name',
            },
          ],
          columns: [
            {
              title: t('Name'),
              dataIndex: 'name',
            },
            {
              title: t('Status'),
              dataIndex: 'status',
              valueMap: networkStatus,
            },
            {
              title: t('Created At'),
              dataIndex: 'created_at',
              valueRender: 'sinceTime',
            },
          ],
        });
      }
    }

    return baseItems;
  }

  submitForm = () => {
    this.onClickSubmit(
      (success, hasError) => {
        if (success && !hasError && this.props.onCancel) {
          this.props.onCancel();
        }
      },
      null,
      this.props.containerProps || {}
    );
  };

  onOk = async (values, containerProps, callback) => {
    this.values = values;
    this.setState({ isSubmitting: true });

    try {
      await this.onSubmit(values, containerProps);
      const networkName = values.networkName || 'unknown';
      Notify.success(
        t('Network created successfully, instance: {name}.', {
          name: networkName,
        })
      );
      this.handleSuccess(callback);
    } catch (err) {
      const networkName = values.networkName || 'unknown';
      Notify.error(
        err?.message ||
          t('Unable to create network, instance: {name}.', {
            name: networkName,
          })
      );
      this.handleError(callback);
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  handleSuccess = (callback) => {
    if (callback && typeof callback === 'function') {
      callback(true, false);
    }
  };

  handleError = (callback) => {
    if (callback && typeof callback === 'function') {
      callback(false, true);
    }
  };

  createNetworkAndSubnet = async (networkData, subnetData) => {
    globalNetworkStore.updateCreateWithSubnet(true);

    const result = await globalNetworkStore.createAndMore(networkData, {
      ...subnetData,
      create_subnet: true,
    });

    const { network, subnet } = result || {};

    globalNetworkStore.lastCreatedItem = network;
    globalNetworkStore.lastCreatedSubnet = subnet;

    return { network, subnet };
  };

  createAndConnectRouter = async (network, subnet, routerConfig) => {
    const { routerName, openExternalNetwork, externalNetwork } = routerConfig;

    const routerData = {
      name: routerName || 'router-1',
      project_id: globalNeutronStore.currentProjectId,
    };

    if (openExternalNetwork && externalNetwork?.selectedRows?.[0]) {
      routerData.external_gateway_info = {
        network_id: externalNetwork.selectedRows[0].id,
      };
    }

    const routerResult = await this.routerStore.create(routerData);
    const router = routerResult.router || routerResult;

    const subnetId = subnet.subnet ? subnet.subnet.id : subnet.id;

    await this.routerStore.connectSubnet({
      id: router.id,
      subnetId,
      networkId: network.id,
    });

    return router;
  };

  prepareNetworkData = (values) => {
    const { networkName } = values;
    const { currentProjectId } = globalNeutronStore;

    if (!currentProjectId) {
      throw new Error('Current project ID is not available');
    }

    return {
      name: networkName,
      project_id: currentProjectId,
    };
  };

  prepareSubnetData = (values) => {
    const { subnetName, subnetCidr, ipVersion, gatewayIp, dns } = values;
    const isIpv6 = ipVersion === 'ipv6';

    const subnetData = {
      subnet_name: subnetName,
      cidr: subnetCidr,
      ip_version: ipVersion || 'ipv4',
      enable_dhcp: true,
      dns,
    };

    if (isIpv6 || gatewayIp) {
      subnetData.gateway_ip = gatewayIp;
    }

    if (isIpv6) {
      subnetData.ipv6_address_mode = 'slaac';
      subnetData.ipv6_ra_mode = 'slaac';
    }

    return subnetData;
  };

  prepareRouterData = (values) => {
    const { routerName, openExternalNetwork, externalNetwork } = values;

    return {
      routerName,
      openExternalNetwork,
      externalNetwork,
    };
  };

  onSubmit = async (values) => {
    const { createRouter } = values;

    const networkData = this.prepareNetworkData(values);
    const subnetData = this.prepareSubnetData(values);

    const { network, subnet } = await this.createNetworkAndSubnet(
      networkData,
      subnetData
    );
    if (createRouter && network && subnet) {
      try {
        const routerConfig = this.prepareRouterData(values);
        await this.createAndConnectRouter(network, subnet, routerConfig);
        const routerName = values.routerName || 'router-1';
        Notify.success(
          t(
            'Router created and subnet connected successfully, instance: {name}.',
            { name: routerName }
          )
        );
      } catch (routerError) {
        const routerName = values.routerName || 'router-1';
        Notify.error(
          t('Router creation failed, instance: {name}. {error}', {
            name: routerName,
            error: routerError.message || 'Unknown error',
          })
        );
      }
    }
  };
}

export default inject('rootStore')(observer(NetworkQuickStart));
