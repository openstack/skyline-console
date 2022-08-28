Manage instances (Compute tab)
==============================

As an administrative user, you can manage compute nodes. You can create
and delete flavors, and you can create and manage host aggregates.
For more information, refer to the :ref:`compute-tab`.

Manage compute hosts
--------------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Hypervisors` category.

#. Click :guilabel:`Compute Hosts` tab.

   On the :guilabel:`Compute Hosts` page, you can :guilabel:`Enable` or
   :guilabel:`Disable` the compute hosts.

Create a flavor
---------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Flavors` category.

#. Click :guilabel:`Create Flavor`.

#. On the :guilabel:`Params Setting` page, specify the following values.

   :guilabel:`Architecture`: Select one of the following options:

   * X86 Architecture: If choose this option, you can select
     :guilabel:`General Purpose`, :guilabel:`Compute Optimized`,
     :guilabel:`Memory Optimized` or :guilabel:`High Clock Speed` as
     flavor :guilabel:`Type`.

   * Heterogeneous Computing: If choose this option, you can
     select :guilabel:`Compute Optimized Type with GPU` or
     :guilabel:`Visualization Compute Optimized Type with GPU` as
     flavor :guilabel:`Type`.

   :guilabel:`Name`: Enter the flavor name.

   :guilabel:`CPU(Core)`: Enter the number of virtual CPUs to use.

   :guilabel:`Ram Size (GiB)`: Enter the amount of RAM to use, in gigabytes.

   :guilabel:`NUMA Nodes`: Enter the number of Non-Uniform Memory Access nodes.

#. Click :guilabel:`Next: Access Type Setting`.

#. On the :guilabel:`Access Type Setting` page, specify the following values.

   :guilabel:`Access Type`: Select one of the following options:

   * :guilabel:`Public``: Select this option to make the flavor publicly visible.

   * :guilabel:`Access Control`: If choose this option, you can select
     projects from :guilabel:`Access Control` list to determine which projects
     are visible to the flavor.

#. Click :guilabel:`Confirm`.

   The new flavor is now displayed in the :guilabel:`Flavors` list.

Delete a flavor
---------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Flavors` category.

#. Select the check boxes for the flavors that you want to delete.

#. Click :guilabel:`Delete` and confirm your choice.

   A message indicates whether the action was successful.

Create a host aggregate
-----------------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Host Aggregates` category.

#. Click :guilabel:`Host Aggregate` tab.

#. Click :guilabel:`Create Host Aggregate`.

#. In the :guilabel:`Create Host Aggregate` dialog box, specify the following values.

   -  :guilabel:`Name`: The host aggregate name.

   -  :guilabel:`Create new AZ`:

      -  If set this option to :guilabel:`Yes`, specify
         :guilabel:`New Availability Zone` name to create new availability zone.

      -  If set this option to :guilabel:`No`, select a
         :guilabel:`Availability Zone` of the host aggregate.

#. Click :guilabel:`OK`.

Manage host aggregates
----------------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Host Aggregates` category.

#. Click :guilabel:`Host Aggregate` tab.

#. In the :guilabel:`Action` column of the host aggregate, click :guilabel:`Manage Host`.

#. In the :guilabel:`Manage Host` dialog box, add hosts to the aggregate or
   remove hosts from it.

#. Click :guilabel:`OK`.
