.. _storage-tab:

=======================================
Create and manage volumes (Storage tab)
=======================================

A volume is a detachable block storage device similar to a USB hard drive.
You can attach a volume to a running instance or detach a volume and
attach it to another instance at any time. You can also create a snapshot
from or delete a volume. Only administrative users can create volume types.

OpenStack Block Storage enables you to add extra block-level storage to
your OpenStack Compute instances. For detailed information, refer to the
`OpenStack Cinder Guide
<https://docs.openstack.org/cinder/latest/admin/index.html>`__.

Create a volume
----------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volumes` category.

#. Click :guilabel:`Create Volume`.

#. On the :guilabel:`Create Volume` page, specify the following values.

   :guilabel:`Available Zone`: Select a availability zone for the volume.

   :guilabel:`Data Source Type`: Select one of the following options:

   * Blank Volume: If you choose this option, a new field for
     :guilabel:`Volume Type` displays. You can select the volume type
     from the list. You can create an empty volume. An empty volume does
     not contain a file system or a partition table.

   * Image: If you choose this option, a new field for
     :guilabel:`Operating System` displays. You can select the image
     from the list.

   * Volume Snapshot: If you choose this option, a new field for
     :guilabel:`Volume Snapshot` displays. You can select the
     snapshot from the list.

   :guilabel:`Volume Type`: Specify a volume type to choose an appropriate
   storage back end.

   :guilabel:`Capacity (GiB)`: Specify the size of the volume, in gibibytes (GiB).

   :guilabel:`Name`: Specify a name to identify the volume.

#. Click :guilabel:`Confirm`.

   You have successfully created the volume. You can view the volume from
   the :guilabel:`Volumes` tab.

Attach a volume to an instance
-------------------------------

After you create one or more volumes, you can attach them to instances.
You can attach a volume to one instance at a time.

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volumes` category.

#. Select the volume to add to an instance.

#. In the :guilabel:`Action` column, select :guilabel:`Instance Related`
   and click :guilabel:`Attach`.

#. In the :guilabel:`Attach` dialog box, select an instance.

#. Click :guilabel:`OK`.

   The dashboard shows the instance to which the volume is now attached
   and the device name.

You can view the status of a volume in the Volumes tab of the dashboard.
The volume is either Available or In-Use.

Now you can log in to the instance and mount, format, and use the disk.

Detach a volume from an instance
--------------------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volumes` category.

#. In the :guilabel:`Action` column of the volume, select
   :guilabel:`Instance Related` and click :guilabel:`Detach`.

#. In the :guilabel:`Detach` dialog box, select an instance.

#. Click :guilabel:`OK`.

   A message indicates whether the action was successful.

Create a snapshot from a volume
--------------------------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volumes` category.

#. Select a volume from which to create a snapshot.

#. In the :guilabel:`Action` column, select :guilabel:`Data Protection` and
   click :guilabel:`Create Snapshot`.

#. In the :guilabel:`Create Volume Snapshot` dialog box, enter a snapshot name.

#. Click :guilabel:`OK`.

   The dashboard shows the new volume snapshot in :guilabel:`Volume Snapshots` tab.

Edit a volume
--------------

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volumes` category.

#. In the :guilabel:`Action` column of the volume, click :guilabel:`Edit`.

#. In the :guilabel:`Edit` dialog box, update the name and description
   of the volume.

#. Click :guilabel:`OK`.

   .. note::

      You can extend a volume by using the :guilabel:`Extend Volume`
      option available in the :guilabel:`More` dropdown list and entering the
      new value for volume size.

Delete a volume
----------------

When you delete an instance, the data in its attached volumes is not
deleted.

#. Log in to the dashboard.

#. Select the appropriate project from the Switch Project menu at the top left.

#. On the :guilabel:`Console` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volumes` category.

#. Select the check boxes for the volumes that you want to delete.

#. Click :guilabel:`Delete` and confirm your choice.

   .. note::

    If you select the :guilabel:`cascading deletion` check box, when the
    volume has snapshots, the associated snapshot will be automatically
    deleted first, and then the volume will be deleted, thereby improving
    the success rate of deleting the volume.

   A message indicates whether the action was successful.
