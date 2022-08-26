.. _skyline-settings:

==========================
Skyline Settings Reference
==========================

skyline.yaml sample configuration file

.. code-block:: yaml

    default:
      access_token_expire: 3600
      access_token_renew: 1800
      cors_allow_origins: []
      database_url: sqlite:////tmp/skyline.db
      debug: false
      log_dir: ./log
      prometheus_basic_auth_password: ''
      prometheus_basic_auth_user: ''
      prometheus_enable_basic_auth: false
      prometheus_endpoint: http://localhost:9091
      secret_key: aCtmgbcUqYUy_HNVg5BDXCaeJgJQzHJXwqbXr0Nmb2o
      session_name: session
      ssl_enabled: true
    openstack:
      base_domains:
      - heat_user_domain
      default_region: RegionOne
      extension_mapping:
        floating-ip-port-forwarding: neutron_port_forwarding
        fwaas_v2: neutron_firewall
        qos: neutron_qos
        vpnaas: neutron_vpn
      interface_type: public
      keystone_url: http://localhost:5000/v3/
      nginx_prefix: /api/openstack
      reclaim_instance_interval: 604800
      service_mapping:
        baremetal: ironic
        compute: nova
        container: zun
        container-infra: magnum
        database: trove
        identity: keystone
        image: glance
        key-manager: barbican
        load-balancer: octavia
        network: neutron
        object-store: swift
        orchestration: heat
        placement: placement
        sharev2: manilav2
        volumev3: cinder
      sso_enabled: false
      sso_protocols:
      - openid
      sso_region: RegionOne
      system_admin_roles:
      - admin
      - system_admin
      system_project: service
      system_project_domain: Default
      system_reader_roles:
      - system_reader
      system_user_domain: Default
      system_user_name: skyline
      system_user_password: ''
    setting:
      base_settings:
      - flavor_families
      - gpu_models
      - usb_models
      flavor_families:
      - architecture: x86_architecture
        categories:
        - name: general_purpose
          properties: []
        - name: compute_optimized
          properties: []
        - name: memory_optimized
          properties: []
        - name: high_clock_speed
          properties: []
      - architecture: heterogeneous_computing
        categories:
        - name: compute_optimized_type_with_gpu
          properties: []
        - name: visualization_compute_optimized_type_with_gpu
          properties: []
      gpu_models:
      - nvidia_t4
      usb_models:
      - usb_c
