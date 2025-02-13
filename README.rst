====================================
Skyline (OpenStack Modern Dashboard)
====================================

Skyline Console is a modern dashboard for OpenStack - UI.

* Project documentation: https://docs.openstack.org/skyline-console/latest/
* Release management: https://launchpad.net/skyline-console
* Installing Guide: https://docs.openstack.org/skyline-console/latest/install/
* Issue tracking: https://launchpad.net/skyline-console
* Release notes: https://docs.openstack.org/releasenotes/skyline-console/
* Wiki: https://wiki.openstack.org/wiki/Skyline

.. image:: https://governance.openstack.org/tc/badges/skyline-console.svg
    :target: https://governance.openstack.org/tc/reference/tags/

Using Skyline
=============

See ``doc/source/install/index.rst`` about how to install Skyline in your OpenStack setup. It describes the example steps and has pointers for more detailed settings and configurations.

It is also available at `Installing Guide <https://docs.openstack.org/skyline-console/latest/install/>`__.

Getting Started for Developers
==============================

`Development Guide <https://docs.openstack.org/skyline-console/latest/development/>`_
describes how to setup Skyline development environment and start development.

Building Contributor Documentation
==================================

This documentation is written by contributors, for contributors.

The source is maintained in the ``doc/source`` directory using
`reStructuredText`_ and built by `Sphinx`_

.. _reStructuredText: https://docutils.sourceforge.net/rst.html
.. _Sphinx: https://sphinx-doc.org/

Some of the diagrams are generated using the ``dot`` language
  from Graphviz. See the `Graphviz documentation <https://www.graphviz.org/>`_
  for Graphviz and dot language usage information.

To build the docs, use::

  $ tox -e docs
