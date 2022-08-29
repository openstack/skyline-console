Manage volumes (Storage tab)
============================

As an administrative user, you can manage volumes and volume types for users
in various projects. You can create and delete volume types, and you can view
and delete volumes. For more information, refer to the :ref:`storage-tab`.

Create a volume type
--------------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volume Types` category.

#. Click :guilabel:`Create Volume Type`.

#. In the :guilabel:`Create Volume Type` dialog box, specify the following values.

   :guilabel:`Name`: Specify a name to identify the volume type.

   :guilabel:`Description`: A human-readable description for the resource.

   :guilabel:`Shared`: "Shared" volume can be mounted on multiple instances.

   :guilabel:`Public`: Select this check box to make the volume type publicly visible.

   .. note::

     If you do not choose this check box, a new field for
     :guilabel:`Access Control` displays. You can select projects from the
     list to determine which projects are visible to the volume type.

#. Click :guilabel:`OK`.

   You have successfully created the volume type. You can view the volume
   type from the :guilabel:`Volume Types` tab.

Delete a volume type
--------------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Storage` tab and
   click :guilabel:`Volume Types` category.

#. Select the check boxes for the volume types that you want to delete.

#. Click :guilabel:`Delete` and confirm your choice.

   A message indicates whether the action was successful.
