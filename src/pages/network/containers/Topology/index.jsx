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

/* eslint-disable no-loop-func */
/* eslint-disable no-const-assign */
/* eslint-disable react/no-string-refs */
/* eslint-disable react/no-unused-state */

import React from 'react';
import G6 from '@antv/g6';
import { toJS } from 'mobx';
import { Card, Spin, Checkbox } from 'antd';
import { observer, inject } from 'mobx-react';
import globalNetworkStore from 'stores/neutron/network';
import { ipValidate } from 'utils/validate';
import { subnetsColors } from 'resources/neutron/topology-color';
import { getAnchorData, isExternalNetwork } from 'resources/neutron/network';
import couldIcon from 'asset/cube/custom/icon-cloud.png';
import RefreshSvgIcon from 'asset/cube/monochrome/arrow_refresh_02.svg';
import PrimaryActionButtons from 'components/Tables/Base/PrimaryActionButtons';
import CubeIconButton from 'components/cube/CubeButton/CubeIconButton';
import CreateRouter from '../Router/actions/Create';
import CreateNetwork from '../Network/actions/CreateNetwork';
import CreateInstance from '../../../compute/containers/Instance/actions/StepCreate';
import InstanceCard from './InstanceCard';
import NodeCard from './NodeCard';
import styles from './index.less';

let graph = null;
const { isIpInRangeAll } = ipValidate;

export const activeShadowColor = 'rgba(87, 226, 226, 1)'; // COS Secondary color
export const errorShadowColor = 'rgba(255, 93, 93, 1)'; // COS Status Negative color
export const errorStrokeColor = 'rgba(213, 28, 28, 1)'; // COS Red color

const DEFAULT_FIRST_SUBNET_Y = 290;

// Constants for Node cards
const nodeCardWidth = 66;
const nodeCardHeight = 56;
const nodeCardOffsetX = nodeCardWidth;
const nodeCardMargin = 20;

export class Topology extends React.Component {
  constructor(props) {
    super(props);
    this.init();
    this.state = {
      firstSubnetY: DEFAULT_FIRST_SUBNET_Y,
      nodeCard: [],
      lbCard: [],
      insCard: [],
      extendWidth: 0,
      loading: true,
      showAll: true,
      withoutServerData: null,
      allData: null,
    };
  }

  componentDidMount() {}

  get topoInfo() {
    return this.store.topology;
  }

  bindEvents = () => {
    // listen for the mouse enter event on the node
    graph.on('node:mouseenter', (evt) => {
      const { item } = evt;
      const { nodeType } = item._cfg.model;

      if (['router', 'ins', 'lb'].includes(nodeType)) {
        const clickNodes = graph.findAllByState('node', 'hover');
        clickNodes.forEach((cn) => {
          graph.setItemState(cn, 'hover', false);
        });
        graph.setItemState(item, 'hover', true);
        const clickEdges = graph.findAllByState('edge', 'hover');
        clickEdges.forEach((ce) => {
          graph.setItemState(ce, 'hover', false);
          graph.updateItem(ce, {
            style: {
              stroke: ce._cfg.target._cfg.model.style.stroke,
            },
          });
        });
        const color = item._cfg.model.style.stroke;
        item._cfg.edges.forEach((edge) => {
          graph.setItemState(edge, 'hover', true);
          graph.updateItem(edge, {
            style: {
              stroke: color,
            },
          });
        });
      }
    });
  };

  updateGraph = () => {
    if (graph) {
      graph.clear();
      graph.destroy();
      graph = null;
    }
    this.setState({
      firstSubnetY: DEFAULT_FIRST_SUBNET_Y,
      nodeCard: [],
      lbCard: [],
      insCard: [],
      extendWidth: 0,
      loading: true,
      withoutServerData: null,
      allData: null,
      showAll: true,
    });
    this.initTopo();
  };

  renderRouterNode = (data, width) => {
    const { routers } = this.topoInfo;
    const nodeXY = [];
    const routerY = 200;

    routers.forEach((router, index) => {
      const { id, external_gateway_info, subnets, name, status } = router;

      // Calculate router X position
      const routerX =
        nodeCardOffsetX + (nodeCardWidth + nodeCardMargin) * index;
      nodeXY.push({ nodeCardX: routerX, nodeCardY: routerY });

      // Add router node to data
      data.nodes.push({
        id,
        x: routerX,
        y: routerY,
        type: 'rect',
        nodeType: 'router',
        infoIndex: index,
        size: [nodeCardWidth, nodeCardHeight],
        style: {
          radius: 6,
          fill: '#FFFFFF',
          stroke:
            status === 'ACTIVE' ? globalCSS.successColor : errorStrokeColor,
        },
        anchorPoints: [[0.5, 0]],
      });

      // Add edge to external network if gateway exists
      if (external_gateway_info !== null) {
        data.edges.push({
          id: `edge-${name}-ext`,
          target: 'extNet',
          targetAnchor: 1,
          source: id,
          sourceAnchor: 0,
          type: 'arrowLine',
          style: {
            stroke: subnetsColors[0][0],
          },
        });
      }

      // Add edges to subnets if available
      if (subnets.length !== 0) {
        let subnetNum = 0;
        subnets.forEach((subnet_id) => {
          const nodeIndex = data.subnetNodes
            .map((item) => item.id)
            .indexOf(subnet_id);
          if (nodeIndex !== -1) {
            const {
              style: { stroke },
            } = data.subnetNodes[nodeIndex];
            subnetNum += 1;
            data.edges.push({
              id: `edge-${name}-${subnet_id}`,
              target: subnet_id,
              targetAnchor: 0,
              source: id,
              sourceAnchor: subnetNum,
              type: 'arrowLine',
              style: {
                stroke,
              },
            });
          }
        });

        // Update anchor points based on number of subnets
        data.nodes[data.nodes.length - 1].anchorPoints = this.getAnchorPoints(
          1,
          subnetNum
        );
      }
    });

    // Auto-extend canvas width if last router node overflows
    if (nodeXY[0]) {
      const lastRouterNode = nodeXY[nodeXY.length - 1].nodeCardX;
      const { extendWidth } = this.state;
      if (lastRouterNode >= width - 5) {
        const index = Math.ceil((lastRouterNode - (width - 5)) / (width / 10));
        this.setState({
          extendWidth: extendWidth + index * (width / 10),
        });
      }
      this.setState({
        nodeCard: nodeXY,
      });
    }
  };

  renderNetworkNode = (data, width) => {
    const { subnets, networks } = this.topoInfo;
    const { extendWidth } = this.state;
    data.subnetNodes = [];
    networks.forEach((network) => {
      if (!isExternalNetwork(network)) {
        const networkSubnet = [];
        const { firstSubnetY } = this.state;
        network.subnets.forEach((subnetId) => {
          subnets.forEach((subnet) => {
            if (subnet.id === subnetId) {
              networkSubnet.push(subnet);
            }
          });
        });
        // Position of the Network cards
        const cardY = firstSubnetY + networkSubnet.length * 32 + 60;

        networkSubnet.forEach((subnet, index) => {
          const colors = subnetsColors[0];
          const subnetsColor = colors[index % colors.length];
          data.subnetNodes.push({
            id: subnet.id,
            label: subnet.name,
            labelCfg: {
              position: 'right',
              offset: -(width / 2),
              style: {
                fill: '#3F4453',
              },
            },
            type: 'rect',
            x: width / 2 - 10,
            y: firstSubnetY + index * 32,
            cardY,
            anchorPoints: [
              [0.5, 0],
              [0.5, 1],
            ],
            comboId: network.id,
            style: {
              radius: 6,
              fill: subnetsColor,
              stroke: subnetsColor,
              width: width + extendWidth - 76,
              height: 23,
            },
            pools: subnet.allocation_pools,
            networkId: subnet.network_id,
          });
        });

        if (networkSubnet.length !== 0) {
          this.setState({
            firstSubnetY: data.subnetNodes[data.subnetNodes.length - 1].y + 200,
          });

          data.combos.push({
            id: network.id,
            label: network.name,
            type: 'rect',
            padding: [40, 16, 16, 16],
            style: {
              radius: 6,
              fill: '#FFFFFF',
              stroke: '#C5CEFD',
              width: width - 30,
            },
            labelCfg: {
              refY: 20,
              refX: 32,
              position: 'top',
              style: {
                fontSize: 11,
                fill: '#3F4453',
              },
            },
          });
        }
      }
    });
  };

  renderInstanceNode = (data, width) => {
    const { servers, subnets, extNetwork } = this.topoInfo;
    const nodeXY = [];
    servers.forEach((server, index) => {
      const { fixed_addresses, fixed_networks, vm_state } = server;

      let insX = nodeCardOffsetX;
      let insY = null;
      let topAnchorNum = 0;

      const extSubnetId = [];
      extNetwork.forEach((it) => extSubnetId.push(...toJS(it.subnets)));

      const extSubnet = subnets.filter(
        (it) => extSubnetId.indexOf(it.id) !== -1
      );

      // Handle servers without fixed addresses
      if (!fixed_addresses[0]) {
        const { insCard } = this.state;
        insY = data.subnetNodes[0].cardY;

        // Adjust position if overlapping
        insCard.forEach(([x, y]) => {
          if (x === insX && y === insY) {
            insX += nodeCardWidth;
          }
          if (Math.round(insX) >= width + this.state.extendWidth) {
            this.setState((prev) => ({
              extendWidth: prev.extendWidth + Math.round(width),
            }));
          }
        });

        nodeXY.push([insX, insY]);
        data.nodes.push({
          id: server.id,
          x: insX,
          y: insY,
          type: 'rect',
          nodeType: 'ins',
          infoIndex: index,
          size: [nodeCardWidth, nodeCardHeight],
          style: {
            radius: 4,
            fill: '#FFFFFF',
            stroke:
              vm_state === 'active' ? globalCSS.successColor : errorStrokeColor,
          },
        });
      }

      let anchorIndex = 0;

      // Iterate over all fixed IPs
      fixed_addresses.forEach((fixed_address) => {
        let subnet_id = null;
        let subnetIndex = 0;

        // Match fixed IP with external subnet
        extSubnet.forEach((item) => {
          item.allocation_pools.forEach((pool) => {
            if (isIpInRangeAll(fixed_address, pool.start, pool.end)) {
              subnet_id = 'extNet';
              subnetIndex = 0;
            }
          });
        });

        // Match fixed IP with internal subnet
        data.subnetNodes.forEach((item, dataIndex) => {
          const network_index = fixed_networks.indexOf(item.networkId);
          if (network_index !== -1) {
            item.pools.forEach((pool) => {
              if (isIpInRangeAll(fixed_address, pool.start, pool.end)) {
                subnet_id = item.id;
                subnetIndex = dataIndex;
              }
            });
          }
        });

        // If server node hasn't been added yet and subnet is matched, add it
        if (data.nodes[data.nodes.length - 1].id !== server.id && subnet_id) {
          const { insCard } = this.state;
          insY = data.subnetNodes[subnetIndex].cardY;

          // Avoid overlapping positions
          insCard.forEach(([x, y]) => {
            if (x === insX && y === insY) {
              insX += nodeCardWidth + nodeCardMargin;
            }
            if (insX >= width + this.state.extendWidth) {
              this.setState((prev) => ({
                extendWidth: prev.extendWidth + width,
              }));
            }
          });

          nodeXY.push([insX, insY]);
          data.nodes.push({
            id: server.id,
            x: insX,
            y: insY,
            type: 'rect',
            nodeType: 'ins',
            infoIndex: index,
            size: [nodeCardWidth, nodeCardHeight],
            style: {
              radius: 6,
              fill: '#FFFFFF',
              stroke:
                server.vm_state === 'active'
                  ? globalCSS.successColor
                  : errorStrokeColor,
            },
          });
        }

        if (subnet_id) {
          const { stroke } = data.subnetNodes[subnetIndex].style;
          const subnetY = data.subnetNodes[subnetIndex].y;

          // Determine top or bottom anchor
          if (subnetY < insY) {
            topAnchorNum += 1;
          }
          // TODO: There is more to consider about edge cover
          // Prevent edge and node overlap
          for (let i = 0; i < nodeXY.length; i++) {
            const offsetIndex = data.edges.filter(
              (it) =>
                it.source !== server.id &&
                it.linePath &&
                it.linePath.source_x === insX &&
                it.topAnchorNum === topAnchorNum &&
                ((it.linePath.source_y >= insY &&
                  it.linePath.target_y <= subnetY) ||
                  (it.linePath.source_y <= insY &&
                    it.linePath.target_y >= subnetY))
            );

            const overlapIndex = data.nodes.filter(
              (it) => it.x === insX && it.y === insY && it.id !== server.id
            );

            if (offsetIndex.length !== 0 || overlapIndex.length !== 0) {
              insX += Math.round(width);
              data.nodes[data.nodes.length - 1].x = insX;
              nodeXY[nodeXY.length - 1] = [insX, insY];
            } else {
              break;
            }

            if (Math.round(insX) >= width + this.state.extendWidth) {
              this.setState((prev) => ({
                extendWidth: prev.extendWidth + width,
              }));
            }
          }

          // Push edge from instance to subnet
          data.edges.push({
            id: `edge-${server.id}-${fixed_address}`,
            target: subnet_id,
            targetAnchor: subnetY > insY ? 0 : 1,
            source: server.id,
            sourceAnchor: anchorIndex,
            type: 'arrowLine',
            topAnchorNum,
            style: {
              stroke,
            },
            linePath: {
              source_x: insX,
              source_y: insY,
              target_y: subnetY,
            },
          });

          anchorIndex += 1;
        }
      });

      // Generate anchor points based on number of edges
      const anchorData = this.getAnchorPoints(
        topAnchorNum,
        anchorIndex - topAnchorNum
      );

      // Swap anchor point for external network to the top if necessary
      const serverEdges = data.edges.filter((it) => it.source === server.id);
      serverEdges.forEach((it, i) => {
        if (it.target === 'extNet' && anchorData[i][1] === 1) {
          [anchorData[i], anchorData[topAnchorNum - 1]] = [
            anchorData[topAnchorNum - 1],
            anchorData[i],
          ];
        }
      });

      // Assign anchor points to instance node
      data.nodes[data.nodes.length - 1].anchorPoints = anchorData;

      // Store final positions
      this.setState({
        insCard: nodeXY,
      });
    });
  };

  getAnchorPoints = (topAnchorNum, bottomAnchorNum) => {
    const data = [];
    if (topAnchorNum > 0) {
      data.push(...getAnchorData(topAnchorNum, 0));
    }
    if (bottomAnchorNum > 0) {
      data.push(...getAnchorData(bottomAnchorNum, 1));
    }
    return data;
  };

  renderG6 = () => {
    G6.registerEdge('arrowLine', {
      draw(cfg, group) {
        const { endPoint, startPoint } = cfg;
        const color = cfg.style.stroke;
        group.addShape('path', {
          attrs: {
            path: [
              ['M', startPoint.x, startPoint.y],
              ['L', startPoint.x, endPoint.y],
            ],
            stroke: color || '#607AFF',
            lineWidth: 1,
          },
          name: 'path-shape',
        });
        return group;
      },
    });

    const width = document.getElementById('container').scrollWidth;

    /**
     * Ideally, each external network should be displayed in its own row.
     * However, as a temporary workaround for phase 1, all external networks
     * will be listed in a single row.
     */
    const getExtNetworkNames = () => {
      const { networks } = this.store.topology;
      if (!networks) return 'External Network';

      const externalNetworks = networks
        .filter((network) => isExternalNetwork(network))
        .map((network) => network.name)
        .join(', ');

      return `External Network(s): ${externalNetworks}`;
    };

    // data required for rendering
    let data = {
      nodes: [
        {
          id: 'networkImage',
          type: 'image',
          img: couldIcon,
          size: 56,
          x: width / 2 - 10,
          y: 30,
        },
        {
          id: 'extNet',
          type: 'rect',
          label: getExtNetworkNames(),
          labelCfg: {
            position: 'right',
            offset: -(width / 2),
            style: {
              fill: '#3F4453',
            },
          },
          x: width / 2 - 10,
          y: 120,
          anchorPoints: [
            [0.5, 0],
            [0, 1],
          ],
          style: {
            radius: 6,
            fill: '#FFFFFF',
            stroke: '#C5CEFD',
            width: width - 30,
            height: 55,
          },
        },
      ],
      edges: [
        {
          id: 'edge3',
          target: 'networkImage',
          source: 'extNet',
          style: {
            lineWidth: 1,
            stroke: '#607AFF',
          },
        },
      ],
      combos: [],
    };

    const { servers } = this.topoInfo;

    if (servers) {
      data = graph.cfg.data;
      this.renderRouterNode(data, width);
      this.extendNetworkWidth(data, width);
      const withoutServerData = JSON.parse(JSON.stringify(data));
      this.setState({
        withoutServerData,
      });
      this.renderInstanceNode(data, width);
      this.extendNetworkWidth(data, width);
      const allData = JSON.parse(JSON.stringify(data));
      this.setState({
        allData,
      });
    } else {
      this.renderNetworkNode(data, width);
      this.extendNetworkWidth(data, width);
    }

    if (graph) {
      graph.clear();
      graph.destroy();
    }
    const { firstSubnetY, extendWidth } = this.state;
    graph = new G6.Graph({
      container: 'container',
      width: width + extendWidth,
      height: firstSubnetY,
    });
    graph.data(data);
    graph.render();
    this.bindEvents();
    this.setState({
      loading: false,
    });
  };

  extendNetworkWidth = (data, width) => {
    const { subnetNodes, nodes } = data;
    const { extendWidth } = this.state;

    if (extendWidth > 0) {
      subnetNodes.forEach((subnet) => {
        subnet.style.width = width + extendWidth - 50;
        subnet.x = (width + extendWidth) / 2;
        subnet.labelCfg.offset = -((width + extendWidth) / 2);
      });
      nodes[1].style.width = width + extendWidth - 10;
      nodes[0].x = (width + extendWidth) / 2;
      nodes[1].labelCfg.offset = -((width + extendWidth) / 2);
      nodes[1].x = (width + extendWidth) / 2;
    }
    if (subnetNodes && subnetNodes[0]) {
      data.nodes = nodes.concat(subnetNodes);
    }
  };

  onCheckChange = () => {
    const { firstSubnetY, extendWidth, showAll, withoutServerData, allData } =
      this.state;
    const width = document.getElementById('container').scrollWidth;
    const showIns = !showAll;
    this.setState({
      showAll: showIns,
    });
    let updateWidth = width + extendWidth;
    if (!showIns) {
      updateWidth = width - extendWidth;
    }
    graph.clear();
    graph.destroy();
    graph = null;
    graph = new G6.Graph({
      container: 'container',
      width: updateWidth,
      height: firstSubnetY,
    });
    graph.data(showIns ? allData : withoutServerData);
    graph.render();
    this.bindEvents();
  };

  async initNetwork() {
    await this.store.fetchTopoNetwork({
      ...this.props.match.params,
      metrics: true,
    });
    this.renderG6();
  }

  async initAll() {
    await this.store.fetchTopo({
      ...this.props.match.params,
      metrics: true,
    });
    if (this.topoInfo.networks) {
      this.renderG6();
    }
  }

  initTopo() {
    this.initNetwork();
    this.initAll();
  }

  init() {
    this.store = globalNetworkStore;
    graph = null;
    this.initTopo();
  }

  render() {
    const { nodeCard, insCard, loading, showAll } = this.state;
    const { topology } = this.store;
    return (
      <div className={styles.main}>
        <div className={styles['button-container']}>
          <PrimaryActionButtons primaryActions={[CreateRouter]}>
            {t('create router')}
          </PrimaryActionButtons>
          <PrimaryActionButtons primaryActions={[CreateNetwork]}>
            {t('Create Network')}
          </PrimaryActionButtons>
          <PrimaryActionButtons primaryActions={[CreateInstance]}>
            {t('Create Instance')}
          </PrimaryActionButtons>
          <CubeIconButton
            type="default"
            onClick={() => this.updateGraph()}
            icon={RefreshSvgIcon}
          />
          <Checkbox onChange={() => this.onCheckChange()} checked={showAll}>
            {t('Show Instance')}
          </Checkbox>
        </div>
        <Spin spinning={loading}>
          <Card id="card" className={styles.container}>
            <div id="container">
              {topology &&
                nodeCard.map((card, index) => (
                  <NodeCard
                    key={index}
                    x={card.nodeCardX}
                    y={card.nodeCardY}
                    data={this.topoInfo}
                    infoIndex={index}
                  />
                ))}
              {showAll
                ? topology &&
                  insCard.map((card, index) => (
                    <InstanceCard
                      key={index}
                      x={card[0]}
                      y={card[1]}
                      data={this.topoInfo}
                      infoIndex={index}
                    />
                  ))
                : null}
            </div>
          </Card>
        </Spin>
      </div>
    );
  }
}

export default inject('rootStore')(observer(Topology));
