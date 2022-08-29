.. _compute-tab:

=========================================
Launch and manage instances (Compute tab)
=========================================

The OpenStack Compute service provides a way to provision compute instances
(aka virtual servers). It supports creating virtual machines, baremetal
servers (through the use of ironic), and has limited support for system
containers. For detailed information, refer to the
`OpenStack Nova Guide <https://docs.openstack.org/nova/latest/>`__.

Create a key pair
-----------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Key Pairs` category.

#. Click :guilabel:`Create Keypair`.

#. In the :guilabel:`Create Volume` dialog box, select one of
   :guilabel:`Create Type` options:

   * :guilabel:`Create Keypair`: If you choose this option, enter a
     :guilabel:`Name`.

   * :guilabel:`Import Keypair`: If you choose this option, a new field for
     :guilabel:`Public Key` displays. Enter the :guilabel:`Name` of your key
     pair, copy the public key into the :guilabel:`Public Key` box.

#. Click :guilabel:`OK`.

   The Dashboard lists the key pair on the :guilabel:`Key Pairs` tab.

Launch an instance
------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Instances` category.

#. Click :guilabel:`Create Instance`.

#. On the :guilabel:`Create Instance` page, enter the instance values.

#. Click :guilabel:`Next: Network Config`.

#. Click :guilabel:`Next: System Config`.

#. Click :guilabel:`Next: Confirm Config` and confirm your choice.

   The instance are created and you can wait for a few seconds to
   follow the changes of the instance list data or manually refresh the data
   to get the final display result.

Create an instance snapshot
----------------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Instances` category.

#. Select an instance to create a snapshot from it.

#. In the :guilabel:`Action` column, select :guilabel:`Backups & Snapshots` and
   click :guilabel:`Create Snapshot`.

#. In the :guilabel:`Create Instance Snapshot` dialog box, enter a snapshot name.

#. Click :guilabel:`OK`.

   The dashboard shows the new instance snapshot in :guilabel:`Instance Snapshots` tab.

Control the state of an instance
---------------------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Instances` category.

#. Select the instance for which you want to change the state.

#. In the :guilabel:`Action` column of the instance, click
   :guilabel:`Instance Status` and select the status.

Allocate a floating IP address to an instance
----------------------------------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Instances` category.

#. In the :guilabel:`Action` column, select :guilabel:`Related Resources`
   and click :guilabel:`Associate Floating IP`.

#. In the :guilabel:`Associate Floating IP` dialog box, select
   :guilabel:`Instance IP` and :guilabel:`Floating Ip Address`.

#. Click :guilabel:`OK`.

.. note::

   To disassociate an IP address from an instance, click the
   :guilabel:`Disassociate Floating Ip` button.

Upload an image
---------------

Images are used to create virtual machine instances within the cloud.
For information about creating image files, see the
`OpenStack Glance Guide <https://docs.openstack.org/glance/latest/>`__.

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Compute` tab and
   click :guilabel:`Images` category.

#. Click :guilabel:`Create Image`.

#. On the :guilabel:`Create Image` page, enter the following values:

   :guilabel:`Name`: The name of the image.

   :guilabel:`Upload Type`: Select one of the following options:

   * Upload File: If choose this option, click :guilabel:`Click to Upload`
     to upload the binary image data file.

   * File URL: If choose this option, enter the :guilabel:`File URL`.

   :guilabel:`Format`: Select the image format (for example, QCOW2) for the image.

   :guilabel:`OS`: Select the image operating system (for example, CentOS).

   :guilabel:`OS Version`: The image operating system version.

   :guilabel:`OS Admin`: The administrator name of image operating system.
   in general, administrator for Windows, root for Linux.

   :guilabel:`Min System Disk (GiB)`: Amount of disk space in GB that is
   required to boot the image.

   :guilabel:`Min Memory (GiB)`: Amount of Memory in GB that is required
   to boot the image.

   :guilabel:`Protected`: Image protection for deletion.

   :guilabel:`Usage Type`: Select usage type (for example, Common Server)
   for the image.

   :guilabel:`Description`: A human-readable description for the resource.

#. Click :guilabel:`Confirm`.

   The image is queued to be uploaded. It might take some time before
   the status changes from Queued to Active.
