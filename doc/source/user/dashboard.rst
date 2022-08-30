.. _skyline-dashboard:

===================
Openstack Dashboard
===================

Console page
~~~~~~~~~~~~~

Home tab
---------

Home tab shows user information and details of quota about
Compute, Storage, Network, etc. And it provides a button to quickly
jump to Instances, Volumes, Networks and Routers page.

Compute tab
------------

* :guilabel:`Instances`: View, launch, delete, create a snapshot from,
  attach or detach interface to, attach or detach volume to,
  associate floating ip to, manage security group of, stop, pause,
  lock, shelve, suspend, reboot or soft reboot instances, modify
  instance tags, or connect to them through VNC.

* :guilabel:`Instance snapshots`: View, edit, delete instance snapshots,
  launch instances or create volumes from them.

* :guilabel:`Flavors`: View flavors.

* :guilabel:`Server Groups`: View, create or delete server groups.

* :guilabel:`Images`: View, create, edit, delete images, launch instances
  or create volumes from them.

* :guilabel:`Key Pairs`: View, create, edit, import, and delete key pairs.

Storage tab
------------

* :guilabel:`Volumes`: View, create, edit, and delete volumes. Create volume
  snapshot, create volume backup, clone volume, extend volume or change volume
  type, attach or detach them to instance.

* :guilabel:`Volume Backups`: View, create, edit, and delete volume backups.
  Also, create volumes from them and restore backup.

* :guilabel:`Volume Snapshots`: View, create, edit, delete volume snapshots.
  And create volumes from them.

Network tab
------------

* :guilabel:`Networks`: View, create, edit and delete networks.

* :guilabel:`Ports`: View, create, edit, delete ports and manage
  security group for ports.

* :guilabel:`Routers`: View, create, edit, delete and manage routers.

* :guilabel:`Floating IPs`: Allocate IP addresses or release them.

* :guilabel:`Topology`: View the network topology.

* :guilabel:`Security Groups`: View, create, edit, and delete security
  groups and security group rules.

User page
~~~~~~~~~~

User center tab
----------------

User center shows the details of user, including Username, Email, Phone,
Real Name and User ID.

Application credentials tab
----------------------------

Application credentials provide a way to delegate a user authorization
to an application without sharing the user password authentication.
This is a useful security measure, especially for situations where
the user identification is provided by an external source, such as
LDAP or a single-sign-on service. Instead of storing user passwords in
config files, a user creates an application credential for a specific
project, with all or a subset of the role assignments they have on
that project, and then stores the application credential identifier
and secret in the config file.

Administrator page
~~~~~~~~~~~~~~~~~~

Home tab
---------

Home tab shows basic platform information (the numbers of projects, users,
nodes), virtual resource usage (CPU usages, memory usages), compute and
network services status.

Compute tab
------------

* :guilabel:`Instances`: View, stop, suspend, cold or live migrate,
  soft or hard reboot, and delete instances that belong to all projects.
  Also, view the log for an instance or access an instance through VNC.

* :guilabel:`Instance snapshots`: View, edit, delete instance snapshots.

* :guilabel:`Flavors`: View, create, edit, manage metadata for,
  and delete flavors.

* :guilabel:`Server Groups`: View, create or delete server groups.

* :guilabel:`Images`: View, create, edit, manage metadata for, and delete
  images.

* :guilabel:`Hypervisors`: View the hypervisor summary. Also, view and manage
  compute nodes.

* :guilabel:`Host Aggregates`: View, create, manage metadata for, edit and
  delete host aggregates. View the list of availability zones.

Storage tab
------------

* :guilabel:`Volumes`: View, update status for, migrate and delete volumes.

* :guilabel:`Volume Backups`: View and delete restore backup.

* :guilabel:`Volume Snapshots`: View and delete volume snapshots.

* :guilabel:`Volume Types`: View, create, edit, encrypt, manage access
  for and delete volume types.

* :guilabel:`Storage Backends`: View storage backends.

Network tab
------------

* :guilabel:`Networks`: View, create and delete networks.

* :guilabel:`Ports`: View and delete ports.

* :guilabel:`Routers`: View and delete routers.

* :guilabel:`Floating IPs`: Allocate IP addresses or release them.

* :guilabel:`Security Groups`: View and delete security groups.

Identity tab
------------

* :guilabel:`Domains`: View, create, edit, enable, disable and delete domains.

* :guilabel:`Projects`: View, create, edit, enable, disable and delete
  projects. Also, manage users or user groups of projects, modify tags for them.

* :guilabel:`Users`: View, create, edit, enable, disable, delete users. And
  edit System Permission of users, update user password.

* :guilabel:`User Groups`: View, create, edit and delete user groups.

* :guilabel:`Roles`:  View, create, edit and delete roles.

Global setting tab
------------------

* :guilabel:`System Info`: Use the following tabs to view the service
  information:

  * :guilabel:`Services`: View a list of the services.

  * :guilabel:`Compute Services`: View a list of all Compute services and
    enable or disable them.

  * :guilabel:`Network Agents`: View the network agents and enable or
    disable them.

  * :guilabel:`Block Storage Services`: View a list of all Block Storage
    services and enable or disable them.

  * :guilabel:`Orchestration Services`: View a list of all Orchestration
    services.

* :guilabel:`System Config`: View, edit and reset system config.

* :guilabel:`Metadata Definitions`: View, edit and delete system
  metadata definitions.
