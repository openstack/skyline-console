Contributing Documentation to Skyline Console
==============================================

This page provides guidance on how to provide documentation for those
who may not have previously been active writing documentation for
OpenStack.

Documentation Content
---------------------

To keep the documentation consistent across projects, and to maintain
quality, please follow the OpenStack `Writing style
<https://docs.openstack.org/doc-contrib-guide/writing-style.html>`_
guide.

Using RST
---------

OpenStack documentation uses reStructuredText to write documentation.
The files end with a ``.rst`` extension.  The ``.rst`` files are then
processed by Sphinx to build HTML based on the RST files.

.. note::
   Files that are to be included using the ``.. include::`` directive in an
   RST file should use the ``.inc`` extension.  If you instead use the ``.rst``
   this will result in the RST file being processed twice during the build and
   cause Sphinx to generate a warning during the build.

reStructuredText is a powerful language for generating web pages.  The
documentation team has put together an `RST conventions`_ page with information
and links related to RST.

.. _RST conventions: https://docs.openstack.org/doc-contrib-guide/rst-conv.html

Building Skyline Console's Documentation
------------------------------------------

To build documentation the following command should be used:

.. code-block:: console

   tox -e docs

When building documentation it is important to also run docs.

.. note::

   The tox documentation jobs (docs, releasenotes) are set up to treat Sphinx
   warnings as errors.  This is because many Sphinx warnings result in
   improperly formatted pages being generated, so we prefer to fix those right
   now, instead of waiting for someone to report a docs bug.

During the documentation build a number of things happen:

* All of the RST files under ``doc/source`` are processed and built.

  * The openstackdocs theme is applied to all of the files so that they
    will look consistent with all the other OpenStack documentation.
  * The resulting HTML is put into ``doc/build/html``.

After the build completes the results may be accessed via a web browser in
the ``doc/build/html`` directory structure.

Review and Release Process
--------------------------
Documentation changes go through the same review process as all other changes.

.. note::

   Reviewers can see the resulting web page output by clicking on
   ``openstack-tox-docs`` in the "Zuul check" table on the review,
   and then look for "Artifacts" > "Docs preview site".

   This is also true for the ``build-openstack-releasenotes`` check jobs.

Once a patch is approved it is immediately released to the docs.openstack.org
website and can be seen under Skyline Console's Documentation Page at
https://docs.openstack.org/skyline-console/latest\ .  When a new release is
cut a snapshot of that documentation will be kept at
``https://docs.openstack.org/skyline-console/<release>``.  Changes from
master can be backported to previous branches if necessary.

Finding something to contribute
-------------------------------

If you are reading the documentation and notice something incorrect or
undocumented, you can directly submit a patch following the advice set
out below.

There are also documentation bugs that other people have noticed that
you could address:

* https://bugs.launchpad.net/skyline-console/+bugs?field.tag=doc

.. note::
   If you don't see a bug listed, you can also try the tag 'docs' or
   'documentation'.  We tend to use 'doc' as the appropriate tag, but
   occasionally a bug gets tagged with a variant.
