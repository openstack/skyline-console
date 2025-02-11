.. _docker-install-rhel:

Docker Install RHEL and CentOS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This section describes how to install and configure Skyline service.
Before you begin, you must have a ready OpenStack environment. At
least it includes ``keystone, glance, nova and neutron service``.

Prerequisites
-------------

Add the Docker Repository:
RHEL and CentOS does not come with Docker in the default repository. Therefore, you will need to add the Docker repository to your system:

   .. code-block:: console

      $ sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo

Install Docker Engine:
With the Docker repo added, you can now install the Docker engine using the following command:

   .. code-block:: console

      $ sudo dnf install docker-ce docker-ce-cli containerd.io

Start and Enable Docker:
Once the installation is complete, start the Docker service and enable it to launch at boot:

   .. code-block:: console

      $ sudo systemctl start docker
      $ sudo systemctl enable docker

Before you install and configure Skyline service, you must create a database.

#. To create the database, complete these steps:

   #. Use the database access client to connect to the database
      server as the ``root`` user:

      .. code-block:: console

        # mysql

   #. Create the ``skyline`` database:

      .. code-block:: console

        MariaDB [(none)]> CREATE DATABASE skyline DEFAULT CHARACTER SET \
         utf8 DEFAULT COLLATE utf8_general_ci;

   #. Grant proper access to the ``skyline`` database:

      .. code-block:: console

        MariaDB [(none)]> GRANT ALL PRIVILEGES ON skyline.* TO 'skyline'@'localhost' \
          IDENTIFIED BY 'SKYLINE_DBPASS';
        MariaDB [(none)]> GRANT ALL PRIVILEGES ON skyline.* TO 'skyline'@'%' \
          IDENTIFIED BY 'SKYLINE_DBPASS';

      Replace ``SKYLINE_DBPASS`` with a suitable password.

   #. Exit the database access client.

#. Source the ``admin`` credentials to gain access to admin-only
   CLI commands:

   .. code-block:: console

      $ . admin-openrc

#. To create the service credentials, complete these steps:

   #. Create a ``skyline`` user:

      .. code-block:: console

        $ openstack user create --domain default --password-prompt skyline

        User Password:
        Repeat User Password:
        +---------------------+----------------------------------+
        | Field               | Value                            |
        +---------------------+----------------------------------+
        | domain_id           | default                          |
        | enabled             | True                             |
        | id                  | 1qaz2wsx3edc4rfv5tgb6yhn7ujm8ikl |
        | name                | skyline                          |
        | options             | {}                               |
        | password_expires_at | None                             |
        +---------------------+----------------------------------+

   #. Add the ``admin`` role to the ``skyline`` user:

      .. code-block:: console

        $ openstack role add --project service --user skyline admin

      .. note::

        This command provides no output.

Install and configure components
--------------------------------

We will install Skyline service from docker image.

#. Pull Skyline service image from Docker Hub:

   .. code-block:: console

      $ sudo docker pull 99cloud/skyline:latest

#. Ensure that some folders of skyline have been created

   .. code-block:: console

      $ sudo mkdir -p /etc/skyline /var/log/skyline /var/lib/skyline /var/log/nginx

#. Configure ``/etc/skyline/skyline.yaml`` file

   .. note::

      Change the related configuration in ``/etc/skyline/skyline.yaml``. Detailed introduction
      of the configuration can be found in
      `OpenStack Skyline Settings <https://docs.openstack.org/skyline-apiserver/latest/configuration/settings.html>`__.

      .. code-block:: yaml

        default:
          database_url: mysql://skyline:SKYLINE_DBPASS@DB_SERVER:3306/skyline
          debug: true
          log_dir: /var/log
        openstack:
          keystone_url: http://KEYSTONE_SERVER:5000/v3/
          system_user_password: SKYLINE_SERVICE_PASSWORD

      Replace ``SKYLINE_DBPASS``, ``DB_SERVER``, ``KEYSTONE_SERVER`` and
      ``SKYLINE_SERVICE_PASSWORD`` with a correct value.

Finalize installation
---------------------

#. Run bootstrap server

   .. code-block:: console

      $ sudo docker run -d --name skyline_bootstrap \
        -e KOLLA_BOOTSTRAP="" \
        -v /etc/skyline/skyline.yaml:/etc/skyline/skyline.yaml \
        -v /var/log:/var/log \
        --net=host 99cloud/skyline:latest

   .. code-block:: text

      If you see the following message, it means that the bootstrap server is successful:

      + echo '/usr/local/bin/gunicorn -c /etc/skyline/gunicorn.py skyline_apiserver.main:app'
      + mapfile -t CMD
      ++ xargs -n 1
      ++ tail /run_command
      + [[ -n 0 ]]
      + cd /skyline-apiserver/
      + make db_sync
      alembic -c skyline_apiserver/db/alembic/alembic.ini upgrade head
      2022-08-19 07:49:16.004 | INFO     | alembic.runtime.migration:__init__:204 - Context impl MySQLImpl.
      2022-08-19 07:49:16.005 | INFO     | alembic.runtime.migration:__init__:207 - Will assume non-transactional DDL.
      + exit 0

#. Cleanup bootstrap server

   .. code-block:: console

      $ sudo docker rm -f skyline_bootstrap

#. Run skyline

   .. code-block:: console

      $ sudo docker run -d --name skyline --restart=always \
        -v /etc/skyline/skyline.yaml:/etc/skyline/skyline.yaml \
        -v /var/log:/var/log \
        --net=host 99cloud/skyline:latest

   .. note::

      The skyline image is both include skyline-apiserver and skyline-console.
      And you can visit the skyline UI ``https://xxxxx:9999``.
