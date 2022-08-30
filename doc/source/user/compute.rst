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

   :guilabel:`Available Zone`: The availability zone from which to launch the server.

   :guilabel:`Specification`: Select a flavor for your server instance.

   :guilabel:`Start Source`: Select one of the following options:

   * Image: If choose this option, a new field for :guilabel:`Operating System`
     displays. You can select the image from the list. And enter the size of the
     volume used as :guilabel:`System Disk` of the instance.

     .. note::

        click the :guilabel:`Deleted with the instance` option to delete
        the volume on deleting the instance.

   * Instance Snapshot: Using this option, you can boot from a volume
     snapshot and create a new volume by choosing :guilabel:`Instance Snapshot`
     from a list.

   * Bootable Volume: If you choose this option, a new field for
     :guilabel:`Bootable Volume` displays. You can select the volume from the list.

   :guilabel:`Data Disk`: The disks mounted on the instance.

#. Click :guilabel:`Next: Network Config`.

   You can choose :guilabel:`Networks`, :guilabel:`Ports` or a mix of both for
   the instance network config.

   :guilabel:`Networks`: Add a network to the instance. If you specify the networks,
   :guilabel:`Virtual LAN` and :guilabel:`Security Group` are required fields.

   :guilabel:`Virtual LAN`: Specify a subnet of the network and assign fixed IP
   address automatically or manually for the instance.

   :guilabel:`Security Group`: Security groups are a kind of cloud firewall that
   define which incoming network traffic is forwarded to instances.

   :guilabel:`Ports`: Activate the ports that you want to assign to the instance.

   .. note::

     The port executes its own security group rules by default.

#. Click :guilabel:`Next: System Config`.

   :guilabel:`Name`: The server name.

   :guilabel:`Login Type`: Select one of the following options:

   * Keypair: If you choose this option, a new field for
     :guilabel:`Keypair` displays. The key pair allows you to SSH into your
     newly created instance. You can select an existing key pair, import a
     key pair, or generate a new key pair.

   * Password: Enter the :guilabel:`Login Password` and confirm it. And you
     can login to the instance by using password.

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
