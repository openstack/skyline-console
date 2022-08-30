.. _network-tab:

========================================
Create and manage networks (Network tab)
========================================

The OpenStack Networking service provides a scalable system for managing the
network connectivity within an OpenStack cloud deployment. It handles the
creation and management of a virtual networking infrastructure, including
networks, switches, subnets, and routers. Advanced services such as firewalls
or virtual private network (VPN) can also be used.

Networking in OpenStack is complex. This section provides the basic
instructions for creating a network and a router. For detailed
information about managing networks, refer to the `OpenStack Networking Guide
<https://docs.openstack.org/neutron/latest/admin/>`__.

create a network
----------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Network` tab and
   click :guilabel:`Networks` category.

#. Click :guilabel:`Create Network`.

#. In the :guilabel:`Create Network` dialog box, specify the following values.

   :guilabel:`Network Name`: Specify a name to identify the network.

   :guilabel:`Description`: A human-readable description for the resource.

   :guilabel:`Shared`: Share the network with other projects. Non admin users
   are not allowed to set shared option.

   :guilabel:`Available Zone`: Select a availability zone for the network.

   :guilabel:`Port Security Enabled`: Select the port security status of the network.

   :guilabel:`Create Subnet`: Select this check box to create a subnet.

   You do not have to specify a subnet when you create a network, but if
   you do not specify a subnet, the network can not be attached to an instance.

   :guilabel:`Subnet Name`: Specify a name for the subnet.

   :guilabel:`CIDR`: Specify the IP address for the subnet.

   :guilabel:`IP Version`: Select IPv4 or IPv6.

   :guilabel:`Gateway IP`: Specify an IP address for a specific gateway. This
   parameter is optional.

   :guilabel:`Disable Gateway`: Select this check box to disable a gateway IP
   address.

   :guilabel:`DHCP`: Select this check box to enable DHCP.

   :guilabel:`Allocation Pools`: Specify IP address pools.

   :guilabel:`DNS`: Specify the DNS server.

   :guilabel:`Host Routes`: Specify the IP address of host routes.

#. Click :guilabel:`OK`.

   The dashboard shows the network on the :guilabel:`Networks` tab.

create a router
----------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Network` tab and
   click :guilabel:`Routers` category.

#. Click :guilabel:`Create Router`.

#. In the :guilabel:`Create Router` dialog box, specify the following values.

   :guilabel:`Name`: Specify a name to identify the router.

   :guilabel:`Open External Gateway`: Select this check box to specify external gateway.

   :guilabel:`External Gateway`: Specify external gateway for the router.

   Click :guilabel:`OK`, and the new router is now displayed in
   the :guilabel:`Routers` tab.

#. To connect a private network to the newly created router, perform the
   following steps:

   A) On the :guilabel:`Routers` tab, select :guilabel:`More` of the router,
   click :guilabel:`connect Subnet`.

   C) In the :guilabel:`Connect Subnet` dialog box, select a :guilabel:`Network`
   and :guilabel:`Subnet`.

#. Click :guilabel:`OK`.

You have successfully created the router. You can view the new topology
from the :guilabel:`Topology` tab.

create a port
--------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Network` tab and
   click :guilabel:`Ports` category.

#. Click :guilabel:`Create Virtual Adapter`.

#. In the :guilabel:`Create Virtual Adapter` dialog box, specify the following values.

   :guilabel:`Name`: Specify name to identify the port.

   :guilabel:`Owned Network`: Select a network attached to the port.

   :guilabel:`Owned Subnet`: Select a subnet attached to the port.

   If you specify both a subnet ID and an IP address, OpenStack tries to
   allocate the IP address on that subnet to the port.

   If you specify only a subnet ID, OpenStack allocates an available IP
   from that subnet to the port.

   :guilabel:`Port Security`: Select this check box to specify security group.

   :guilabel:`Security Group`: Select a security groups applied to the port.

#. Click :guilabel:`OK`.

   The new port is now displayed in the :guilabel:`Ports` list.

create a fip
-------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Network` tab and
   click :guilabel:`Floating IPs` category.

#. Click :guilabel:`Allocate IP`.

#. In the :guilabel:`Allocate IP` dialog box, specify the following values.

   :guilabel:`Network`: Specify a network associated with the floating IP.

   :guilabel:`Description`: A human-readable description for the resource.

   :guilabel:`Batch Allocate`: Select this check box to specify the number
   of batch creation.

   :guilabel:`Count`: Specify the number of batch creation.

#. Click :guilabel:`OK`.

   The dashboard shows the floating ip on the :guilabel:`Floating IPs` tab.

create a security group
------------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Network` tab and
   click :guilabel:`Security Groups` category.

#. Click :guilabel:`Create Security Group`.

#. In the :guilabel:`Create Security Group` dialog box, specify :guilabel:`Name`
   and :guilabel:`Description`, click :guilabel:`OK` and the new security group
   is now displayed in the :guilabel:`Security Groups` list.
