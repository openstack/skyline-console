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
import { Card, Button, Spin, Checkbox } from 'antd';
import G6 from '@antv/g6';
import image from 'asset/image/cloud.png';
import { RedoOutlined } from '@ant-design/icons';
import { observer, inject } from 'mobx-react';
import globalNetworkStore from 'stores/neutron/network';
import {
  combosBackground,
  combosColors,
  subnetsColors,
} from 'resources/neutron/topology-color';
import PrimaryActionButtons from 'components/Tables/Base/PrimaryActionButtons';
import { ipValidate } from 'utils/validate';
import { toJS } from 'mobx';
import { getAnchorData, isExternalNetwork } from 'resources/neutron/network';
import styles from './index.less';
import CreateRouter from '../Router/actions/Create';
import CreateNetwork from '../Network/actions/CreateNetwork';
import CreateInstance from '../../../compute/containers/Instance/actions/StepCreate';
import InstanceCard from './InstanceCard';
import NodeCard from './NodeCard';

let graph = null;
const { isIpInRangeAll } = ipValidate;

export const activeShadowColor = 'rgba(87,227,155,0.61)';
export const errorShadowColor = 'rgba(237,33,48,1)';
export const errorStrokeColor = '#DB3A3A';

export class Topology extends React.Component {
  constructor(props) {
    super(props);
    this.init();
    this.state = {
      firstSubnetY: 290,
      nodeCard: [],
      lbCard: [],
      insCard: [],
      extendWidth: 0,
      loading: true,
      showAll: true,
      // networkData: null,
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
      firstSubnetY: 290,
      nodeCard: [],
      lbCard: [],
      insCard: [],
      extendWidth: 0,
      loading: true,
      // networkData: null,
      withoutServerData: null,
      allData: null,
      showAll: true,
    });
    this.initTopo();
  };

  renderRouterNode = (data, width) => {
    const { routers } = this.topoInfo;
    const nodeXY = [];
    routers.forEach((router, index) => {
      const { id, external_gateway_info, subnets, name } = router;
      const routerX = parseFloat(
        ((width / 10) * index + (width / 20) * 3).toFixed(0)
      );
      nodeXY.push({ nodeCardX: routerX, nodeCardY: 190 });
      data.nodes.push({
        id,
        x: routerX,
        y: 190,
        type: 'rect',
        nodeType: 'router',
        infoIndex: index,
        size: [66, 56],
        style: {
          radius: 4,
          fill: '#FFFFFFFF',
          stroke:
            router.status === 'ACTIVE'
              ? globalCSS.successColor
              : errorStrokeColor,
          shadowColor:
            router.status === 'ACTIVE' ? activeShadowColor : errorShadowColor,
          shadowBlur: router.status === 'ACTIVE' ? 5 : 4,
        },
        anchorPoints: [[0.5, 0]],
      });
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
        data.nodes[data.nodes.length - 1].anchorPoints = this.getAnchorPoints(
          1,
          subnetNum
        );
      }
    });
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
    // const colorNum = combosColors.length;
    // let combosIndex = 0;
    const { extendWidth } = this.state;
    data.subnetNodes = [];
    networks.forEach((network) => {
      if (!isExternalNetwork(network)) {
        const networkSubnet = [];
        // const firstSubnetY = 250 + (netIndex * 150);
        const { firstSubnetY } = this.state;
        network.subnets.forEach((subnetId) => {
          subnets.forEach((subnet) => {
            if (subnet.id === subnetId) {
              networkSubnet.push(subnet);
            }
          });
        });
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
                fill: '#000000',
              },
            },
            type: 'rect',
            x: width / 2,
            y: firstSubnetY + index * 32,
            cardY,
            anchorPoints: [
              [0.5, 0],
              [0.5, 1],
            ],
            comboId: network.id,
            style: {
              radius: 4,
              fill: subnetsColor,
              stroke: subnetsColor,
              width: width + extendWidth - 50,
              height: 20,
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
            // x: width / 2,
            // y: 150,
            size: [width - 40, 30], // mininimum size of Combo
            style: {
              // fill: combosBackground[combosIndex % colorNum],
              fill: combosBackground[0],
              stroke: combosColors[0],
              radius: 4,
            },
            labelCfg: {
              refY: 1,
              position: 'top',
              style: {
                fontSize: 12,
              },
            },
          });
          // combosIndex += 1;
        }
      }
    });
  };

  renderInstanceNode = (data, width) => {
    const { servers, subnets, extNetwork } = this.topoInfo;
    const nodeXY = [];
    servers.forEach((server, index) => {
      const { fixed_addresses, fixed_networks } = server;
      let insX = parseFloat(((width / 10) * 2).toFixed(0));
      let insY = null;
      // const subnetNum = fixed_ip_address.length;
      let topAnchorNum = 0;
      const extSubnetId = [];
      extNetwork.forEach((it) => extSubnetId.push(...toJS(it.subnets)));
      const extSubnet = subnets.filter(
        (it) => extSubnetId.indexOf(it.id) !== -1
      );
      if (!fixed_addresses[0]) {
        const { insCard } = this.state;
        insY = data.subnetNodes[0].cardY;
        insCard.forEach((item) => {
          if (item[0] === insX && item[1] === insY) {
            insX += parseFloat((width / 10).toFixed(0));
          }
          if (Math.round(insX) >= width + this.state.extendWidth) {
            this.setState((pre) => {
              const extendWidth =
                pre.extendWidth + parseFloat((width / 10).toFixed(0));
              return {
                extendWidth,
              };
            });
          }
        });
        nodeXY.push([insX, insY]);
        data.nodes.push({
          id: server.id,
          x: insX,
          y: insY,
          // label: `ins: ${server.name}`,
          type: 'rect',
          nodeType: 'ins',
          infoIndex: index,
          size: [66, 56],
          style: {
            radius: 4,
            fill: '#FFFFFFFF',
            stroke:
              server.vm_state === 'active'
                ? globalCSS.successColor
                : errorStrokeColor,
            shadowColor:
              server.vm_state === 'active'
                ? activeShadowColor
                : errorShadowColor,
            shadowBlur: server.vm_state === 'active' ? 5 : 4,
          },
        });
      }
      let anchorIndex = 0;
      fixed_addresses.forEach((fixed_address) => {
        let subnet_id = null;
        let subnetIndex = 0;
        extSubnet.forEach((item) => {
          item.allocation_pools.forEach((pool) => {
            if (isIpInRangeAll(fixed_address, pool.start, pool.end)) {
              subnet_id = 'extNet';
              subnetIndex = 0;
            }
          });
        });
        data.subnetNodes.forEach((item, dataIndex) => {
          const network_index = fixed_networks.indexOf(item.networkId);
          // const ip_index = (fixed_ip_address[network_index] || []).indexOf(fixed_address);
          if (network_index !== -1) {
            item.pools.forEach((pool) => {
              if (isIpInRangeAll(fixed_address, pool.start, pool.end)) {
                subnet_id = item.id;
                subnetIndex = dataIndex;
              }
            });
          }
        });
        if (data.nodes[data.nodes.length - 1].id !== server.id && subnet_id) {
          const { insCard } = this.state;
          insY = data.subnetNodes[subnetIndex].cardY;
          insCard.forEach((item) => {
            if (item[0] === insX && item[1] === insY) {
              insX += parseFloat((width / 10).toFixed(0));
            }
            if (insX >= width + this.state.extendWidth) {
              this.setState((pre) => {
                const extendWidth = pre.extendWidth + width / 10;
                return {
                  extendWidth,
                };
              });
            }
          });
          // lbCard.forEach((item) => {
          //   if (item[0] === insX && item[1] === insY) {
          //     insX += parseFloat((width / 10).toFixed(0));
          //   }
          // });
          nodeXY.push([insX, insY]);
          data.nodes.push({
            id: server.id,
            x: insX,
            y: insY,
            // label: `ins: ${server.name}`,
            type: 'rect',
            nodeType: 'ins',
            infoIndex: index,
            size: [66, 56],
            style: {
              radius: 4,
              fill: '#FFFFFFFF',
              stroke:
                server.vm_state === 'active'
                  ? globalCSS.successColor
                  : errorStrokeColor,
              shadowColor:
                server.vm_state === 'active'
                  ? activeShadowColor
                  : errorShadowColor,
              shadowBlur: server.vm_state === 'active' ? 5 : 4,
            },
          });
        }
        if (subnet_id) {
          const {
            style: { stroke },
          } = data.subnetNodes[subnetIndex];
          const subnetY = data.subnetNodes[subnetIndex].y;
          if (subnetY < insY) {
            topAnchorNum += 1;
          }
          // todo: There is more to consider about edge cover
          // const offsetIndex = [];
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
              insX += parseFloat((width / 10).toFixed(0));
              data.nodes[data.nodes.length - 1].x = insX;
              nodeXY[nodeXY.length - 1] = [insX, insY];
            } else {
              break;
            }
            if (Math.round(insX) >= width + this.state.extendWidth) {
              this.setState((pre) => {
                const extendWidth = pre.extendWidth + width / 10;
                return {
                  extendWidth,
                };
              });
            }
          }
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
            // offset: offsetIndex.length,
          });
          anchorIndex += 1;
        }
      });
      const anchorData = this.getAnchorPoints(
        topAnchorNum,
        anchorIndex - topAnchorNum
      );
      const sererEdges = data.edges.filter((it) => it.source === server.id);
      sererEdges.forEach((it, i) => {
        if (it.target === 'extNet' && anchorData[i][1] === 1) {
          [anchorData[i], anchorData[topAnchorNum - 1]] = [
            anchorData[topAnchorNum - 1],
            anchorData[i],
          ];
        }
      });
      data.nodes[data.nodes.length - 1].anchorPoints = anchorData;
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
            endArrow: {
              path: G6.Arrow.vee(4, 8, -4),
              d: 1,
            },
            startArrow: {
              path: G6.Arrow.vee(4, 8, -4),
              d: 1,
            },
            stroke: color || '#C8DEFF',
            lineWidth: 2,
          },
          name: 'path-shape',
        });
        return group;
      },
    });

    const width = document.getElementById('container').scrollWidth;

    // data required for rendering
    let data = {
      nodes: [
        {
          id: 'networkImage',
          x: width / 2,
          y: 50,
          img: image,
          type: 'image',
          size: 56,
          // crop picture configuration
          clipCfg: {
            show: false,
            type: 'circle',
            r: 15,
          },
        },
        {
          id: 'extNet',
          type: 'rect',
          label: 'extNetwork',
          labelCfg: {
            position: 'right',
            offset: -(width / 2),
            style: {
              fill: '#000000',
            },
          },
          x: width / 2,
          y: 100,
          anchorPoints: [
            [0.5, 0],
            [0, 1],
          ],
          style: {
            radius: 4,
            fill: '#FFFFFFFF',
            stroke: subnetsColors[0][0],
            width: width - 10,
            height: 20,
          },
        },
      ],
      edges: [
        {
          id: 'edge3',
          target: 'networkImage',
          // targetAnchor: 1,
          source: 'extNet',
          style: {
            startArrow: {
              path: G6.Arrow.vee(4, 6, -1),
              d: 2,
            },
            lineWidth: 1,
            stroke: subnetsColors[0][0],
          },
        },
      ],
      combos: [],
    };

    const { servers } = this.topoInfo;
    if (servers) {
      data = graph.cfg.data;
      // const { networkData } = this.state;
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
      // const networkData = JSON.parse(JSON.stringify(data));
      // this.setState({
      //   networkData,
      // });
    }

    // initialize the G6 graph
    if (graph) {
      graph.clear();
      graph.destroy();
    }
    const { firstSubnetY: Y, extendWidth } = this.state;
    graph = new G6.Graph({
      container: 'container',
      width: width + extendWidth,
      height: Y,
      nodeStateStyles: {
        // the style for hover
        hover: {
          lineWidth: 3,
        },
      },
      // modes: {
      //   default: [
      //     'drag-canvas',
      //     'drag-node',
      //   ],
      // },
    });
    // }
    // graph.read(data);
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
        subnet.style.width = width - 50 + extendWidth;
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
    const {
      firstSubnetY: Y,
      extendWidth,
      showAll,
      withoutServerData,
      allData,
    } = this.state;
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
      height: Y,
      nodeStateStyles: {
        hover: {
          lineWidth: 3,
        },
      },
      // modes: {
      //   default: [
      //     'drag-canvas',
      //     'drag-node',
      //   ],
      // },
    });
    // }
    // graph.read(data);
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
        <div style={{ marginBottom: 16, marginTop: 16, marginLeft: 16 }}>
          <PrimaryActionButtons primaryActions={[CreateRouter]}>
            {t('create router')}
          </PrimaryActionButtons>
          <PrimaryActionButtons primaryActions={[CreateNetwork]}>
            {t('Create Network')}
          </PrimaryActionButtons>
          <PrimaryActionButtons primaryActions={[CreateInstance]}>
            {t('Create Instance')}
          </PrimaryActionButtons>
          <Button
            type="primary"
            shape="circle"
            style={{ marginLeft: 16 }}
            onClick={() => this.updateGraph()}
            icon={<RedoOutlined />}
          />
          <Checkbox onChange={() => this.onCheckChange()} checked={showAll}>
            {t('Show Instance')}
          </Checkbox>
        </div>
        <Spin spinning={loading}>
          <Card style={{ margin: 16 }} id="card" className={styles.container}>
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
