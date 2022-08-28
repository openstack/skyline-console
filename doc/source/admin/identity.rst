Manage projects, users and roles (Identity tab)
================================================

OpenStack administrators can create projects, create accounts for new users
and create roles.

A project is the base unit of resource ownership. Resources are owned by
a specific project. A project is owned by a specific domain. A role is a
personality that a user assumes to perform a specific set of operations.
A role includes a set of rights and privileges. A user is an individual
consumer that is owned by a domain. A role explicitly associates a user
with projects or domains. A user with no assigned roles has no access
to OpenStack resources.

OpenStack Identity Service is the module in the OpenStack framework that
manages the authentication, service rules and service token functions.
For detailed information, refer to the
`OpenStack Keystone Guide <https://docs.openstack.org/keystone/latest/>`__.

Create a role
-------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Roles` category.

#. Click :guilabel:`Create Role`.

#. In the :guilabel:`Create Role` dialog box, enter the role :guilabel:`Name`
   and :guilabel:`Description`.

#. Click :guilabel:`OK`.

   The new role is now displayed in the :guilabel:`Roles` list.

Edit a role
-----------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Roles` category.

#. In the :guilabel:`Action` column of the role, click :guilabel:`Edit`.

#. In the :guilabel:`Edit` dialog box, update :guilabel:`Name` and
   :guilabel:`Description` of the role.

#. Click :guilabel:`OK`.

   A message indicates whether the action was successful.

Delete a role
--------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Roles` category.

#. Select the check boxes for the roles that you want to delete.

#. Click :guilabel:`Delete` and confirm your choice.

   A message indicates whether the action was successful.

Add a new project
-----------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Projects` category.

#. Click :guilabel:`Create Project`.

#. In the :guilabel:`Create Project` dialog box, enter the Project
   :guilabel:`Name`, :guilabel:`Description`, :guilabel:`Status`
   and :guilabel:`Affiliated Domain`.

#. Click :guilabel:`OK`.

   The new project is now displayed in the :guilabel:`Projects` list.

Delete a project
----------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Projects` category.

#. Select the check boxes for the projects that you want to delete.

#. Click :guilabel:`Delete` and confirm your choice.

   A message indicates whether the action was successful.

Update a project
----------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Projects` category.

#. In the :guilabel:`Action` column of the project, click :guilabel:`Edit`.

#. In the :guilabel:`Edit` dialog box, update :guilabel:`Name` and
   :guilabel:`Description` of the project.

#. Click :guilabel:`OK`.

   A message indicates whether the action was successful.

   .. note::

      You can enable or disable the project by using the :guilabel:`Enable` or
      :guilabel:`Forbidden` options available in the :guilabel:`More` dropdown
      list.

Add a new user
---------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Users` category.

#. On the :guilabel:`Create User` page, enter the user :guilabel:`User Name`,
   :guilabel:`Password`, :guilabel:`Confirm Password`, :guilabel:`Email`,
   :guilabel:`Phone`, :guilabel:`Real Name` and :guilabel:`Status`.

   If you choose :guilabel:`Advanced Options`, new fields for
   :guilabel:`Select Project` and :guilabel:`Select User Group` display. You can
   assign role to user on project. You can also add user to group.

#. Click :guilabel:`Confirm`.

   The new user is now displayed in the :guilabel:`Users` list.

Delete a user
--------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Users` category.

#. Select the check boxes for the users that you want to delete.

#. Click :guilabel:`Delete` and confirm your choice.

   A message indicates whether the action was successful.

Update a user
-------------

#. Log into the OpenStack Dashboard as the Admin user.

#. On the :guilabel:`Administrator` page, open the :guilabel:`Identity` tab and
   click :guilabel:`Users` category.

#. In the :guilabel:`Action` column of the user, click :guilabel:`Edit`.

#. In the :guilabel:`Edit` dialog box, update :guilabel:`User Name`,
   :guilabel:`Description`, :guilabel:`Email`, :guilabel:`Phone` and
   :guilabel:`Real Name` of the user.

#. Click :guilabel:`OK`.

   A message indicates whether the action was successful.

   .. note::

      You can enable or disable the user by using the :guilabel:`Enable` or
      :guilabel:`Forbidden` options available in the :guilabel:`More` dropdown
      list.
