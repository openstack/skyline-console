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

const metricDict = {
  monitorOverview: {
    alertInfo: {
      url: [
        'node_cpu_seconds_total',
        'node_memory_MemAvailable_bytes /  node_memory_MemTotal_bytes',
      ],
      baseParams: [
        {
          mode: 'idle',
          node: '',
        },
        {},
      ],
      finalFormatFunc: [
        (url) => `1 - (avg by(instance) (irate(${url}[5m]))) > 0.8`,
        (url) => `1 - (${url}) > 0.8`,
      ],
    },
    physicalCPUUsage: {
      url: ['openstack_nova_vcpus_used', 'openstack_nova_vcpus_available'],
      finalFormatFunc: [(url) => `sum(${url})`, (url) => `sum(${url})`],
    },
    physicalMemoryUsage: {
      url: [
        'openstack_nova_memory_used_bytes',
        'openstack_nova_memory_available_bytes',
      ],
      finalFormatFunc: [(url) => `sum(${url})`, (url) => `sum(${url})`],
    },
    physicalStorageUsage: {
      url: ['ceph_cluster_total_used_bytes', 'ceph_cluster_total_bytes'],
    },
    computeNodeStatus: {
      url: ['openstack_nova_agent_state'],
      baseParams: [
        {
          service: 'nova-compute',
        },
      ],
    },
    topHostCPUUsage: {
      url: ['node_cpu_seconds_total'],
      baseParams: [
        {
          mode: 'idle',
        },
      ],
      finalFormatFunc: [
        (url) => `topk(5, 100 - (avg(irate(${url}[30m])) by (instance) * 100))`,
      ],
    },
    topHostDiskIOPS: {
      url: [
        'node_disk_reads_completed_total',
        'node_disk_writes_completed_total',
      ],
      finalFormatFunc: [
        (url) => `topk(5, avg(irate(${url}[10m])) by (instance))`,
        (url) => `topk(5, avg(irate(${url}[10m])) by (instance))`,
      ],
    },
    topHostMemoryUsage: {
      url: ['node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes'],
      finalFormatFunc: [(url) => `topk(5, (1 - ${url}) * 100)`],
    },
    topHostInterface: {
      url: [
        'node_network_receive_bytes_total',
        'node_network_transmit_bytes_total',
      ],
      finalFormatFunc: [
        (url) => `topk(5, avg(irate(${url}[5m])) by (instance))`,
        (url) => `topk(5, avg(irate(${url}[5m])) by (instance))`,
      ],
    },
    cephHealthStatus: {
      url: ['ceph_health_status'],
    },
    cephStorageUsage: {
      url: ['ceph_cluster_total_used_bytes', 'ceph_cluster_total_bytes'],
    },
    cephStorageAllocate: {
      url: [
        'os_cinder_volume_pools_free_capacity_gb',
        'os_cinder_volume_pools_total_capacity_gb',
      ],
      finalFormatFunc: [(url) => `sum(${url})`, (url) => `sum(${url})`],
    },
    cephStorageClusterIOPS: {
      url: ['ceph_osd_op_r', 'ceph_osd_op_w'],
      finalFormatFunc: [
        (url) => `sum(irate(${url}[5m]))`,
        (url) => `sum(irate(${url}[5m]))`,
      ],
    },
  },
  physicalNode: {
    cpuCores: {
      url: ['node_cpu_seconds_total'],
      finalFormatFunc: [(url) => `count(${url}) by (cpu)`],
    },
    totalMem: {
      url: ['node_memory_MemTotal_bytes'],
    },
    systemRunningTime: {
      url: ['node_boot_time_seconds'],
    },
    fileSystemFreeSpace: {
      url: ['node_filesystem_avail_bytes', 'node_filesystem_size_bytes'],
      baseParams: [
        {
          fstype: ['ext4', 'xfs'],
        },
        {
          fstype: ['ext4', 'xfs'],
        },
      ],
    },
    cpuUsage: {
      url: ['node_cpu_seconds_total'],
      finalFormatFunc: [(url) => `avg by (mode)(irate(${url}[30m])) * 100`],
      baseParams: [
        {
          mode: ['idle', 'system', 'user', 'iowait'],
        },
      ],
    },
    memUsage: {
      url: [
        'node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes',
        'node_memory_MemAvailable_bytes',
      ],
    },
    diskIOPS: {
      url: [
        'node_disk_reads_completed_total',
        'node_disk_writes_completed_total',
      ],
      finalFormatFunc: [
        (url) => `irate(${url}[5m])`,
        (url) => `irate(${url}[5m])`,
      ],
    },
    diskUsage: {
      url: ['node_filesystem_free_bytes / node_filesystem_size_bytes'],
      finalFormatFunc: [(url) => `(1 - ${url}) * 100`],
      baseParams: [
        {
          device: ['/dev/.*'],
        },
      ],
    },
    systemLoad: {
      url: ['node_load1', 'node_load5', 'node_load15'],
    },
    networkTraffic: {
      url: [
        'node_network_receive_bytes_total',
        'node_network_transmit_bytes_total',
      ],
      finalFormatFunc: [
        (url) => `sum(irate(${url}[10m]))`,
        (url) => `sum(irate(${url}[10m]))`,
      ],
    },
    tcpConnections: {
      url: ['node_netstat_Tcp_CurrEstab'],
    },
    networkErrors: {
      url: [
        'node_network_receive_errs_total',
        'node_network_transmit_errs_total',
      ],
    },
    networkDroppedPackets: {
      url: [
        'node_network_receive_drop_total',
        'node_network_transmit_drop_total',
      ],
      finalFormatFunc: [
        (url) => `irate(${url}[5m])`,
        (url) => `irate(${url}[5m])`,
      ],
    },
  },
  storageCluster: {
    cephHealthStatus: {
      url: ['ceph_health_status'],
    },
    cephMonitorStatus: {
      url: ['ceph_mon_quorum_status'],
    },
    cephPGS: {
      url: ['ceph_pg_clean', 'ceph_pg_total-ceph_pg_clean'],
      finalFormatFunc: [(url) => `sum(${url})`, (url) => `sum(${url})`],
    },
    storageClusterUsage: {
      url: ['ceph_cluster_total_used_bytes', 'ceph_cluster_total_bytes'],
    },
    osdData: {
      url: [
        'ceph_osd_in == 1 and ceph_osd_up == 1',
        'ceph_osd_in == 1 and ceph_osd_up == 0',
        'ceph_osd_in == 0 and ceph_osd_up == 1',
        'ceph_osd_in == 0 and ceph_osd_up == 0',
      ],
      finalFormatFunc: [
        (url) => `count(${url})`,
        (url) => `count(${url})`,
        (url) => `count(${url})`,
        (url) => `count(${url})`,
      ],
    },
    avgPerOSD: {
      url: ['ceph_osd_numpg'],
      finalFormatFunc: [(url) => `avg(${url})`],
    },
    // avgOSDApplyLatency: {
    //   url: ['ceph_osd_apply_latency_ms'],
    //   finalFormatFunc: [
    //     url => `avg(${url})`,
    //   ],
    // },
    // avgOSDCommitLatency: {
    //   url: ['ceph_osd_commit_latency_ms'],
    //   finalFormatFunc: [
    //     url => `avg(${url})`,
    //   ],
    // },
    poolCapacityUsage: {
      url: [
        'ceph_cluster_total_used_bytes',
        'ceph_cluster_total_bytes-ceph_cluster_total_used_bytes',
      ],
    },
    clusterOSDLatency: {
      url: ['ceph_osd_apply_latency_ms', 'ceph_osd_commit_latency_ms'],
      finalFormatFunc: [(url) => `avg(${url})`, (url) => `avg(${url})`],
    },
    clusterIOPS: {
      url: ['ceph_osd_op_r', 'ceph_osd_op_w'],
      finalFormatFunc: [
        (url) => `sum(irate(${url}[5m]))`,
        (url) => `sum(irate(${url}[5m]))`,
      ],
    },
    clusterBandwidth: {
      url: ['ceph_osd_op_rw_in_bytes', 'ceph_osd_op_rw_out_bytes'],
      finalFormatFunc: [
        (url) => `sum(irate(${url}[5m]))`,
        (url) => `sum(irate(${url}[5m]))`,
      ],
    },
    tabs: {
      url: ['ceph_pool_metadata', 'ceph_osd_metadata'],
    },
    poolTab: {
      url: [
        'ceph_pg_total',
        'ceph_pool_objects',
        'ceph_pool_max_avail',
        '(ceph_pool_stored/ceph_pool_max_avail)*100',
      ],
    },
    osdTab: {
      url: [
        'ceph_osd_weight',
        'ceph_osd_apply_latency_ms',
        'ceph_osd_commit_latency_ms',
        '(ceph_osd_stat_bytes_used/ceph_osd_stat_bytes)*100',
        'ceph_osd_up',
        'ceph_osd_stat_bytes',
      ],
    },
  },
  openstackService: {
    novaService: {
      url: [
        'openstack_nova_agent_state',
        'openstack_nova_agent_state',
        'node_process_total',
        'node_process_total',
      ],
      baseParams: [
        {},
        {
          adminState: 'disabled',
        },
        {
          name: 'libvirtd',
        },
        {
          name: 'libvirtd',
        },
      ],
      finalFormatFunc: [
        (url) => url,
        (url) => `sum_over_time(${url}[24h]) > 0`,
        (url) => url,
        (url) => `min_over_time(${url}[24h]) == 0`,
      ],
    },
    networkService: {
      url: ['openstack_neutron_agent_state', 'openstack_neutron_agent_state'],
      baseParams: [
        {},
        {
          adminState: 'down',
        },
      ],
      finalFormatFunc: [
        (url) => url,
        (url) => `sum_over_time(${url}[24h]) > 0`,
      ],
    },
    cinderService: {
      url: ['openstack_cinder_agent_state', 'openstack_cinder_agent_state'],
      baseParams: [
        {},
        {
          service_state: 'down',
        },
      ],
      finalFormatFunc: [
        (url) => url,
        (url) => `sum_over_time(${url}[24h]) > 0`,
      ],
    },
    otherService: {
      url: ['mysql_up', 'rabbitmq_identity_info', 'memcached_up'],
    },
    otherServiceMinOverTime: {
      url: ['mysql_up', 'rabbitmq_identity_info', 'memcached_up'],
      finalFormatFunc: [
        (url) => `min_over_time(${url}[24h]) == 0`,
        (url) => `min_over_time(${url}[24h]) == 0`,
        (url) => `min_over_time(${url}[24h]) == 0`,
      ],
    },
    // heatMinOverTime: {
    //   url: ['os_heat_services_status', 'os_heat_services_status'],
    //   finalFormatFunc: [
    //     (url) => url,
    //     (url) => `min_over_time(${url}[24h]) == 0`,
    //   ],
    // },
  },
  mysqlService: {
    runningTime: {
      url: ['mysql_global_status_uptime'],
    },
    connectedThreads: {
      url: ['mysql_global_status_threads_connected'],
    },
    runningThreads: {
      url: ['mysql_global_status_threads_running'],
    },
    slowQuery: {
      url: ['mysql_global_status_slow_queries'],
    },
    threadsActivityTrends_connected: {
      url: ['mysql_global_status_threads_connected'],
    },
    mysqlActions: {
      url: [
        'mysql_global_status_commands_total',
        'mysql_global_status_commands_total',
        'mysql_global_status_commands_total',
      ],
      baseParams: [
        { command: 'delete' },
        { command: 'insert' },
        { command: 'update' },
      ],
    },
    slowQueryChart: {
      url: ['mysql_global_status_slow_queries'],
    },
  },
  memcacheService: {
    currentConnections: {
      url: ['memcached_current_connections'],
    },
    totalConnections: {
      url: ['memcached_connections_total'],
    },
    readWriteBytesTotal: {
      url: ['memcached_read_bytes_total', 'memcached_written_bytes_total'],
      finalFormatFunc: [
        (url) => `irate(${url}[20m])`,
        (url) => `irate(${url}[20m])`,
      ],
    },
    evictions: {
      url: ['memcached_slab_items_evicted_unfetched_total'],
      finalFormatFunc: [(url) => `sum(${url})`],
    },
    itemsInCache: {
      url: ['memcached_items_total'],
    },
  },
  rabbitMQService: {
    serviceStatus: {
      url: ['rabbitmq_identity_info'],
    },
    totalConnections: {
      url: ['rabbitmq_connections_opened_total'],
    },
    totalQueues: {
      url: ['rabbitmq_queues_created_total'],
    },
    totalExchanges: {
      url: ['erlang_mnesia_tablewise_size'],
    },
    totalConsumers: {
      url: ['rabbitmq_queue_consumers'],
    },
    publishedOut: {
      url: ['rabbitmq_channel_messages_published_total'],
      finalFormatFunc: [(url) => `sum(irate(${url}[20m]))`],
    },
    publishedIn: {
      url: ['rabbitmq_channel_messages_confirmed_total'],
      finalFormatFunc: [(url) => `sum(irate(${url}[20m]))`],
    },
    // totalMessage: {
    //   url: ['rabbitmq_overview_messages'],
    // },
    channel: {
      url: ['rabbitmq_channels'],
    },
  },
  haProxyService: {
    backendStatus: {
      url: ['haproxy_backend_up'],
    },
    connections: {
      url: [
        'haproxy_frontend_current_sessions',
        'haproxy_frontend_current_session_rate',
      ],
      finalFormatFunc: [(url) => `sum(${url})`, (url) => `sum(${url})`],
    },
    httpResponse: {
      url: [
        'haproxy_frontend_http_responses_total',
        'haproxy_backend_http_responses_total',
      ],
      finalFormatFunc: [
        (url) => `sum(irate(${url}[5m])) by (code)`,
        (url) => `sum(irate(${url}[5m])) by (code)`,
      ],
    },
    session: {
      url: [
        'haproxy_backend_current_sessions',
        'haproxy_backend_current_session_rate',
      ],
      finalFormatFunc: [(url) => `sum(${url})`, (url) => `sum(${url})`],
    },
    bytes: {
      url: [
        'haproxy_frontend_bytes_in_total',
        'haproxy_backend_bytes_in_total',
        'haproxy_frontend_bytes_out_total',
        'haproxy_backend_bytes_out_total',
      ],
      finalFormatFunc: [
        (url) => `sum(irate(${url}[5m]))`,
        (url) => `sum(irate(${url}[5m]))`,
        (url) => `sum(irate(${url}[5m]))`,
        (url) => `sum(irate(${url}[5m]))`,
      ],
    },
  },
  instanceMonitor: {
    cpu: {
      url: ['virtual:kvm:cpu:usage'],
    },
    memory: {
      url: ['virtual:kvm:memory:used'],
    },
    network: {
      url: [
        'virtual:kvm:network:receive:rate',
        'virtual:kvm:network:transmit:rate',
      ],
    },
    disk: {
      url: ['virtual:kvm:disk:read:kbps', 'virtual:kvm:disk:write:kbps'],
    },
    disk_iops: {
      url: ['virtual:kvm:disk:read:iops', 'virtual:kvm:disk:write:iops'],
    },
    disk_usage: {
      url: ['vm_disk_fs_used_pcent'],
      finalFormatFunc: [(url) => `avg(${url}) without(hostname)`],
    },
  },
};

export default metricDict;
