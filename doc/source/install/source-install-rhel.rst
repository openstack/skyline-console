.. _source-install-rhel:

Source Install RHEL or CentOS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This section describes how to install and configure the Skyline Console
service. Before you begin, you must have a ready OpenStack environment. At
least it includes ``keystone, glance, nova, neutron and skyline-apiserver service``.

For more information about skyline-apiserver installation, refer to the
`OpenStack Skyline APIServer Guide
<https://docs.openstack.org/skyline-apiserver/latest/install/source-install-rhel.html>`__.

Prerequisites
-------------

Install system dependencies
`PowerTools/CRB repository should be already enabled
<https://docs.openstack.org/install-guide/environment-packages-rdo.html#prerequisites>`__.

   .. code-block:: shell

      sudo dnf update
      sudo dnf install git python3-pip python3-wheel nginx make tar wget
      sudo dnf install xorg-x11-server-Xvfb gtk2-devel gtk3-devel libnotify-devel nss

#. Install nvm (version control system for Node.js)

   .. code:: shell

      wget -P /root/ --tries=10 --retry-connrefused --waitretry=60 --no-dns-cache --no-cache  https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh
      sh /root/install.sh
      . /root/.nvm/nvm.sh

#. Install nodejs

   .. code:: shell

      nvm install --lts=gallium
      nvm alias default lts/gallium
      nvm use default

#. Check version node and npm

   .. code:: shell

      node -v
      v16.*.*

   .. code:: shell

      npm -v
      8.*.*

#. Install yarn

   .. code:: shell

      npm install -g yarn

Install and configure components
--------------------------------

We will install the Skyline Console service from source code.

#. Git clone the repository from OpenDev (GitHub)

   .. code-block:: shell

      cd /root
      git clone https://opendev.org/openstack/skyline-console.git

#. Install skyline-console

   .. code-block:: shell

      cd /root/skyline-console
      make package
      sudo python3 -m pip install --force-reinstall dist/skyline_console-*.whl

#. Ensure that skyline folders have been created

   .. code-block:: shell

      sudo mkdir -p /etc/skyline /var/log/skyline

   .. note::
      Ensure that skyline.yaml file is available in /etc/skyline folder.
      For more information about skyline.yml, see
      `OpenStack Skyline Settings <https://docs.openstack.org/skyline-apiserver/latest/configuration/settings.html>`__.

#. Generate nginx configuration file

   .. code-block:: shell

      skyline-nginx-generator -o /etc/nginx/nginx.conf
      sudo sed -i "s/server .* fail_timeout=0;/server 0.0.0.0:28000 fail_timeout=0;/g" /etc/nginx/nginx.conf

   .. note::

      We need to change the ``upstream skyline`` value in ``/etc/nginx/nginx.conf`` to ``0.0.0.0:28000``.
      Default value is ``unix:/var/lib/skyline/skyline.sock``.

Finalize installation
---------------------

Start nginx service

.. code-block:: shell

   sudo systemctl start nginx.service
   sudo systemctl enable nginx.service
